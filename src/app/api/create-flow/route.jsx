import db from "@/utils/db";
import User from "@/models/User";
import Flows from "@/models/Flows";

export const POST = async (req) => {
  try {
    const {
      id: userId,
      name,
      description,
      rucId,
      year,
      month,
      date,
      voucherType,
      apiType,
      schedule,
    } = await req.json();

    // Validate required inputs
    if (
      !userId ||
      !name ||
      !description ||
      !rucId ||
      !year ||
      !month ||
      date === null ||
      !voucherType
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing required fields.",
        }),
        { status: 400 }
      );
    }

    console.log("Received values:");
    console.log("userId:", userId);
    console.log("name:", name);
    console.log("description:", description);
    console.log("ruc:", rucId);
    console.log("year:", year);
    console.log("month:", typeof month);
    console.log("date:", date);
    console.log("schedule:", schedule);
    console.log("voucherType:", voucherType);

    // Validate schedule
    if (
      !schedule?.days ||
      !schedule?.times ||
      !Array.isArray(schedule.days) ||
      !Array.isArray(schedule.times)
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "Invalid schedule format. Both days and times arrays are required.",
        }),
        { status: 400 }
      );
    }

    // Connect to the database
    await db();

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User not found.",
        }),
        { status: 404 }
      );
    }

    // Create the flow
    const flow = await Flows.create({
      userId,
      name,
      description,
      rucId,
      year,
      month,
      date,
      apiType,
      voucherType,
      schedule: {
        days: schedule.days,
        times: schedule.times,
      },
      isComplete: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Return success response with the created flow
    return new Response(
      JSON.stringify({
        success: true,
        flow,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating flow:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "An error occurred while creating the flow.",
        error: error.message,
      }),
      { status: 500 }
    );
  }
};
