import db from "@/utils/db";
import GeneralInfo from "@/models/GeneralInfo";
import EconomicActivity from "@/models/EconomicActivity";
import Administrator from "@/models/Administrator";
import CompanyPassword from "@/models/CompanyPassword";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    // Get the user_data cookie
    const cookies = req.cookies;
    const userDataCookie = cookies.get("user_data");

    if (!userDataCookie) {
      return new NextResponse(
        JSON.stringify({ error: "User data cookie missing" }),
        { status: 401 }
      );
    }

    // Parse the user data from the cookie (assuming it's stored as a JSON string)
    let userData;
    try {
      userData = JSON.parse(userDataCookie.value); // Access 'value' field and parse it
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid user data cookie format" }),
        { status: 400 }
      );
    }

    if (!userData || !userData.id) {
      return new NextResponse(
        JSON.stringify({ error: "User ID is missing from user data" }),
        { status: 401 }
      );
    }

    // Connect to the database
    await db();

    // Parse the request body once
    const requestBody = await req.json();
    const {
      isFor,
      generalInfo,
      economicActivity,
      administrator,
      passwordData,
    } = requestBody;

    if (!isFor) {
      return new NextResponse(
        JSON.stringify({ error: "'isFor' parameter is missing" }),
        { status: 400 }
      );
    }

    if (isFor === "general") {
      if (!generalInfo) {
        return new NextResponse(
          JSON.stringify({
            error: "Invalid data format: 'generalInfo' is required for general",
          }),
          { status: 400 }
        );
      }

      // Map the input data to match the schema
      const mappedData = generalInfo.reduce((acc, item) => {
        let key = item.label
          .replace(/\s+(.)/g, (_, char) => char.toUpperCase()) // Capitalize letters after spaces
          .replace(/[^a-zA-Z0-9]/g, "") // Remove special characters
          .replace(/^(.)/, (char) => char.toLowerCase()); // Lowercase the first letter

        if (item.label.toLowerCase() === "ruc") {
          key = item.label.toLowerCase(); // Convert the entire label to lowercase
        }

        acc[key] = item.value;
        return acc;
      }, {});

      // Check if company info already exists for the user
      const existingCompanyInfo = await GeneralInfo.findOne({
        userId: userData.id,
      });

      let responseMessage;
      let companyInfo;

      if (existingCompanyInfo) {
        // Update the existing document
        Object.assign(existingCompanyInfo, mappedData);
        companyInfo = await existingCompanyInfo.save();
        responseMessage = "Company info updated successfully";
      } else {
        // Create a new document if none exists
        companyInfo = await GeneralInfo.create({
          userId: userData.id, // Use the userId from the cookie
          ...mappedData,
        });
        responseMessage = "Company info inserted successfully";
      }

      return new NextResponse(
        JSON.stringify({
          message: responseMessage,
          companyInfo,
        }),
        { status: 200 }
      );
    } else if (isFor === "economic") {
      if (!economicActivity || !Array.isArray(economicActivity)) {
        return new NextResponse(
          JSON.stringify({
            error:
              "'economicActivity' is required and must be an array for economic activity.",
          }),
          { status: 400 }
        );
      }

      // Extract the relevant data from the economicActivity array
      let corporatePurpose, mainActivity;

      economicActivity.forEach((item) => {
        if (item.label.toLowerCase() === "corporate purpose") {
          corporatePurpose = item.value;
        } else if (item.label.toLowerCase() === "main activity") {
          mainActivity = item.value;
        }
      });

      if (!corporatePurpose || !mainActivity) {
        return new NextResponse(
          JSON.stringify({
            error:
              "Both 'corporatePurpose' and 'mainActivity' are required for the economic activity",
          }),
          { status: 400 }
        );
      }

      // Check if an existing economic activity exists for the current user
      const existingActivity = await EconomicActivity.findOne({
        userId: userData.id,
      });

      let responseMessage;
      let savedActivity;

      if (existingActivity) {
        // Update the existing economic activity
        existingActivity.corporatePurpose = corporatePurpose;
        existingActivity.mainActivity = mainActivity;

        savedActivity = await existingActivity.save();
        responseMessage = "Economic activity updated successfully";
      } else {
        // Create a new economic activity if not found
        savedActivity = await EconomicActivity.create({
          userId: userData.id,
          corporatePurpose,
          mainActivity,
        });
        responseMessage = "Economic activity created successfully";
      }

      return new NextResponse(
        JSON.stringify({
          message: responseMessage,
          savedActivity,
        }),
        { status: 200 }
      );
    } else if (isFor === "administrator") {
      if (!administrator || !Array.isArray(administrator)) {
        return new NextResponse(
          JSON.stringify({
            error:
              "'administrator' is required and must be an array for administrator information.",
          }),
          { status: 400 }
        );
      }

      // Map the input data to match the schema for administrator

      const mappedAdminData = administrator.reduce((acc, item) => {
        // Keep the "id" label and its value unchanged
        if (item.label === "id") {
          acc["id"] = item.value;
          return acc;
        }

        // Transform other labels
        let key = item.label
          .replace(/\s+(.)/g, (_, char) => char.toUpperCase()) // Capitalize letters after spaces
          .replace(/[^a-zA-Z0-9]/g, "") // Remove special characters
          .replace(/^(.)/, (char) => char.toLowerCase()); // Lowercase the first letter

        acc[key] = item.value;
        return acc;
      }, {});

      // Check if administrator info already exists for the user
      const existingAdminInfo = await Administrator.findOne({
        _id: mappedAdminData?.id,
      });

      let responseMessage;
      let adminInfo;

      if (existingAdminInfo) {
        // Update the existing administrator document
        Object.assign(existingAdminInfo, mappedAdminData);
        adminInfo = await existingAdminInfo.save();
        responseMessage = "Administrator info updated successfully";
      } else {
        // Create a new administrator document if none exists
        adminInfo = await Administrator.create({
          userId: userData.id, // Use the userId from the cookie
          ...mappedAdminData,
        });
        responseMessage = "Administrator info inserted successfully";
      }

      return new NextResponse(
        JSON.stringify({
          message: responseMessage,
          adminInfo,
        }),
        { status: 200 }
      );
    } else if (isFor === "passwords") {
      if (!passwordData || !Array.isArray(passwordData)) {
        return new NextResponse(
          JSON.stringify({
            error:
              "'passwordData' is required and must be an array for password management.",
          }),
          { status: 400 }
        );
      }

      // Map the input data to match the schema for password entries
      const mappedPasswordData = passwordData.reduce((acc, item) => {
        // Keep the "id" label and its value unchanged
        if (item.label === "id") {
          acc["id"] = item.value;
          return acc;
        }

        // Transform other labels
        let key = item.label
          .replace(/\s+(.)/g, (_, char) => char.toUpperCase()) // Capitalize letters after spaces
          .replace(/[^a-zA-Z0-9]/g, "") // Remove special characters
          .replace(/^(.)/, (char) => char.toLowerCase()); // Lowercase the first letter

        acc[key] = item.value;
        return acc;
      }, {});

      const { site, user, password, id } = mappedPasswordData;
      console.log(passwordData);
      console.log(site, user, password);

      if (!site || !user || !password) {
        return new NextResponse(
          JSON.stringify({
            error:
              "Each password entry must include 'site', 'user', and 'password'.",
          }),
          { status: 400 }
        );
      }

      // Check if a password entry for this site already exists for the user
      const existingPassword = await CompanyPassword.findOne({
        _id: id,
      });

      let responseMessage;
      let savedPassword;

      if (existingPassword) {
        // Update the existing password entry
        existingPassword.user = user;
        existingPassword.password = password;
        existingPassword.site = site;
        savedPassword = await existingPassword.save();
        responseMessage = `Password for site '${site}' updated successfully.`;
      } else {
        // Create a new password entry
        savedPassword = await CompanyPassword.create({
          userId: userData.id,
          site,
          user,
          password,
        });
        responseMessage = `Password for site '${site}' created successfully.`;
      }

      return new NextResponse(
        JSON.stringify({
          message: "Password management completed successfully.",
          details: responseMessage,
        }),
        { status: 200 }
      );
    } else {
      return new NextResponse(
        JSON.stringify({ error: "Invalid 'isFor' value" }),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error handling request:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
};
