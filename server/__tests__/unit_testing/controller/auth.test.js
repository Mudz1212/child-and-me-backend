jest.mock("../../../db/connect");
const db = require("../../../db/connect");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const app = require("../../../app");

beforeEach(() => jest.clearAllMocks());

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

  it("allows signing up as a venue owner", async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 2, email: "owner@example.com", role: "venue_owner" }],
    });

    const res = await request(app)
      .post("/auth/register")
      .send({
        email: "owner@example.com",
        password: "password123",
        role: "venue_owner",
      });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe("venue_owner");
  });

  it("rejects signing up as an admin", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "x@example.com", password: "password123", role: "admin" });

    expect(res.status).toBe(400);
    expect(db.query).not.toHaveBeenCalled();
  });
});

describe("GET /auth", () => {
  const tokenFor = (role) =>
    jwt.sign({ id: 1, email: "u@example.com", role }, process.env.JWT_SECRET);

  it("rejects a request with no auth token", async () => {
    const res = await request(app).get("/auth");

    expect(res.status).toBe(401);
  });

  it("rejects a non-admin user", async () => {
    const res = await request(app)
      .get("/auth")
      .set("Authorization", `Bearer ${tokenFor("parent")}`);

    expect(res.status).toBe(403);
  });

  it("lists users for an admin", async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: "u@example.com", role: "admin" }],
    });

    const res = await request(app)
      .get("/auth")
      .set("Authorization", `Bearer ${tokenFor("admin")}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
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
