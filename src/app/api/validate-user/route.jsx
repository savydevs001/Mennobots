import { NextResponse } from "next/server";
import db from "@/utils/db";
import User from "@/models/User";

/**
 * API route to validate a user by their ID.
 * @param {Request} req - The request object.
 * @returns {Response} - JSON response indicating whether the user exists.
 */
export async function POST(req) {
  try {
    // Parse the request body to extract the userId
    const body = await req.json();
    const { userId } = body;
    // console.log(userId)

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required." },
        { status: 400 }
      );
    }

    // Connect to the database
    await db();

    // Validate the user
    const user = await User.findById(userId);

    if (user) {
      return NextResponse.json({ success: true, message: "User exists." });
    } else {
      return NextResponse.json(
        { success: false, message: "User does not exist." },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error validating user:", error.message);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
