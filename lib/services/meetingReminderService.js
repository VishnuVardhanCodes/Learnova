import {
  MEETINGS_COLLECTION,
  MEETING_STATUS,
  serializeMeeting,
} from "./meetingService";

const REMINDER_WINDOWS = [
  { key: "twentyFourHour", hoursBefore: 24, label: "24 hours" },
  { key: "oneHour", hoursBefore: 1, label: "1 hour" },
];

function getMeetingDateTime(meetingDate, startTime) {
  return new Date(`${meetingDate}T${startTime}:00`);
}

/**
 * Process meeting reminders for approved upcoming meetings.
 * Sends dashboard notifications when within 24h or 1h of meeting start.
 * Future-ready for EmailJS integration via type: meeting_reminder.
 */
export async function processMeetingReminders(db) {
  const now = new Date();
  const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const meetings = await db
    .collection(MEETINGS_COLLECTION)
    .find({
      status: MEETING_STATUS.APPROVED,
      meetingDate: {
        $gte: now.toISOString().slice(0, 10),
        $lte: in48Hours.toISOString().slice(0, 10),
      },
    })
    .toArray();

  let sent = 0;

  for (const meeting of meetings) {
    const meetingStart = getMeetingDateTime(meeting.meetingDate, meeting.startTime);
    const msUntil = meetingStart.getTime() - now.getTime();
    const hoursUntil = msUntil / (1000 * 60 * 60);

    if (hoursUntil <= 0) continue;

    const reminderSent = meeting.reminderSent || {
      twentyFourHour: false,
      oneHour: false,
    };

    for (const window of REMINDER_WINDOWS) {
      if (reminderSent[window.key]) continue;

      const shouldSend =
        window.hoursBefore === 24
          ? hoursUntil <= 24 && hoursUntil > 1
          : hoursUntil <= 1 && hoursUntil > 0;

      if (!shouldSend) continue;

      const message = `Reminder: Parent-teacher meeting with ${meeting.teacherName} in ${window.label} (${meeting.meetingDate} at ${meeting.startTime}).`;

      await Promise.all([
        db.collection("notifications").insertOne({
          userId: meeting.parentId,
          message,
          type: "meeting_reminder",
          meetingId: meeting._id.toString(),
          read: false,
          createdAt: now,
        }),
        db.collection("notifications").insertOne({
          userId: meeting.teacherId,
          message,
          type: "meeting_reminder",
          meetingId: meeting._id.toString(),
          read: false,
          createdAt: now,
        }),
      ]);

      await db.collection(MEETINGS_COLLECTION).updateOne(
        { _id: meeting._id },
        { $set: { [`reminderSent.${window.key}`]: true, updatedAt: now } }
      );

      sent += 1;
    }
  }

  return { processed: meetings.length, remindersSent: sent };
}

export function getUpcomingReminderMeetings(meetings) {
  const now = new Date();
  return meetings
    .filter((m) => m.status === MEETING_STATUS.APPROVED)
    .map((m) => {
      const start = getMeetingDateTime(m.meetingDate, m.startTime);
      const hoursUntil = (start.getTime() - now.getTime()) / (1000 * 60 * 60);
      return {
        ...serializeMeeting(m),
        hoursUntil: Math.round(hoursUntil * 10) / 10,
        needsReminder: hoursUntil > 0 && hoursUntil <= 24,
      };
    })
    .filter((m) => m.hoursUntil > 0);
}
