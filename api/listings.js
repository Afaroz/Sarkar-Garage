const { db, auth } = require("./lib");

module.exports = async (req, res) => {
  try {
    const database = await db();
    const collection = database.collection("bikes");

    if (req.method === "GET") {
      const listings = await collection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      return res.status(200).json(listings);
    }

    if (!auth(req)) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    if (req.method === "POST") {
      const {
        title,
        vehicleType,
        year,
        km,
        price,
        location,
        description,
        image,
        whatsapp
      } = req.body || {};

      if (!title || !image) {
        return res.status(400).json({
          message: "Title and image are required"
        });
      }

      const listing = {
        title,
        vehicleType: vehicleType || "Bike",
        year: year || "",
        km: km || "",
        price: Number(price || 0),
        location: location || "Mahur",
        description: description || "",
        image,
        whatsapp: whatsapp || process.env.SELLER_WHATSAPP || "",
        createdAt: new Date()
      };

      const result = await collection.insertOne(listing);

      return res.status(201).json({
        success: true,
        id: result.insertedId,
        listing
      });
    }

    return res.status(405).json({
      message: "Method not allowed"
    });

  } catch (error) {
    console.error("LISTINGS ERROR:", error);

    return res.status(500).json({
      message: error.message || "Server error"
    });
  }
};
