import db from "@/utils/db";
import User from "@/models/User";
import bcrypt from "bcrypt";

export const POST = async (req) => {
  try {
    const { name, email, otp, password } = await req.json();

    // Simulate OTP verification (accept any OTP for now)
    if (!otp) {
      return new Response(JSON.stringify({ error: "OTP is required" }), {
        status: 400,
      });
    }

    // Check if user already exists
    await db();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "User already exists with this email" }),
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();

    return new Response(
      JSON.stringify({
        message: "User registered successfully",
        user: { id: user._id, email: user.email, role: user.role },
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};
