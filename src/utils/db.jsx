// "use server";

// import mongoose from "mongoose";
// import dotenv from "dotenv";

// dotenv.config();

// const db = async () => {
//   if (mongoose.connections[0].readyState) {
//     return;
//   }

//   try {
//     console.log("Connecting to MongoDB...");
//     await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       // useUnifiedTopology: true,
//       serverSelectionTimeoutMS: 60000, // 60 seconds
//       socketTimeoutMS: 100000, // 45 seconds
//     });
//     console.log("MongoDB connected");
//   } catch (error) {
//     console.error("MongoDB connection error:", error);
//     throw new Error("MongoDB connection failed");
//   }
// };

// export default db;

"use server";

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const db = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 60000, // 60 seconds
      socketTimeoutMS: 100000, // 45 seconds
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error("MongoDB connection failed");
  }
};

export default db;
