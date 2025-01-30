"use client";

import { useEffect, useState } from "react";
import MaxWidth from "@/components/MaxWidth";
import Cookies from "js-cookie"; // Import js-cookie
import Loader from "@/components/ui/loader";

const LicenseScreen = () => {
  const [licenseData, setLicenseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLicenseData = async () => {
      try {
        // Use js-cookie to get the 'user_data' cookie
        const userDataCookie = Cookies.get("user_data");

        if (!userDataCookie) {
          setError("User not found in cookies.");
          setLoading(false);
          return;
        }

        // Parse the user data from the cookie
        const userData = JSON.parse(userDataCookie);
        const userId = userData?.id;

        if (!userId) {
          setError("User ID is missing.");
          setLoading(false);
          return;
        }

        // Fetch the license data using the userId
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/get-license`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
          }
        );

        const data = await response.json();
        console.log(data);

        if (data.success) {
          setLicenseData(data.license);
        } else {
          setError(data.message || "Failed to fetch license data");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching the license data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLicenseData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center w-full min-h-[80vh] justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <MaxWidth>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold mb-4">Active License</h4>

        {/* Table to display license information */}
        <table className="min-w-full">
          <tbody>
            <tr>
              <td className="py-2 px-4 font-medium">Expiration date:</td>
              <td className="py-2 px-4">
                {new Date(licenseData.expirationDate).toLocaleDateString(
                  "en-GB"
                )}
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-medium">Ready for production:</td>
              <td className="py-2 px-4">
                {licenseData.readyForProduction ? "Yes" : "No"}
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-medium">Is online license:</td>
              <td className="py-2 px-4">
                {licenseData.isOnlineLicense ? "Yes" : "No"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Optional: Display token in a separate section if needed */}
        <div className="mb-2 mt-4">
          <span className="font-medium">Token:</span>
          <div className="bg-red-100 p-2 rounded mt-1 text-xs break-all">
            {licenseData.tokenValue}
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none">
            Change License
          </button>
        </div>
      </div>
    </MaxWidth>
  );
};

export default LicenseScreen;
