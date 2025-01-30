// import cron from "node-cron";
// import Flows from "@/models/Flows";
// import { sendResponse } from "next/dist/server/image-optimizer";
// import db from "../../utils/db";
// import { Server } from "socket.io";
// import http from "http";

// const server = http.createServer();
// const io = new Server(server, {
//   cors: {
//     origin: "*", // Allow frontend connections (adjust as needed)
//   },
// });

// async function executeFlow(flow) {
//   await db();
//   // Notify connected frontend clients
//   io.emit("flow-started", {
//     message: `Flow ${flow.name} is executing in the background`,
//   });
//   try {
//     // Call the appropriate API based on flow type
//     const apiEndpoint =
//       flow.apiType === 0 ? "sri-doc-recibidos" : "search-sri-doc-recibidos";

//     console.log(typeof flow.month.toString());
//     console.log(typeof flow.date.toString());
//     console.log(typeof flow.voucherType.toString());

//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_API_BASE_URL}/${apiEndpoint}`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           ruc: flow.rucId.user,
//           password: flow.rucId.password,
//           year: flow.year,
//           month: flow.month.toString(),
//           date: flow.date.toString(),
//           voucherType: flow.voucherType.toString(),
//         }),
//       }
//     );

//     // console.log(response);

//     const data = await response.json();
//     console.log(data);
//     // Notify connected frontend clients
//     io.emit("flow-executed", {
//       message: `Flow ${flow.name} executed successfully`,
//       data,
//     });
//     await Flows.findByIdAndUpdate(flow._id, {
//       $inc: { executionCount: 1 },
//     });
//   } catch (error) {
//     console.error(`Error executing flow ${flow._id}:`, error);
//   }
// }

// // Check every minute for flows that need to be executed
// cron.schedule("* * * * *", async () => {
//   console.log("schedule");
//   try {
//     const currentTime = new Date();
//     const currentHour = currentTime.getHours();
//     const currentMinute = currentTime.getMinutes();
//     const currentDay = currentTime.getDay(); // 0-6 (Sunday-Saturday)

//     // Format current time for comparison
//     const timeString = `${currentHour
//       .toString()
//       .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

//     // Find flows scheduled for current time and day
//     const flows = await Flows.find({
//       "schedule.days": currentDay,
//       "schedule.times": timeString,
//     }).populate("rucId");

//     // Execute each flow
//     for (const flow of flows) {
//       await executeFlow(flow);
//     }
//   } catch (error) {
//     console.error("Error checking for scheduled flows:", error);
//   }
// });

// server.listen(4000, () => console.log("WebSocket server running on port 4000"));

import cron from "node-cron";
import Flows from "@/models/Flows";
import db from "../../utils/db";
import { Server } from "socket.io";
import http from "http";
import net from "net";

let io;
let server = null;
const PORT = 4000;

// Function to check if the port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const testServer = net.createServer();
    testServer.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log(`Port ${port} is already in use.`);
        resolve(true);
      } else {
        resolve(false);
      }
    });
    testServer.once("listening", () => {
      testServer.close();
      resolve(false);
    });
    testServer.listen(port);
  });
}

// Function to initialize WebSocket server
function initializeSocketServer(server) {
  if (!io) {
    io = new Server(server, {
      cors: { origin: "*" }, // Adjust as needed
    });
    console.log("WebSocket server initialized.");
  }
  return io;
}

// Start server only if it's not already running
async function startServer() {
  const inUse = await isPortInUse(PORT);

  if (!inUse) {
    server = http.createServer();
    server.listen(PORT, () =>
      console.log(`WebSocket server running on port ${PORT}`)
    );
    io = initializeSocketServer(server);
  } else {
    console.log("Server is already running, skipping initialization.");
  }
}

startServer();

async function executeFlow(flow) {
  await db();
  io.emit("flow-started", {
    message: `Flow ${flow.name} is executing in the background`,
  });

  try {
    const apiEndpoint =
      flow.apiType === 0 ? "sri-doc-recibidos" : "search-sri-doc-recibidos";

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/${apiEndpoint}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ruc: flow.rucId.user,
          password: flow.rucId.password,
          year: flow.year,
          month: flow.month.toString(),
          date: flow.date.toString(),
          voucherType: flow.voucherType.toString(),
        }),
      }
    );

    io.emit("flow-executed", {
      message: `Flow ${flow.name} executed successfully. files downloaded`,
    });

    await Flows.findByIdAndUpdate(flow._id, {
      $inc: { executionCount: 1 },
      $set: { isCompleted: true },
    });
  } catch (error) {
    console.error(`Error executing flow ${flow._id}:`, error);
    io.emit("flow-error", {
      message: `Flow ${flow.name} failed`,
      error: error.message,
    });
  }
}

// Check every minute for flows that need execution
cron.schedule("* * * * *", async () => {
  console.log("Checking scheduled flows...");
  try {
    const currentTime = new Date();
    const timeString = `${currentTime
      .getHours()
      .toString()
      .padStart(2, "0")}:${currentTime
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    const currentDay = currentTime.getDay();

    const flows = await Flows.find({
      "schedule.days": currentDay,
      "schedule.times": timeString,
    }).populate("rucId");

    for (const flow of flows) {
      await executeFlow(flow);
    }
  } catch (error) {
    console.error("Error checking for scheduled flows:", error);
  }
});
