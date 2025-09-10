"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = verifyJWT;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ error: "No token provided" });
    const token = authHeader.split(" ")[1];
    if (!token)
        return res.status(401).json({ error: "Token missing" });
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err)
            return res.status(403).json({ error: "Invalid token" });
        // decoded is usually an object, let's assert its shape
        if (typeof decoded === "object" && decoded !== null && "id" in decoded) {
            req.userId = decoded.id;
            next();
        }
        else {
            return res.status(403).json({ error: "Invalid token payload" });
        }
    });
}
