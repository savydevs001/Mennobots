import db from "@/utils/db";
import GeneralInfo from "@/models/GeneralInfo";
import jwt from "jsonwebtoken";

export const GET = async (req) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return new NextResponse(
            JSON.stringify({ error: "Authorization token missing" }),
            { status: 401 }
          );
        }
    
        const token = authHeader.split(" ")[1];

    if (!token) {
      return new Response(JSON.stringify({ error: "Token is required" }), { status: 400 });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
    }
    console.log(decoded)

    // Connect to the database
    await db();

    // Find the general info by the user ID stored in the token
    const generalInfo = await GeneralInfo.find({ userId: decoded.id });
    if (!generalInfo) {
      return new Response(JSON.stringify({ error: "General info not found" }), { status: 404 });
    }
    

    // Return the general info data
    return new Response(
      JSON.stringify({
        generalInfo,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching general info:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};