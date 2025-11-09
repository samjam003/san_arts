// middleware/auth.js
const { supabase } = require("../config/supabase");

const requireAuthWare = async (req, res, next) => {
  try {
    // 1️⃣ Extract token (prefer Authorization header)
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ error: "Missing access token" });
    }

    // 2️⃣ Verify token using Supabase
    const { data, error } = await supabase.auth.getUser(token);

    // If verification fails → reject request
    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // 3️⃣ Token is valid → continue
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports = requireAuthWare;
    