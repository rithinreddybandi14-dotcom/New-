
export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  return res.status(200).json({
    name: "WorldTrip API",
    status: "running",
    message: "Backend endpoint is deployed"
  });
}
