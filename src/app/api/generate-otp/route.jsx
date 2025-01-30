import nodemailer from "nodemailer";
import crypto from "crypto";
import Otp from "@/models/Otp"; 
import db from "@/utils/db";

const generateOtp = () => {
  const buffer = crypto.randomBytes(3); // 3 bytes = 24 bits = 6 digits
  const otp = buffer.readUIntLE(0, 3) % 1000000; // 6-digit number
  return otp.toString().padStart(6, '0'); // Pad with leading zeros if needed
};

export const POST = async (req) => {
  const { email } = await req.json();


  if (!email) {
    return new Response(
      JSON.stringify({ error: "Email is required" }),
      { status: 400 }
    );
  }

  const otp = generateOtp();

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code for Mennotbot is ${otp}. Please enter this code to verify your email.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    await db();

    const otpRecord = await Otp.findOne({ email });

    if (otpRecord) {
      otpRecord.otp = otp;
      otpRecord.createdAt = Date.now();
      await otpRecord.save();
    } else {
      const newOtpRecord = new Otp({ email, otp });
      await newOtpRecord.save();
    }

    return new Response(
      JSON.stringify({ message: "OTP sent successfully!" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending OTP:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send OTP, please try again." }),
      { status: 500 }
    );
  }
};
