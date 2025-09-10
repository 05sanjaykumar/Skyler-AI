"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = void 0;
const verifyJWT = (req, _res, next) => {
    // Default: inject a fake userId
    req.userId = "test-user-id";
    next();
};
exports.verifyJWT = verifyJWT;
