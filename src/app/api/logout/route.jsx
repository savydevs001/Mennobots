import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    // Get the token from the authorization header (or cookie/session)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new NextResponse(
        JSON.stringify({ error: "Authorization token missing" }),
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1]; // Extract token from 'Bearer <token>'
    console.log(token);

    // Use Promise-based jwt.verify to handle the token verification
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          reject(err); // Reject the promise if there's an error
        } else {
          resolve(decoded); // Resolve the promise with decoded payload if no error
        }
      });
    });

    console.log(decoded); // This will log the decoded token if it's valid

    return new NextResponse(
      JSON.stringify({ message: "Logout successful" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error logging out user:", error);
    return new NextResponse(
      JSON.stringify({ error: "Invalid or expired token" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
};
