const { cloudinaryConfig, auth } = require("./lib");

module.exports = async (req, res) => {
  if (!auth(req)) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Method not allowed"
    });
  }

  try {
    const cloudinary = cloudinaryConfig();

    const timestamp = Math.floor(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: "sarkar-garage/vehicles"
      },
      process.env.CLOUDINARY_API_SECRET
    );

    return res.status(200).json({
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME
    });

  } catch (error) {
    console.error("CLOUDINARY SIGN ERROR:", error);

    return res.status(500).json({
      message: "Cloudinary configuration error"
    });
  }
};
