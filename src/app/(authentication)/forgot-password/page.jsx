"use client";

import Image from "next/image";
import { useState } from "react";
import { Link } from "react-transition-progress/next";

export default function ForgotPassword() {
  // State for email input, loading, error, and OTP sent status
  const [emailInput, setEmailInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Function to handle the OTP send request
  const handleSendOtp = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(""); // Reset error before submitting

    if (!emailInput) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }

    try {
      // Simulating the OTP sending (you can replace this with an actual API call)
      // const response = await sendOtp(emailInput);
      setTimeout(() => {
        setOtpSent(true); // Simulate OTP sent successfully
        setIsLoading(false);
      }, 2000); // Simulate delay in sending OTP
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    // Resend the OTP by triggering the same process
    setOtpSent(false);
    setEmailInput(""); // Clear the email input to ask for the email again
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-[15px] shadow-none sm:shadow-xl p-5 sm:px-8 sm:py-10 w-full max-w-md sm:border-2 sm:border-primary">
        <div className="flex flex-col items-center mb-[3rem] sm:mb-[3rem]">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={130}
            height={130}
            className="mb-2"
          />
          <p className="text-gray-500 text-[12px]">powered by MENNOVA</p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleSendOtp}>
            <h1 className="text-[21px] font-[700] text-gray-800 text-center my-4">
              Forgot your password?
            </h1>
            <label
              className="block text-gray-700 ml-4 text-sm md:text-base font-bold mb-2"
              htmlFor="email"
            >
              E-mail
            </label>
            <input
              type="email"
              id="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="xxxxxxxxxxxx@corporativo.com"
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 hover:ring-1 hover:ring-primary rounded-full border border-gray-300 mb-4 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />

            {error && <p className="text-red-500 text-sm mb-4 ml-3">{error}</p>}

            <button
              type="submit"
              className="w-full my-2 bg-primary text-white font-semibold py-3 text-lg md:text-[18px] rounded-full transition duration-300 ease-in-out transform hover:bg-blue-700 hover:scale-105 mb-4"
              disabled={isLoading}
            >
              Reset your password
            </button>
            <div className="text-center text-gray-700 mt-4 text-sm md:text-base">
              Don’t have an account?{" "}
              <Link href="/register" className="text-red-500 underline">
                Sign up
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-[4rem] text-gray-700 mt-4 text-sm md:text-base">
            <p>We have sent a temporary password to your email.</p>
            <p className="mt-2">
              Can&apos;t find our email? Check your spam folder or
              <button onClick={handleResend} className="text-primary underline">
                resend the email
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
