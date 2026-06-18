// DEMO BUILD — This serverless function is NOT used.
// AI runs client-side via Puter.js (loaded in index.html).
// This file exists only to prevent 404s if called accidentally.
export default function handler(req, res) {
  res.status(200).json({
    content: [{ type: "text", text: "Demo AI runs client-side via Puter.js. This endpoint is unused." }]
  });
}
