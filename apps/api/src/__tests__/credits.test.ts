// apps/api/src/__tests__/credits.test.ts
import { api } from "../testUtils/setup";
import { prisma } from "@skyler-ai/prisma";

describe("Credits Routes", () => {
  const userId = "test-user-id";

  beforeEach(async () => {
    await prisma.user.create({
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

  describe("GET /api/credits", () => {
    it("should return credits and plan expiration", async () => {
      const res = await api().get("/api/credits");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("creditsRemaining", 100);
      expect(res.body).toHaveProperty("planExpirationDate");
    });

    it("should reset credits if plan expired", async () => {
      await prisma.user.update({
        where: { id: userId },
        data: { planExpirationDate: new Date(Date.now() - 1000) }, // expired
      });

      const res = await api().get("/api/credits");

      expect(res.status).toBe(200);
      expect(res.body.creditsRemaining).toBe(0);
    });

    it("should 404 if user not found", async () => {
      await prisma.user.delete({ where: { id: userId } });

      const res = await api().get("/api/credits");
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("User not found");
    });
  });

  describe("POST /api/credits/checkCredits", () => {
    it("should deduct credits if sufficient", async () => {
      const res = await api().post("/api/credits/checkCredits").send({ cost: 20 });

      expect(res.status).toBe(200);
      expect(res.body.creditsRemaining).toBe(80);
    });

    it("should fail if insufficient credits", async () => {
      const res = await api().post("/api/credits/checkCredits").send({ cost: 200 });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Insufficient credits");
    });

    it("should fail if plan expired", async () => {
      await prisma.user.update({
        where: { id: userId },
        data: { planExpirationDate: new Date(Date.now() - 1000) }, // expired
      });

      const res = await api().post("/api/credits/checkCredits").send({ cost: 10 });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Plan expired");
    });

    it("should fail with invalid cost", async () => {
      const res = await api().post("/api/credits/checkCredits").send({ cost: "invalid" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Invalid or missing cost parameter");
    });
  });
});
