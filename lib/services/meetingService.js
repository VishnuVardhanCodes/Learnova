import { connectDb } from "@/lib/mongodb";
import { initFirebaseAdmin, getUserProfile } from "@/lib/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { ObjectId } from "mongodb";

export const MEETINGS_COLLECTION = "parent_teacher_meetings";
export const AVAILABILITY_COLLECTION = "teacher_availability";

export const MEETING_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const SLOT_DURATION_MINUTES = 30;
const ACTIVE_STATUSES = [MEETING_STATUS.PENDING, MEETING_STATUS.APPROVED];

export function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function getDayNameFromDate(dateStr) {
  const date = new Date(`${dateStr}T12:00:00`);
  return DAYS_OF_WEEK[date.getDay()];
}

export function isPastDate(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const meetingDate = new Date(`${dateStr}T00:00:00`);
  return meetingDate < today;
}

export function isPastDateTime(dateStr, startTime) {
  const meetingStart = new Date(`${dateStr}T${startTime}:00`);
  return meetingStart <= new Date();
}

export function serializeMeeting(doc) {
  if (!doc) return null;
  return {
    ...doc,
    _id: doc._id?.toString?.() || doc._id,
    createdAt: doc.createdAt?.toISOString?.() || doc.createdAt,
    updatedAt: doc.updatedAt?.toISOString?.() || doc.updatedAt,
  };
}

export async function ensureMeetingIndexes(db) {
  try {
    await Promise.all([
      db.collection(MEETINGS_COLLECTION).createIndex(
        { parentId: 1, status: 1 },
        { background: true }
      ),
      db.collection(MEETINGS_COLLECTION).createIndex(
        { teacherId: 1, status: 1 },
        { background: true }
      ),
      db.collection(MEETINGS_COLLECTION).createIndex(
        { instituteId: 1, status: 1 },
        { background: true }
      ),
      db.collection(MEETINGS_COLLECTION).createIndex(
        { teacherId: 1, meetingDate: 1, startTime: 1 },
        { background: true }
      ),
      db.collection(MEETINGS_COLLECTION).createIndex(
        { meetingDate: 1, status: 1 },
        { background: true }
      ),
      db.collection(AVAILABILITY_COLLECTION).createIndex(
        { teacherId: 1 },
        { unique: true, background: true }
      ),
    ]);
  } catch {
    // best-effort
  }
}

export async function getTeacherAvailability(db, teacherId) {
  const doc = await db
    .collection(AVAILABILITY_COLLECTION)
    .findOne({ teacherId });
  return doc || { teacherId, schedule: [] };
}

export async function saveTeacherAvailability(db, teacherId, instituteId, schedule) {
  const now = new Date();
  await db.collection(AVAILABILITY_COLLECTION).updateOne(
    { teacherId },
    {
      $set: {
        teacherId,
        instituteId,
        schedule,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  );
  return getTeacherAvailability(db, teacherId);
}

function slotOverlaps(startA, endA, startB, endB) {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);
  return aStart < bEnd && bStart < aEnd;
}

export function generateTimeSlots(daySchedule, bookedMeetings = []) {
  const slots = [];

  for (const window of daySchedule.slots || []) {
    let cursor = timeToMinutes(window.startTime);
    const windowEnd = timeToMinutes(window.endTime);

    while (cursor + SLOT_DURATION_MINUTES <= windowEnd) {
      const startTime = minutesToTime(cursor);
      const endTime = minutesToTime(cursor + SLOT_DURATION_MINUTES);

      const isBooked = bookedMeetings.some((m) =>
        slotOverlaps(startTime, endTime, m.startTime, m.endTime)
      );

      if (!isBooked) {
        slots.push({ startTime, endTime });
      }
      cursor += SLOT_DURATION_MINUTES;
    }
  }

  return slots;
}

export async function getAvailableSlots(db, teacherId, meetingDate) {
  const availability = await getTeacherAvailability(db, teacherId);
  const dayName = getDayNameFromDate(meetingDate);
  const daySchedule = availability.schedule?.find((d) => d.day === dayName);

  if (!daySchedule?.slots?.length) {
    return [];
  }

  const booked = await db
    .collection(MEETINGS_COLLECTION)
    .find({
      teacherId,
      meetingDate,
      status: { $in: ACTIVE_STATUSES },
    })
    .project({ startTime: 1, endTime: 1 })
    .toArray();

  return generateTimeSlots(daySchedule, booked);
}

export async function validateBooking(db, payload) {
  const {
    teacherId,
    parentId,
    meetingDate,
    startTime,
    endTime,
    instituteId,
  } = payload;

  if (isPastDate(meetingDate)) {
    throw new Error("Cannot book meetings in the past.");
  }

  if (isPastDateTime(meetingDate, startTime)) {
    throw new Error("Cannot book a time slot that has already passed.");
  }

  const availability = await getTeacherAvailability(db, teacherId);
  const dayName = getDayNameFromDate(meetingDate);
  const daySchedule = availability.schedule?.find((d) => d.day === dayName);

  if (!daySchedule?.slots?.length) {
    throw new Error("Teacher is not available on this day.");
  }

  const fitsWindow = daySchedule.slots.some((window) => {
    const slotStart = timeToMinutes(startTime);
    const slotEnd = timeToMinutes(endTime);
    return (
      slotStart >= timeToMinutes(window.startTime) &&
      slotEnd <= timeToMinutes(window.endTime)
    );
  });

  if (!fitsWindow) {
    throw new Error("Selected time is outside teacher availability.");
  }

  const duplicate = await db.collection(MEETINGS_COLLECTION).findOne({
    teacherId,
    meetingDate,
    startTime,
    status: { $in: ACTIVE_STATUSES },
  });

  if (duplicate) {
    throw new Error("This time slot is already booked.");
  }

  const parentDuplicate = await db.collection(MEETINGS_COLLECTION).findOne({
    parentId,
    teacherId,
    meetingDate,
    startTime,
    status: { $in: ACTIVE_STATUSES },
  });

  if (parentDuplicate) {
    throw new Error("You already have a booking at this time.");
  }

  if (instituteId) {
    const teacherProfile = await getUserProfile(teacherId);
    if (
      teacherProfile?.instituteId &&
      teacherProfile.instituteId !== instituteId
    ) {
      throw new Error("Teacher does not belong to this institute.");
    }
  }

  return true;
}

export async function verifyParentStudentLink(parentId, studentId) {
  if (!studentId) return true;
  initFirebaseAdmin();
  const firestore = getFirestore();
  const linkId = `${parentId}_${studentId}`;
  const link = await firestore.collection("parent_student_links").doc(linkId).get();
  return link.exists;
}

export async function bookMeeting(db, data) {
  await validateBooking(db, data);

  const now = new Date();
  const meeting = {
    parentId: data.parentId,
    parentName: data.parentName,
    teacherId: data.teacherId,
    teacherName: data.teacherName,
    instituteId: data.instituteId,
    studentId: data.studentId || null,
    studentName: data.studentName || null,
    meetingTitle: data.meetingTitle,
    meetingReason: data.meetingReason,
    meetingDate: data.meetingDate,
    startTime: data.startTime,
    endTime: data.endTime,
    status: MEETING_STATUS.PENDING,
    notes: "",
    teacherNotes: "",
    reminderSent: { twentyFourHour: false, oneHour: false },
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection(MEETINGS_COLLECTION).insertOne(meeting);

  await db.collection("notifications").insertOne({
    userId: data.teacherId,
    message: `New meeting request from ${data.parentName} on ${data.meetingDate} at ${data.startTime}.`,
    type: "meeting_request",
    meetingId: result.insertedId.toString(),
    read: false,
    createdAt: now,
  });

  return serializeMeeting({ ...meeting, _id: result.insertedId });
}

export async function approveMeeting(db, meetingId, teacherId, teacherNotes = "") {
  const meeting = await db.collection(MEETINGS_COLLECTION).findOne({
    _id: new ObjectId(meetingId),
  });

  if (!meeting) throw new Error("Meeting not found.");
  if (meeting.teacherId !== teacherId) {
    throw new Error("Unauthorized to approve this meeting.");
  }
  if (meeting.status !== MEETING_STATUS.PENDING) {
    throw new Error("Only pending meetings can be approved.");
  }

  const now = new Date();
  await db.collection(MEETINGS_COLLECTION).updateOne(
    { _id: meeting._id },
    {
      $set: {
        status: MEETING_STATUS.APPROVED,
        teacherNotes,
        updatedAt: now,
      },
    }
  );

  await db.collection("notifications").insertOne({
    userId: meeting.parentId,
    message: `Your meeting with ${meeting.teacherName} on ${meeting.meetingDate} at ${meeting.startTime} has been approved.`,
    type: "meeting_approved",
    meetingId: meetingId,
    read: false,
    createdAt: now,
  });

  return serializeMeeting({
    ...meeting,
    status: MEETING_STATUS.APPROVED,
    teacherNotes,
    updatedAt: now,
  });
}

export async function rejectMeeting(db, meetingId, teacherId, teacherNotes = "") {
  const meeting = await db.collection(MEETINGS_COLLECTION).findOne({
    _id: new ObjectId(meetingId),
  });

  if (!meeting) throw new Error("Meeting not found.");
  if (meeting.teacherId !== teacherId) {
    throw new Error("Unauthorized to reject this meeting.");
  }
  if (meeting.status !== MEETING_STATUS.PENDING) {
    throw new Error("Only pending meetings can be rejected.");
  }

  const now = new Date();
  await db.collection(MEETINGS_COLLECTION).updateOne(
    { _id: meeting._id },
    {
      $set: {
        status: MEETING_STATUS.REJECTED,
        teacherNotes,
        updatedAt: now,
      },
    }
  );

  await db.collection("notifications").insertOne({
    userId: meeting.parentId,
    message: `Your meeting request with ${meeting.teacherName} on ${meeting.meetingDate} was declined.`,
    type: "meeting_rejected",
    meetingId: meetingId,
    read: false,
    createdAt: now,
  });

  return serializeMeeting({
    ...meeting,
    status: MEETING_STATUS.REJECTED,
    teacherNotes,
    updatedAt: now,
  });
}

export async function cancelMeeting(db, meetingId, userId, role) {
  const meeting = await db.collection(MEETINGS_COLLECTION).findOne({
    _id: new ObjectId(meetingId),
  });

  if (!meeting) throw new Error("Meeting not found.");

  const canCancel =
    meeting.parentId === userId ||
    meeting.teacherId === userId ||
    role === "admin" ||
    role === "institute";

  if (!canCancel) throw new Error("Unauthorized to cancel this meeting.");

  if (
    ![MEETING_STATUS.PENDING, MEETING_STATUS.APPROVED].includes(meeting.status)
  ) {
    throw new Error("This meeting cannot be cancelled.");
  }

  const now = new Date();
  await db.collection(MEETINGS_COLLECTION).updateOne(
    { _id: meeting._id },
    { $set: { status: MEETING_STATUS.CANCELLED, updatedAt: now } }
  );

  const notifyId =
    meeting.parentId === userId ? meeting.teacherId : meeting.parentId;

  await db.collection("notifications").insertOne({
    userId: notifyId,
    message: `Meeting on ${meeting.meetingDate} at ${meeting.startTime} has been cancelled.`,
    type: "meeting_cancelled",
    meetingId: meetingId,
    read: false,
    createdAt: now,
  });

  return serializeMeeting({
    ...meeting,
    status: MEETING_STATUS.CANCELLED,
    updatedAt: now,
  });
}

export async function autoCompletePastMeetings(db) {
  const today = new Date().toISOString().slice(0, 10);
  await db.collection(MEETINGS_COLLECTION).updateMany(
    {
      status: MEETING_STATUS.APPROVED,
      meetingDate: { $lt: today },
    },
    { $set: { status: MEETING_STATUS.COMPLETED, updatedAt: new Date() } }
  );
}

export async function getMeetingsForUser(db, userId, role, filters = {}) {
  await autoCompletePastMeetings(db);

  let query = {};

  if (role === "parent") {
    query.parentId = userId;
  } else if (role === "teacher") {
    query.teacherId = userId;
  } else if (role === "institute" || role === "admin") {
    if (filters.instituteId) query.instituteId = filters.instituteId;
  } else {
    throw new Error("Unauthorized role for meetings.");
  }

  if (filters.status) query.status = filters.status;

  const meetings = await db
    .collection(MEETINGS_COLLECTION)
    .find(query)
    .sort({ meetingDate: -1, startTime: -1 })
    .limit(filters.limit || 100)
    .toArray();

  return meetings.map(serializeMeeting);
}

export function groupMeetingHistory(meetings) {
  const today = new Date().toISOString().slice(0, 10);

  return {
    upcoming: meetings.filter(
      (m) =>
        [MEETING_STATUS.PENDING, MEETING_STATUS.APPROVED].includes(m.status) &&
        m.meetingDate >= today
    ),
    pending: meetings.filter((m) => m.status === MEETING_STATUS.PENDING),
    completed: meetings.filter((m) => m.status === MEETING_STATUS.COMPLETED),
    cancelled: meetings.filter(
      (m) =>
        m.status === MEETING_STATUS.CANCELLED ||
        m.status === MEETING_STATUS.REJECTED
    ),
  };
}

export async function getInstituteMeetingStats(db, instituteId) {
  const pipeline = [
    { $match: { instituteId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ];

  const statusCounts = await db
    .collection(MEETINGS_COLLECTION)
    .aggregate(pipeline)
    .toArray();

  const teacherPipeline = [
    { $match: { instituteId, status: { $ne: MEETING_STATUS.CANCELLED } } },
    {
      $group: {
        _id: "$teacherId",
        teacherName: { $last: "$teacherName" },
        meetingCount: { $sum: 1 },
      },
    },
    { $sort: { meetingCount: -1 } },
    { $limit: 5 },
  ];

  const topTeachers = await db
    .collection(MEETINGS_COLLECTION)
    .aggregate(teacherPipeline)
    .toArray();

  const stats = {
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
  };

  statusCounts.forEach((s) => {
    stats[s._id] = s.count;
    stats.total += s.count;
  });

  return {
    ...stats,
    topTeachers: topTeachers.map((t) => ({
      teacherId: t._id,
      teacherName: t.teacherName,
      meetingCount: t.meetingCount,
    })),
  };
}

export async function getTeachersForInstitute(instituteId) {
  initFirebaseAdmin();
  const firestore = getFirestore();
  const snapshot = await firestore
    .collection("users")
    .where("instituteId", "==", instituteId)
    .where("role", "==", "teacher")
    .limit(50)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    fullName: doc.data().fullName || doc.data().name || "Teacher",
    email: doc.data().email,
    instituteId: doc.data().instituteId,
  }));
}

export function computeMeetingStats(meetings) {
  const history = groupMeetingHistory(meetings);
  return {
    total: meetings.length,
    upcoming: history.upcoming.length,
    pending: history.pending.length,
    completed: history.completed.length,
    cancelled: history.cancelled.length,
  };
}
