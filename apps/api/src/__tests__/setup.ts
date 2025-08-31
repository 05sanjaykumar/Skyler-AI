import app from "../app";
import request from "supertest";
import { prisma } from "@skyler-ai/prisma";

export const api = () => request(app);

export const cleanUpDB = async () => {
  await prisma.waitlistEntry.deleteMany();
  await prisma.contactUsMessage.deleteMany();
  await prisma.user.deleteMany();
};
