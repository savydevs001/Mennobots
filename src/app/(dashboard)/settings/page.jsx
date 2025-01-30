"use client";

import MaxWidth from "@/components/MaxWidth";
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";

function SettingsPage() {
  const [port, setPort] = useState("50000");
  const [language, setLanguage] = useState("EN");
  const [isModified, setIsModified] = useState(false);
  const [portError, setPortError] = useState("");

  const initialSettings = {
    port: "50000",
    language: "EN",
  };

  const validatePort = (port) => {
    const portNumber = Number(port);
    if (!/^\d+$/.test(port) || portNumber < 1 || portNumber > 65535) {
      setPortError("Port must be a number between 1 and 65535.");
      return false;
    } else {
      setPortError("");
      return true;
    }
  };

  const handlePortChange = (e) => {
    const value = e.target.value;
    setPort(value);
    setIsModified(true);
    validatePort(value);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setIsModified(true);
  };

  const handleSave = () => {
    if (validatePort(port)) {
      console.log("Settings saved:", { port, language });
      setIsModified(false);
    }
  };

  return (
    <MaxWidth>
      <Toaster position="top-center" />
      <div className="mb-6 md:flex md:space-x-6">
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Development mode port
          </label>
          <input
            type="text"
            value={port}
            onChange={handlePortChange}
            className="w-full rounded-full bg-white hover:ring-1 hover:ring-primary text-gray-700 py-3 px-4 border border-gray-300 mb-2 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {portError && (
            <p className="text-xs text-red-500 mt-1">{portError}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            If you change the port, you will need to restart Mennobots Studio.
          </p>
        </div>

        <div className="w-full md:w-1/2 mt-6 md:mt-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="w-full rounded-full bg-white hover:ring-1 hover:ring-primary text-gray-700 py-3 px-4 border border-gray-300 mb-2 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="EN">EN</option>
            <option value="ES">ES</option>
            <option value="FR">FR</option>
            {/* Add more languages if needed */}
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!isModified || portError}
          className={`px-4 py-2 text-white rounded-md ${
            isModified && !portError
              ? "bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
              : "bg-gray-300 cursor-not-allowed"
          } focus:outline-none`}
        >
          Save
        </button>
      </div>
    </MaxWidth>
  );
}

export default SettingsPage;
