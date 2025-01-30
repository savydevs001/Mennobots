import db from "@/utils/db";
import User from "@/models/User";

export const POST = async (req) => {
  try {
    const { email } = await req.json();

    // Validate email input
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
      });
    }

    // Connect to the database
    await db();

    // Check if the user exists in the database
    const user = await User.findOne({ email });
    if (user) {
      return new Response(
        JSON.stringify({ error: "Email is already registered" }),
        {
          status: 409, // Conflict
        }
      );
    }

    // If email does not exist, respond with success (for registration)
    return new Response(
      JSON.stringify({
        message: "Email is available for registration",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking email registration:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};
