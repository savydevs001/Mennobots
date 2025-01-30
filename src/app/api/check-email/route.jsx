import db from "@/utils/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

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
    if (!user) {
      return new Response(JSON.stringify({ error: "Email not registered" }), {
        status: 404,
      });
    }

    // Generate a token (OTP verification token or login token)
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );


    return new Response(
      JSON.stringify({
        message: "Email found. OTP sent (token generated).",
        token,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking email:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};
