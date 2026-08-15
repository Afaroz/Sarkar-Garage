const { ObjectId } = require("mongodb");
const { db, auth } = require("../lib");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "DELETE") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    if (!auth(req)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = req.query.id;

    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid listing ID" });
    }

    const database = await db();

    const result = await database.collection("bikes").deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Vehicle not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully"
    });

  } catch (error) {
    console.error("DELETE LISTING ERROR:", error);

    return res.status(500).json({
      message: error.message || "Server error"
    });
  }
};
