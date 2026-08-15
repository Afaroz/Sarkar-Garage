const { MongoClient } = require("mongodb");

let client;

async function getDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }

  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
  }

  return client.db(process.env.MONGODB_DB || "sarkar_garage");
}

function checkAuth(req) {
  const crypto = require("crypto");

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ")
    ? header.slice(7)
    : "";

  if (!token || !process.env.ADMIN_SECRET) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", process.env.ADMIN_SECRET)
    .update("sarkar-garage-admin")
    .digest("hex");

  if (token.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(expected)
  );
}

module.exports = async (req, res) => {
  try {
    const database = await getDatabase();
    const bikes = database.collection("bikes");

    // PUBLIC: Show listings
    if (req.method === "GET") {
      const data = await bikes
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      return res.status(200).json(data);
    }

    // OWNER ONLY
    if (!checkAuth(req)) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    // ADD VEHICLE
    if (req.method === "POST") {
      const body = req.body || {};

      const listing = {
        title: body.title || "",
        vehicleType: body.vehicleType || "Bike",
        year: body.year || "",
        km: body.km || "",
        price: Number(body.price || 0),
        location: body.location || "Mahur",
        description: body.description || "",
        image: body.image || "",
        whatsapp:
          body.whatsapp ||
          process.env.SELLER_WHATSAPP ||
          "",
        createdAt: new Date()
      };

      if (!listing.title) {
        return res.status(400).json({
          message: "Vehicle title is required"
        });
      }

      if (!listing.image) {
        return res.status(400).json({
          message: "Vehicle image is required"
        });
      }

      const result = await bikes.insertOne(listing);

      return res.status(201).json({
        success: true,
        message: "Vehicle added successfully",
        id: result.insertedId,
        listing
      });
    }

    // DELETE VEHICLE
    if (req.method === "DELETE") {
      const id = req.query?.id;

      if (!id) {
        return res.status(400).json({
          message: "Vehicle ID is required"
        });
      }

      const { ObjectId } = require("mongodb");

      await bikes.deleteOne({
        _id: new ObjectId(id)
      });

      return res.status(200).json({
        success: true,
        message: "Vehicle deleted successfully"
      });
    }

    return res.status(405).json({
      message: "Method not allowed"
    });

  } catch (error) {
    console.error("MONGODB LISTINGS ERROR:", error);

    return res.status(500).json({
      message: error.message || "Database error"
    });
  }
};
