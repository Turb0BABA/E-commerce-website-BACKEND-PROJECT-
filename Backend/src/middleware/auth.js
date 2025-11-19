import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("AUTH HEADER RECEIVED:", authHeader);

    if (!authHeader) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const [type, token] = authHeader.split(" ");

    console.log("AUTH TYPE:", type);
    console.log("EXTRACTED TOKEN:", token);

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DECODED TOKEN:", decoded);

    req.user = decoded;
    next();

  } catch (err) {
    console.log("JWT VERIFY ERROR:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const admin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};
