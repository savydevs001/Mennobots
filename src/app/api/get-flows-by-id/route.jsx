import db from "@/utils/db";
import Flows from "@/models/Flows";
import User from "@/models/User";

export const POST = async (req) => {
  try {
    const body = await req.json();
    const { userId } = body;
    console.log(userId);

    // Validate input
    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, message: "User ID is required." }),
        { status: 400 }
      );
    }

    // Connect to the database
    await db();

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found." }),
        { status: 404 }
      );
    }

    const flows = await Flows.find({ userId })
      .sort({ createdAt: -1 })
      .populate("rucId");


    return new Response(JSON.stringify({ success: true, flows }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error retrieving flows:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "An error occurred while retrieving the flows.",
      }),
      { status: 500 }
    );
  }
};
