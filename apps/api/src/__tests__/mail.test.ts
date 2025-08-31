// apps/api/src/__tests__/mail.test.ts
import { api, cleanUpDB } from "./setup";

beforeEach(async () => {
  await cleanUpDB();
});

describe("Mail Endpoints", () => {
  describe("POST /api/mail/waitlist", () => {
    it("should add a new email to waitlist", async () => {
      const res = await api().post("/api/mail/waitlist").send({ email: "test@example.com" });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Added to waitlist!");
      expect(res.body.entry.email).toBe("test@example.com");
    });

    it("should reject if email is missing", async () => {
      const res = await api().post("/api/mail/waitlist").send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Missing email");
    });

    it("should not add duplicate emails", async () => {
      await api().post("/api/mail/waitlist").send({ email: "dup@example.com" });
      const res = await api().post("/api/mail/waitlist").send({ email: "dup@example.com" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Already on the waitlist!");
    });
  });

  describe("POST /api/mail/contact-us", () => {
    it("should accept a contact us message", async () => {
      const res = await api().post("/api/mail/contact-us").send({
        name: "John Doe",
        email: "john@example.com",
        message: "I want to know more about Skyler.",
      });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Message sent!");
      expect(res.body.entry.email).toBe("john@example.com");
      expect(res.body.entry.name).toBe("John Doe");
    });

    it("should reject if required fields are missing", async () => {
      const res = await api().post("/api/mail/contact-us").send({ email: "missing@example.com" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Missing required fields");
    });
  });
});
