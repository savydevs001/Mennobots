import db from "@/utils/db";
import Administrator from "@/models/Administrator";
import { NextResponse } from "next/server";

export const DELETE = async (req) => {
  try {
    // Get the user_data cookie
    const cookies = req.cookies;
    const userDataCookie = cookies.get("user_data");

    if (!userDataCookie) {
      return new NextResponse(
        JSON.stringify({ error: "User data cookie missing" }),
        { status: 401 }
      );
    }

    // Parse the user data from the cookie
    let userData;
    try {
      userData = JSON.parse(userDataCookie.value); // Access 'value' field and parse it
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid user data cookie format" }),
        { status: 400 }
      );
    }

    if (!userData || !userData.id) {
      return new NextResponse(
        JSON.stringify({ error: "User ID is missing from user data" }),
        { status: 401 }
      );
    }

    // Connect to the database
    await db();

    // Parse the request body to get admin ID
    const requestBody = await req.json();
    const { adminId } = requestBody;

    if (!adminId) {
      return new NextResponse(
        JSON.stringify({ error: "'adminId' is required to delete an admin" }),
        { status: 400 }
      );
    }

    // Check if the administrator exists for the user
    const adminToDelete = await Administrator.findOne({
      userId: userData.id,
      _id: adminId,
    });

    if (!adminToDelete) {
      return new NextResponse(
        JSON.stringify({ error: "Administrator not found" }),
        { status: 404 }
      );
    }

    // Delete the administrator
    await Administrator.deleteOne({ _id: adminId });

    return new NextResponse(
      JSON.stringify({ message: "Administrator deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error handling request:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
};
