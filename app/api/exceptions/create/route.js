import { connectDb } from "@/lib/mongodb";
import { verifyFirebaseToken } from "@/lib/firebase-admin";

export async function POST(request) {
  try {
    // Get the authorization header
    const authorization = request.headers.get("authorization");
    const token = authorization?.split(" ")[1];

    // Verify Firebase token
    const decodedToken = await verifyFirebaseToken(token);

    if (!decodedToken) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    // Connect to database
    const db = await connectDb();

    const exceptionData = {
      ...body,
      studentEmail: decodedToken.email,
      status: "pending", // Default status
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("exceptions").insertOne(exceptionData);

    return Response.json(
      {
        success: true,
        data: {
          id: result.insertedId,
          message: "Exception request created successfully",
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Exception creation error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
