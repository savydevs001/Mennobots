import "@/app/server-functions/autoSchedular";

export default function handler(req, res) {
  console.log("Scheduler is running");
  res.status(200).json({ message: "Scheduler is running" });
}
