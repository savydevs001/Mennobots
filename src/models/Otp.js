import mongoose, { model, models } from "mongoose";
const { Schema } = mongoose;

const otpSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // Ensures OTP is unique per email
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: "10m", // OTP will expire after 10 minutes
    },
  },
  { timestamps: true }
);

const Otp = models?.Otp || model("Otp", otpSchema);

export default Otp;
