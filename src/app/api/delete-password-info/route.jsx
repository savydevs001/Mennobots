import db from "@/utils/db";
import CompanyPassword from "@/models/CompanyPassword";
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

    // Parse the request body to get password ID
    const requestBody = await req.json();
    const { passwordId } = requestBody;

    if (!passwordId) {
      return new NextResponse(
        JSON.stringify({ error: "'passwordId' is required to delete a password" }),
        { status: 400 }
      );
    }

    // Check if the password exists for the user
    const passwordToDelete = await CompanyPassword.findOne({
      userId: userData.id,
      _id: passwordId,
    });

    if (!passwordToDelete) {
      return new NextResponse(
        JSON.stringify({ error: "Password not found" }),
        { status: 404 }
      );
    }

    // Delete the password
    await CompanyPassword.deleteOne({ _id: passwordId });

    return new NextResponse(
      JSON.stringify({ message: "Password deleted successfully" }),
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
