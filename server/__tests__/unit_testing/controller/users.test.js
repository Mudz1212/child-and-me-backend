jest.mock("../../../db/connect");
const db = require("../../../db/connect");
const request = require("supertest");
const app = require("../../../app");

afterEach(() => {
  jest.clearAllMocks();
});

describe("GET /users/:id", () => {
  it("rejects a non-numeric id", async () => {
    const res = await request(app).get("/users/abc");

    expect(res.status).toBe(400);
  });

  it("returns 404 when the user doesn't exist", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/users/999");

    expect(res.status).toBe(404);
  });

  it("returns the user without a password hash", async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        { id: 4, email: "test@example.com", role: "parent", preferences: [] },
      ],
    });

    const res = await request(app).get("/users/4");

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("test@example.com");
    expect(res.body).not.toHaveProperty("password_hash");
  });
});

describe("PATCH /users/:id/preferences", () => {
  it("rejects a non-array body", async () => {
    const res = await request(app)
      .patch("/users/4/preferences")
      .send({ preferences: "Parking" });

    expect(res.status).toBe(400);
  });

  it("rejects an array containing a non-string", async () => {
    const res = await request(app)
      .patch("/users/4/preferences")
      .send({ preferences: ["Parking", 5] });

    expect(res.status).toBe(400);
  });

  it("de-duplicates and trims before saving", async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        {
          id: 4,
          email: "test@example.com",
          role: "parent",
          preferences: ["Parking"],
        },
      ],
    });

    const res = await request(app)
      .patch("/users/4/preferences")
      .send({ preferences: ["Parking", " Parking "] });

    expect(res.status).toBe(200);
    expect(db.query).toHaveBeenCalledWith(expect.any(String), [["Parking"], 4]);
  });

  it("returns 404 when the user doesn't exist", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .patch("/users/999/preferences")
      .send({ preferences: ["Parking"] });

    expect(res.status).toBe(404);
  });
});

describe("PATCH /users/:id/preferences/add", () => {
  it("rejects an empty preference", async () => {
    const res = await request(app)
      .patch("/users/4/preferences/add")
      .send({ preference: "   " });

    expect(res.status).toBe(400);
  });

  it("adds a preference", async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        {
          id: 4,
          email: "test@example.com",
          role: "parent",
          preferences: ["Parking"],
        },
      ],
    });

    const res = await request(app)
      .patch("/users/4/preferences/add")
      .send({ preference: "Parking" });

    expect(res.status).toBe(200);
    expect(res.body.preferences).toContain("Parking");
  });

  it("returns 404 when the user doesn't exist", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .patch("/users/999/preferences/add")
      .send({ preference: "Parking" });

    expect(res.status).toBe(404);
  });
});
