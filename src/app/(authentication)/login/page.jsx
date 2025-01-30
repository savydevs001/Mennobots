"use client";

import Image from "next/image";
import { Link } from "react-transition-progress/next";
import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "@/components/ui/spinner";
import Loader from "@/components/ui/loader";

export default function Login() {
  const [email, setEmail] = useState("");
  const [showManualLogin, setShowManualLogin] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");

  // Error states
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pageLoading, setPageLoading] = useState(false);
  const router = useRouter();

  const handleManualLoginClick = () => {
    // Clear all error states when switching to manual login
    setEmailError("");
    setOtpError("");
    setPasswordError("");
    setShowManualLogin(true);
  };

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

  const handleContinueWithEmail = async () => {
    setEmailError("");
    setOtpError("");
    setError("");

    if (validateEmail(email)) {
      setIsLoading(true);

      try {
        // Check if email exists in the system
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/check-email`,
          {
            method: "POST",
            body: JSON.stringify({ email }),
            headers: { "Content-Type": "application/json" },
          }
        );

        // console.log(response.error)
        if (response.error) {
          // console.log(response.error)
          toast.error(response.error);
        }

        const data = await response.json();
        console.log(data);

        if (!data.token) {
          setEmailError("No account associated with this email address.");
          setIsLoading(false);
          return;
        }

        setToken(data.token);
        sendOtp(email);
        toast.success("OTP sent to Email");
        setShowOtpScreen(true);

        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        toast.error(err.message);
        setError(err.message);
      }
    } else {
      setEmailError("Please enter a valid email address.");
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateOtp = (otp) => {
    const otpRegex = /^\d{6}$/;
    return otpRegex.test(otp);
  };

  const handleOtpSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    if (validateOtp(otp)) {
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

        // Make a GET request to fetch user data using the token
        const response2 = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/get-user-data`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response2.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response2.json();
        console.log("data", data);

        // Store user data and token in cookies
        Cookies.set("auth_token", token, { expires: 7 }); // Store token for 7 days
        Cookies.set("user_data", JSON.stringify(data.user), { expires: 7 }); // Store user data in cookies

        const tokenVal = Cookies.get("auth_token");
        const user = Cookies.get("user_data");
        console.log("tokenVal", tokenVal);
        console.log(user);

        toast.success("Login Successful");

        setOtpError("");
        setIsLoading(false);
        setPageLoading(true);

        // Delay the redirection to /home
        setTimeout(() => {
          router.push("/home");
        }, 2000); // Delay for 2 seconds (2000ms)
      } catch (err) {
        console.error("Error during OTP submission:", err);
      }
    } else {
      setOtpError("Please enter a valid 6-digit OTP.");
      toast.error("Invalid OTP format.");
    }

    setIsLoading(false);
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setEmailError("");
    setPasswordError("");
    setError("");

    // Check if email and password fields are empty
    if (!email || !password) {
      setEmailError("Email is required.");
      setPasswordError("Password is required.");
      setIsLoading(false);
      return;
    }

    // Proceed with login request
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/login`,
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle error from backend (invalid credentials)
        setError(data.error || "Invalid email or password.");
        setIsLoading(false);
        toast.error(data.error || "Invalid email or password.");
        return;
      }

      // Store the token in cookies upon successful login
      const tokenVal = data.token;
      Cookies.set("auth_token", tokenVal, { expires: 7 }); // Store token for 7 days

      toast.success("Login successful");

      // Now, fetch the user data after storing the token
      try {
        const userDataResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/get-user-data`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${tokenVal}`, // Use the token from login response
            },
          }
        );

        if (!userDataResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await userDataResponse.json();
        // console.log("User data fetched:", userData);

        // Optionally, store user data in cookies (if needed)
        Cookies.set("user_data", JSON.stringify(userData.user), { expires: 7 });

        // Delay the redirection to /home after fetching user data
        setPageLoading(true);
        setTimeout(() => {
          router.push("/home");
        }, 2000); // 2 seconds delay
      } catch (err) {
        console.error("Error fetching user data:", err);
        toast.error("Failed to fetch user data. Please try again.");
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error during login:", err);
      setIsLoading(false);
      setError("An error occurred. Please try again later.");
      toast.error("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-white">
      <Toaster position="top-center" />
      {pageLoading ? (
        <div className="w-full flex items-center justify-center ">
          <Loader />
        </div>
      ) : (
        <div className="bg-white rounded-[15px] shadow-none sm:shadow-xl p-5 sm:px-8 sm:py-10 w-full max-w-md sm:border-2 sm:border-primary">
          <div className="flex flex-col items-center mb-8">
            <Image src="/logo.svg" alt="Logo" width={130} height={130} />
            <p className="text-gray-500 text-sm">powered by MENNOVA</p>
          </div>

          {showOtpScreen ? (
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
                <p className="text-red-500 text-sm mb-4 ml-4">{otpError}</p>
              )}
              <button
                type="submit"
                className="w-full my-2 bg-primary text-white font-semibold py-3 text-lg md:text-xl rounded-full transition flex  justify-center items-center gap-x-3 duration-300 ease-in-out transform hover:bg-blue-700 hover:scale-105 mb-4"
              >
                <p>Login</p>
                {isLoading && <Spinner />}
              </button>
              <p className="text-sm text-gray-600">
                Can&apos;t find our email? Check your spam folder or{" "}
                <button
                  type="button"
                  className="text-blue-500 underline"
                  onClick={() => {
                    // resendOtp(email); // Pseudo-code
                  }}
                >
                  resend the email
                </button>
                .
              </p>
            </form>
          ) : !showManualLogin ? (
            // Initial Screen
            <div className="">
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
                className="w-full rounded-full bg-gray-100 hover:ring-1 hover:ring-primary text-gray-700 py-3 px-4 border border-gray-300 mb-2 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {emailError && (
                <p className="text-red-500 text-sm mb-4 ml-4">{emailError}</p>
              )}
              <div className="flex items-center justify-center my-2">
                <span className="border-b border-gray-300 w-full"></span>
                <span className="mx-4 text-gray-400 text-sm">OR</span>
                <span className="border-b border-gray-300 w-full"></span>
              </div>
              <div className="flex w-full justify-center">
                <button
                  onClick={handleManualLoginClick}
                  className="text-primary text-center underline hover:no-underline mb-4"
                >
                  Login Manually
                </button>
              </div>

              <button
                onClick={handleContinueWithEmail}
                className="w-full my-2 bg-primary text-white font-semibold py-3 text-lg md:text-xl rounded-full flex  justify-center items-center gap-x-3 transition duration-300 ease-in-out transform hover:bg-blue-700 hover:scale-105 mb-4"
              >
                <p>Continue with email</p>
                {isLoading && <Spinner />}
              </button>
              <p className="text-sm text-gray-600 text-center my-3">
                Don’t have an account?{" "}
                <Link href="/register" className="text-red-500 underline">
                  Sign up
                </Link>
              </p>
            </div>
          ) : (
            // Manual Login Screen
            <form onSubmit={handlePasswordSubmit}>
              <label
                className="block text-gray-700 ml-4 text-sm md:text-base font-bold mb-2"
                htmlFor="email"
              >
                E-mail
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(""); // Clear error on change
                }}
                placeholder="xxxxxxxxxxxx@corporativo.com"
                className="w-full rounded-full bg-gray-100 hover:ring-1 hover:ring-primary text-gray-700 py-3 px-4 border  border-gray-300 mb-2 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {emailError && (
                <p className="text-red-500 text-sm mb-4 ml-4">{emailError}</p>
              )}

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
                <p className="text-red-500 text-sm mb-4 ml-4">
                  {passwordError}
                </p>
              )}
              {error && (
                <p className="text-red-500 text-sm mb-4 ml-4">{error}</p>
              )}
              <div className="ml-3 mb-4">
                <Link
                  href={"/forgot-password"}
                  className="text-center mt-4 text-sm text-gray-700"
                >
                  Forgot Password?
                </Link>
              </div>
              <button
                type="submit"
                className="w-full my-2 bg-primary text-white font-semibold py-3 text-lg md:text-xl rounded-full flex  justify-center items-center gap-x-3 transition duration-300 ease-in-out transform hover:bg-blue-700 hover:scale-105 mb-4"
              >
                <p>Login</p>
                {isLoading && <Spinner />}
              </button>
              <p className="text-sm text-gray-600 text-center my-3">
                Don’t have an account?{" "}
                <Link href="/register" className="text-red-500 underline">
                  Sign up
                </Link>
              </p>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
