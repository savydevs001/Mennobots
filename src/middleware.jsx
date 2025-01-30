import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

// Define protected and public routes
const protectedRoutes = [
  "/home",
  "/create-flow",
  "/scripts",
  "/completed-flows",
  "/reports",
  "/settings",
  "/licenses",
  "/help",
];
const publicRoutes = ["/login", "/signup"];

export async function middleware(req) {
  const cookieStore = await cookies(); // Access cookies
  const token = cookieStore.get("auth_token");
  const userDataCookie = cookieStore.get("user_data");
  const url = req.url;

  // console.log("Auth Token:", token?.value);
  // console.log("User Data:", userDataCookie);

  if (userDataCookie) {
    try {
      const userData = JSON.parse(userDataCookie.value);
      // console.log(userData)
      const userId = userData.id;

      // Call the API route to validate the user
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/validate-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      const data = await res.json();

      // If the user is invalid, clear cookies and redirect to login
      if (!data.success) {
        console.log("User not found or invalid.");

        const response = NextResponse.redirect(new URL("/login", req.url));
        response.cookies.delete("auth_token");
        response.cookies.delete("user_data");
        return response;
      }
    } catch (error) {
      console.error(
        "Error parsing user_data or validating user:",
        error.message
      );

      // // Clear cookies and redirect to login
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("auth_token");
      response.cookies.delete("user_data");
      return response;
    }
  }

  if (token) {
    try {
      const decoded = await jwtVerify(
        token.value,
        new TextEncoder().encode(process.env.JWT_SECRET)
      );

      // console.log("Token is valid. Decoded token:", decoded);
      return NextResponse.next();
    } catch (error) {
      console.log("Token verification failed:", error.message);

      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("auth_token");
      response.cookies.delete("user_data");
      return response;
    }
  }

  if (protectedRoutes.some((route) => url.includes(route)) && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (publicRoutes.some((route) => url.includes(route)) && token) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  return NextResponse.next();
}

// Optional: Apply middleware to specific routes
export const config = {
  matcher: [
    "/home",
    "/create-flow",
    "/scripts",
    "/completed-flows",
    "/reports",
    "/settings",
    "/licenses",
    "/help",
    "/login",
    "/signup",
  ],
};
