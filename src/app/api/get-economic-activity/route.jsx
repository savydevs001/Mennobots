import db from "@/utils/db";
import EconomicActivity from "@/models/EconomicActivity";
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

    // Find economic activities by the user ID stored in the token
    const economicActivities = await EconomicActivity.find({
      userId: decoded.id,
    });
    if (!economicActivities || economicActivities.length === 0) {
      
      return new Response(
        JSON.stringify({ error: "No economic activities found" }),
        { status: 200 }
      );
    }

    // Return the economic activities data
    return new Response(
      JSON.stringify({
        economicActivities,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching economic activities:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};
