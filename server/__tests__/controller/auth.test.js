jest.mock("../db/connect");
const db = require("../../db/connect");
const request = require("supertest");
const app = require("../../app");

describe("POST /auth/register", () => {
  it("creates a user and returns it", async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: "test@example.com", role: "parent" }],
    });

    const res = await request(app)
      .post("/auth/register")
      .send({ email: "test@example.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe("test@example.com");
  });

  it("rejects a missing password", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "test@example.com" });

    expect(res.status).toBe(400);
  });
});

describe("POST /auth/login", () => {
  it("rejects an unknown email", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "nobody@example.com", password: "wrong" });

    expect(res.status).toBe(401);
  });

  it("returns a token for correct credentials", async () => {
    const bcrypt = require("bcryptjs");
    const hash = await bcrypt.hash("password123", 10);

    db.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          email: "test@example.com",
          password_hash: hash,
          role: "parent",
        },
      ],
    });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
