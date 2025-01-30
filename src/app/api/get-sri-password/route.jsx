import db from "@/utils/db";
import CompanyPassword from "@/models/CompanyPassword";
import jwt from "jsonwebtoken";

export const GET = async (req) => {
  try {
    // Get the token from the Authorization header
    const token = req.headers.get("Authorization")?.split(" ")[1];
    
    if (!token) {
      return new Response(JSON.stringify({ error: "Token is required" }), {
        status: 400,
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
      });
    }

    // Connect to the database
    await db();

    // Find company passwords where site is "SRI" and userId matches the decoded token
    const companyPasswords = await CompanyPassword.find({
      userId: decoded.id,
      site: "SRI",
    }).select("user password");

    if (!companyPasswords || companyPasswords.length === 0) {
      return new Response(
        JSON.stringify({ error: "No company passwords found" }),
        { status: 200 }
      );
    }

    // Return the filtered company passwords data
    return new Response(
      JSON.stringify({ companyPasswords }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching company passwords:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};
