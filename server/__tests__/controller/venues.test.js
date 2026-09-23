jest.mock("../db/connect");
const db = require("../../db/connect");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const app = require("../../app");

const token = jwt.sign(
  { id: 1, email: "owner@example.com", role: "venue_owner" },
  process.env.JWT_SECRET,
);

describe("GET /venues", () => {
  it("returns a list of venues", async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 1, name: "Test Cafe", postcode: "SW1A 1AA", amenities: [] }],
    });

    const res = await request(app).get("/venues");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Test Cafe");
  });
});

describe("GET /venues/:id", () => {
  it("returns 404 for a venue that doesn't exist", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/venues/999");

    expect(res.status).toBe(404);
  });
});

describe("POST /venues", () => {
  it("rejects a request with no auth token", async () => {
    const res = await request(app).post("/venues").send({ name: "New Venue" });

    expect(res.status).toBe(401);
  });

  it("creates a venue when authenticated", async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 2, name: "New Venue", postcode: "SW1A 1AA" }],
    });

    const res = await request(app)
      .post("/venues")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "New Venue",
        description: "test",
        latitude: 51.5,
        longitude: -0.1,
        postcode: "SW1A 1AA",
        ageSuitability: "0-5",
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("New Venue");
  });
});
