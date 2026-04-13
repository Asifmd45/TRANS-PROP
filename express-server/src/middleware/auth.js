import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return res.status(401).json({ detail: "Authentication required" });
  }

  const jwtSecret = process.env.JWT_SECRET || "dev_jwt_secret_change_me";

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
    };
    return next();
  } catch (_error) {
    return res.status(401).json({ detail: "Invalid or expired token" });
  }
}
