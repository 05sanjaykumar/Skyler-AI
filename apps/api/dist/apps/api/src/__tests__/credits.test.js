"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// apps/api/src/__tests__/credits.test.ts
const setup_1 = require("../testUtils/setup");
const prisma_1 = require("../../../../packages/prisma/src/client");
describe("Credits Routes", () => {
    const userId = "test-user-id";
    beforeEach(async () => {
        await prisma_1.prisma.user.create({
            data: {
                id: userId,
                name: "Credits User",
                email: "credits@example.com",
                hashedPassword: "fakehash",
                creditsRemaining: 100,
                planExpirationDate: new Date(Date.now() + 1000 * 60 * 60), // 1h ahead
            },
        });
    });
    afterEach(async () => {
        await prisma_1.prisma.user.deleteMany(); // clean slate
    });
    describe("GET /api/credits", () => {
        it("should return credits and plan expiration", async () => {
            const res = await (0, setup_1.api)().get("/api/credits");
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("creditsRemaining", 100);
            expect(res.body).toHaveProperty("planExpirationDate");
        });
        it("should reset credits if plan expired", async () => {
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: { planExpirationDate: new Date(Date.now() - 1000) }, // expired
            });
            const res = await (0, setup_1.api)().get("/api/credits");
            expect(res.status).toBe(200);
            expect(res.body.creditsRemaining).toBe(0);
        });
        it("should 404 if user not found", async () => {
            await prisma_1.prisma.user.delete({ where: { id: userId } });
            const res = await (0, setup_1.api)().get("/api/credits");
            expect(res.status).toBe(404);
            expect(res.body.error).toBe("User not found");
        });
    });
    describe("POST /api/credits/checkCredits", () => {
        it("should deduct credits if sufficient", async () => {
            const res = await (0, setup_1.api)().post("/api/credits/checkCredits").send({ cost: 20 });
            expect(res.status).toBe(200);
            expect(res.body.creditsRemaining).toBe(80);
        });
        it("should fail if insufficient credits", async () => {
            const res = await (0, setup_1.api)().post("/api/credits/checkCredits").send({ cost: 200 });
            expect(res.status).toBe(403);
            expect(res.body.error).toBe("Insufficient credits");
        });
        it("should fail if plan expired", async () => {
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: { planExpirationDate: new Date(Date.now() - 1000) }, // expired
            });
            const res = await (0, setup_1.api)().post("/api/credits/checkCredits").send({ cost: 10 });
            expect(res.status).toBe(403);
            expect(res.body.error).toBe("Plan expired");
        });
        it("should fail with invalid cost", async () => {
            const res = await (0, setup_1.api)().post("/api/credits/checkCredits").send({ cost: "invalid" });
            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Invalid or missing cost parameter");
        });
    });
});
