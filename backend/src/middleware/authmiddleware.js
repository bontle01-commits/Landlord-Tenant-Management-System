import { verify } from "jsonwebtoken";

export default (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const decoded = verify(token, process.env.JWT_SECRET);
  req.userId = decoded.userId;

  next();
};