// apps/api/src/testUtils/setup.ts
import app from "../app";
import request from "supertest";
import { prisma } from "@skyler-ai/prisma";

export const api = () => request(app);

jest.mock("@xenova/transformers");


export const cleanUpDB = async () => {
  await prisma.waitlistEntry.deleteMany();
  await prisma.contactUsMessage.deleteMany();
  await prisma.user.deleteMany();
};

// Disconnect Prisma after all tests finish
afterAll(async () => {
  await prisma.$disconnect();
});