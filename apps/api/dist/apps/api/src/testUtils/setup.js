"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanUpDB = exports.api = void 0;
// apps/api/src/testUtils/setup.ts
const app_1 = __importDefault(require("../app"));
const supertest_1 = __importDefault(require("supertest"));
const prisma_1 = require("../../../../packages/prisma/src/client");
const api = () => (0, supertest_1.default)(app_1.default);
exports.api = api;
jest.mock("@xenova/transformers");
const cleanUpDB = async () => {
    await prisma_1.prisma.waitlistEntry.deleteMany();
    await prisma_1.prisma.contactUsMessage.deleteMany();
    await prisma_1.prisma.user.deleteMany();
};
exports.cleanUpDB = cleanUpDB;
beforeEach(async () => {
    await (0, exports.cleanUpDB)();
});
// Disconnect Prisma after all tests finish
afterAll(async () => {
    await prisma_1.prisma.$disconnect();
});
