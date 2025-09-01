// apps/api/src/__tests__/auth.test.ts
import { api } from "../testUtils/setup";

describe("Auth Routes", () => {
  const user = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  };

  describe("POST /api/register", () => {
    it("should register a new user", async () => {
      const res = await api().post("/api/register").send(user);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        name: user.name,
        email: user.email,
      });
      expect(res.body.hashedPassword).toBeUndefined();
    });

    it("should not allow duplicate registration", async () => {
      await api().post("/api/register").send(user);
      const res = await api().post("/api/register").send(user);

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("User already exists");
    });

    it("should validate missing fields", async () => {
      const res = await api().post("/api/register").send({ email: user.email });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("All fields are required");
    });
  });

  describe("POST /api/verify-user", () => {
    it("should verify valid credentials", async () => {
      // register first
    const user = { name: "Test", email: "test@example.com", password: "password123" };
      await api().post("/api/register").send(user);

      const res = await api().post("/api/verify-user").send({
        email: user.email,
        password: user.password,
      });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        email: user.email,
        name: user.name,
      });
    });

    it("should reject invalid password", async () => {
      await api().post("/api/register").send(user);

      const res = await api().post("/api/verify-user").send({
        email: user.email,
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid credentials");
    });

    it("should reject unknown email", async () => {
      const res = await api().post("/api/verify-user").send({
        email: "unknown@example.com",
        password: "password123",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid credentials");
    });

    it("should validate missing credentials", async () => {
      const res = await api().post("/api/verify-user").send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Missing credentials");
    });
  });
});
