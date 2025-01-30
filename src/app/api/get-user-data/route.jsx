import db from "@/utils/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export const GET = async (req) => {
  try {
    // Get the token from the Authorization header
    const token = req.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return new Response(JSON.stringify({ error: "Token is required" }), { status: 400 });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
    }

    // Connect to the database
    await db();

    // Find the user by the ID stored in the token
    const user = await User.findById(decoded.id);
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    // Return the user data
    return new Response(
      JSON.stringify({
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,  // You can add more fields here as needed
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user data:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};
