const crypto = require("crypto");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Method not allowed"
    });
  }

  try {
    // Check admin token
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ")
      ? header.slice(7)
      : "";

    if (!token || !process.env.ADMIN_SECRET) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const expected = crypto
      .createHmac("sha256", process.env.ADMIN_SECRET)
      .update("sarkar-garage-admin")
      .digest("hex");

    if (
      token.length !== expected.length ||
      !crypto.timingSafeEqual(
        Buffer.from(token),
        Buffer.from(expected)
      )
    ) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    // Cloudinary variables
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({
        message: "Cloudinary environment variables are missing"
      });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "sarkar-garage/vehicles";

    // Cloudinary signature
    const signature = crypto
      .createHash("sha1")
      .update(
        `folder=${folder}&timestamp=${timestamp}${apiSecret}`
      )
      .digest("hex");

    return res.status(200).json({
      timestamp,
      signature,
      apiKey,
      cloudName,
      folder
    });

  } catch (error) {
    console.error("SIGN UPLOAD ERROR:", error);

    return res.status(500).json({
      message: error.message || "Server error"
    });
  }
};
