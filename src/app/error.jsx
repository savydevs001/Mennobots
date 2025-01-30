"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

const ErrorPage = ({ statusCode }) => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    if (connection) {
      const { effectiveType } = connection;

      if (effectiveType === "2g" || effectiveType === "slow-2g") {
        setErrorMessage("Connection Error: Your network seems very slow.");
      } else if (!navigator.onLine) {
        setErrorMessage("Connection Error: You seem to be offline.");
      } else {
        setErrorMessage(
          "Something went wrong. Please check your internet connection."
        );
      }
    } else {
      setErrorMessage(
        "Something went wrong. Please check your internet connection."
      );
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white text-black px-6">
      <Image src="/error.svg" alt="Error" width={120} height={120} />
      <h1 className="text-4xl font-bold mt-6">
        {statusCode ? `Error ${statusCode}` : "An Unexpected Error Occurred"}
      </h1>
      <p className="mt-4 text-gray-600 text-center">{errorMessage}</p>
      <button
        onClick={() => router.push("/")}
        className="mt-6 bg-[#2F90B0] text-white px-6 py-2 rounded hover:bg-[#246e85] transition-all duration-300"
      >
        Go Back Home
      </button>
    </div>
  );
};

// Server-side status code handling (fallback)
ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
