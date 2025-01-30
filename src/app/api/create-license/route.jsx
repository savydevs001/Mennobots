import db from "@/utils/db";
import User from "@/models/User";
import Licenses from "@/models/Licenses";
import crypto from "crypto";


export const POST = async (req) => {
  try {
    const { userId } = await req.json();

    // Validate input
    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, message: "User ID is required." }),
        { status: 400 }
      );
    }

    // Connect to the database
    await db();

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found." }),
        { status: 404 }
      );
    }

    // Check if a license already exists for this user
    const existingLicense = await Licenses.findOne({ userId });
    if (existingLicense) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "License already exists for this user.",
        }),
        { status: 400 }
      );
    }

    // Set the expiration date for the license (e.g., 1 year from today)
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    // Create the license
    const license = await Licenses.create({
      userId,
      expirationDate,
      readyForProduction: false,
      isOnlineLicense: false,
      tokenValue: crypto.randomBytes(16).toString("hex"),

    });

    // Return success response
    return new Response(
      JSON.stringify({ success: true, license }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating license:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "An error occurred while creating the license.",
      }),
      { status: 500 }
    );
  }
};
