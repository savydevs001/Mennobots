"use client";

import Image from "next/image";
import { Link } from "react-transition-progress/next";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/spinner";
import { createLicenseServerSide } from "@/lib/utils";

export default function Register() {
  const [email, setEmail] = useState("");
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [showPasswordScreen, setShowPasswordScreen] = useState(false);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const sendOtp = async (email) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/generate-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        console.log("Failed to send OTP. Please try again.");
        return;
      }

      toast.success("OTP sent successfully!");
      setShowOtpScreen(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error(error.message);
    }
  };

  const handleResendOtp = async () => {
    if (validateEmail(email)) {
      try {
        await sendOtp(email);
      } catch (error) {
        console.error("Error resending OTP:", error);
      }
    } else {
      toast.error("Please enter a valid email address to resend OTP.");
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setNameError("");
    setEmailError("");

    if (!termsAccepted) {
      setEmailError("You must accept the terms and conditions.");
      return;
    }

    if (!name.trim()) {
      setNameError("Name is required.");
      return;
    }

    if (validateEmail(email)) {
      // await sendOtp(email);
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/verify-user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });
    
        const data = await response.json();
        
        if (response.status === 409) {
        
          console.log(data.error);
          setEmailError(data.error);
          return;
        }

        await sendOtp(email);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    } else {
      setEmailError("Please enter a valid email address.");
    }
  };


  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateOtp = (otp) => /^\d{6}$/.test(otp);

  // Handle OTP submission
  const handleOtpSubmit = async (event) => {
    event.preventDefault();
    if (validateOtp(otp)) {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/verify-otp`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp }),
          }
        );

        if (!response.ok) {
          console.log("Invalid OTP. Please try again.");
          setOtpError("Invalid OTP! Please enter latest OTP code.");
          return;
        }

        setShowOtpScreen(false);
        setShowPasswordScreen(true);
        setOtpError("");
      } catch (error) {
        console.error("Error verifying OTP:", error);
        setOtpError(error.message);
      } finally {
        setLoading(false);
      }
    } else {
      setOtpError("Please enter a valid 6-digit OTP.");
    }
  };

  const isStrongPassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!_@#$%^&*(),.?":{}|<>]/.test(password);
    const hasMinLength = password.length >= 8;

    return (
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChars &&
      hasMinLength
    );
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setConfirmPasswordError("");

    if (!password) {
      setPasswordError("Please enter your password.");
      return;
    }

    if (!isStrongPassword(password)) {
      setPasswordError(
        "Password must be at least 8 characters long, include uppercase and lowercase letters, numbers, and special characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, otp, password }),
        }
      );

      if (!response.ok) {
        console.log("Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      const responseData = await response.json();
      const { user } = responseData;
      console.log(user);

      // Attempt to create the license, but don't block registration flow if it fails
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/create-license`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
        });

        if (!response.ok) {
          console.log("Failed to create license.");
        }
      } catch (error) {
        console.log("Error creating license:", error);
      }

      setLoading(false);

      toast.success("Registration successful!");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-white">
      <Toaster />
      <div className="bg-white rounded-[15px] shadow-none sm:shadow-xl p-5 sm:px-8 sm:py-10 w-[500px] max-w-md sm:border-2 sm:border-primary">
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo.svg" alt="Logo" width={130} height={130} />
          <p className="text-gray-500 text-sm">powered by MENNOVA</p>
        </div>

        {!showOtpScreen && !showPasswordScreen ? (
          // Initial Registration Screen
          <form onSubmit={handleRegister}>
            <h1 className="text-[21px] font-[700] text-blue-700 text-center mt-3">
              Create Your Account
            </h1>
            <p className="text-gray-700 text-center font-[700] text-[19px] mb-6">
              It&apos;s fast and easy
            </p>
            <label className="block text-gray-700 ml-4 text-sm md:text-base font-bold mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError(""); // Clear error on change
              }}
              placeholder="John Doe"
              className="w-full rounded-full bg-gray-100 hover:ring-1 hover:ring-primary text-gray-700 py-3 px-4 border border-gray-300 mb-4 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {nameError && (
              <p className="text-red-500 text-sm mb-4 ml-3">{nameError}</p>
            )}
            <label className="block text-gray-700 ml-4 text-sm md:text-base font-bold mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(""); // Clear error on change
              }}
              placeholder="xxxxxxxxxxxx@corporativo.com"
              className="w-full rounded-full bg-gray-100 hover:ring-1 hover:ring-primary text-gray-700 py-3 px-4 border border-gray-300 mb-4 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />

            {emailError && (
              <p className="text-red-500 text-sm mb-4 ml-3">{emailError}</p>
            )}
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={() => setTermsAccepted(!termsAccepted)}
                className="mr-2"
              />
              <label htmlFor="terms" className="text-gray-700 text-sm">
                By clicking on <strong>&quot;Register&quot;</strong>, you accept
                our <strong>Terms</strong>, <strong>Privacy Policy</strong>, and{" "}
                <strong>Cookie Policy</strong>.
              </label>
            </div>
            <button
              type="submit"
              className="w-full my-2 bg-primary text-white font-semibold py-3 text-lg md:text-xl rounded-full flex  justify-center items-center gap-x-3 transition duration-300 ease-in-out transform hover:bg-blue-700 hover:scale-105 mb-4"
              disabled={loading}
            >
              <p>Register</p>
              {loading && <Spinner />}
            </button>
            <p className="text-sm text-gray-600 text-center my-3">
              Already have an account?{" "}
              <Link href="/login" className="text-red-500 underline">
                Login
              </Link>
            </p>
          </form>
        ) : showOtpScreen ? (
          // OTP Screen
          <form onSubmit={handleOtpSubmit} className="text-center">
            <h1 className="text-[21px] font-[700] text-gray-800 text-center my-3">
              Check your email and enter the code
            </h1>
            <p className="text-gray-600 text-sm mb-6">
              The 6-digit code was sent to {email}
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="******"
              maxLength="6"
              className="w-full rounded-full bg-gray-100 hover:ring-1 hover:ring-primary text-gray-700 py-3 px-4 border border-gray-300 mb-2 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {otpError && (
              <p className="text-red-500 text-sm mb-4 ml-3">{otpError}</p>
            )}
            <button
              type="submit"
              className="w-full my-2 bg-primary text-white font-semibold py-3 text-lg md:text-xl rounded-full flex justify-center items-center gap-x-3 transition duration-300 ease-in-out transform hover:bg-blue-700 hover:scale-105 mb-4"
              disabled={loading}
            >
              <p className="">Submit</p>
              {loading && <Spinner />}
            </button>
            <p className="text-sm text-gray-600">
              Can&apos;t find our email? Check your spam folder or{" "}
              <button
                type="button"
                className="text-blue-500 underline"
                onClick={handleResendOtp}
              >
                resend the email
              </button>
              .
            </p>
          </form>
        ) : (
          // Password Screen
          <form onSubmit={handlePasswordSubmit}>
            <label
              className="block text-gray-700 ml-4 text-sm md:text-base font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(""); // Clear error on change
              }}
              placeholder="***************"
              className="w-full rounded-full bg-gray-100 hover:ring-1 hover:ring-primary text-gray-700 py-3 px-4 border border-gray-300 mb-2 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {passwordError && (
              <p className="text-red-500 text-sm mb-4 ml-3">{passwordError}</p>
            )}
            <label
              className="block text-gray-700 ml-4 text-sm md:text-base font-bold mb-2"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmPasswordError(""); // Clear error on change
              }}
              placeholder="***************"
              className="w-full rounded-full bg-gray-100 hover:ring-1 hover:ring-primary text-gray-700 py-3 px-4 border border-gray-300 mb-2 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {confirmPasswordError && (
              <p className="text-red-500 text-sm mb-4 ml-3">
                {confirmPasswordError}
              </p>
            )}
            <button
              type="submit"
              className="w-full my-2 bg-primary text-white font-semibold py-3 text-lg md:text-xl rounded-full flex  justify-center items-center gap-x-3 transition duration-300 ease-in-out transform hover:bg-blue-700 hover:scale-105 mb-4"
              disabled={loading}
            >
              <p>Register</p>
              {loading && <Spinner />}
            </button>
            <p className="text-sm text-gray-600 text-center my-3">
              Already have an account?{" "}
              <Link href="/login" className="text-red-500 underline">
                Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
