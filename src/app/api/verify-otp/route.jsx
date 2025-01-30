import Otp from "@/models/Otp";
import db from "@/utils/db";

// Function to validate if the OTP is still valid (within a time limit)
const isOtpValid = (otpRecord, otp) => {
  const otpValidityDuration = 10 * 60 * 1000; // OTP validity duration (10 minutes)
  const otpAge = Date.now() - otpRecord.createdAt;
  console.log(otpRecord.otp);
  console.log(otp);
  console.log(typeof otp);
  console.log(typeof otpRecord.otp);
  const isSame = otpRecord.otp === otp;

  // If OTP is older than the validity duration, it's considered expired
  return otpAge <= otpValidityDuration && isSame;
};

export const POST = async (req) => {
  const { email, otp } = await req.json();

  if (!email || !otp) {
    return new Response(
      JSON.stringify({ error: "Email and OTP are required" }),
      { status: 400 }
    );
  }

  try {
    // Connect to the database
    await db();

    // Find the OTP record for the given email
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return new Response(
        JSON.stringify({ error: "No OTP record found for this email" }),
        { status: 404 }
      );
    }

    // Check if the OTP is valid
    if (!isOtpValid(otpRecord, otp)) {
      return new Response(
        JSON.stringify({ error: "OTP has expired. Please request a new one." }),
        { status: 400 }
      );
    }

    // Check if the provided OTP matches the one stored in the database
    if (otpRecord.otp !== otp) {
      return new Response(
        JSON.stringify({ error: "Invalid OTP. Please try again." }),
        { status: 400 }
      );
    }

    // OTP is valid, you can now proceed with further actions (e.g., registration, login)
    return new Response(
      JSON.stringify({ message: "OTP verified successfully!" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return new Response(
      JSON.stringify({ error: "Failed to verify OTP, please try again." }),
      { status: 500 }
    );
  }
};
