const crypto = require("crypto");

function auth(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ")
    ? header.slice(7)
    : "";

  if (!token || !process.env.ADMIN_SECRET) return false;

  const expected = crypto
    .createHmac("sha256", process.env.ADMIN_SECRET)
    .update("sarkar-garage-admin")
    .digest("hex");

  return token === expected;
}

module.exports = {
  crypto,
  auth
};
