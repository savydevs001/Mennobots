import { NextResponse } from "next/server";
import db from "@/utils/db"; 
import Licenses from "@/models/Licenses"; 

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required." }, { status: 400 });
    }

    // Connect to the database
    await db();

    // Fetch license data for the user from the database
    const license = await Licenses.findOne({ userId });

    if (!license) {
      return NextResponse.json({ success: false, message: "License not found." }, { status: 404 });
    }

    // Return the license data
    return NextResponse.json({ success: true, license });
  } catch (error) {
    console.error("Error fetching license data:", error.message);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
