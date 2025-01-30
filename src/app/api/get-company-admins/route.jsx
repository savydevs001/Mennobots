import db from "@/utils/db";
import Administrator from "@/models/Administrator";
import jwt from "jsonwebtoken";

export const GET = async (req) => {
  try {
    // Get the token from the Authorization header
    const token = req.headers.get("Authorization")?.split(" ")[1];
    console.log(token);

    if (!token) {
      return new Response(JSON.stringify({ error: "Token is required" }), {
        status: 400,
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    if (!decoded) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
      });
    }

    // Connect to the database
    await db();

    // Find administrators by the user ID stored in the token
    const administrators = await Administrator.find({
      userId: decoded.id,
    });
    if (!administrators || administrators.length === 0) {
      return new Response(
        JSON.stringify({ error: "No administrators found" }),
        { status: 200 }
      );
    }

    // Return the administrators data
    return new Response(
      JSON.stringify({
        administrators,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching administrators:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};
