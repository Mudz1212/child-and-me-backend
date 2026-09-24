jest.mock("../../../db/connect");
const db = require("../../../db/connect");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const app = require("../../../app");

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

describe("POST /venues/import", () => {
  const adminToken = jwt.sign(
    { id: 9, email: "admin@example.com", role: "admin" },
    process.env.JWT_SECRET,
  );

  it("rejects a request with no auth token", async () => {
    const res = await request(app).post("/venues/import").send([]);

    expect(res.status).toBe(401);
  });

  it("rejects a non-admin user", async () => {
    const res = await request(app)
      .post("/venues/import")
      .set("Authorization", `Bearer ${token}`)
      .send([]);

    expect(res.status).toBe(403);
  });

  it("imports venues for an admin", async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, name: "Test Cafe" }] });

    const res = await request(app)
      .post("/venues/import")
      .set("Authorization", `Bearer ${adminToken}`)
      .send([{ geoapify_place_id: "abc", name: "Test Cafe" }]);

    expect(res.status).toBe(201);
    expect(res.body.imported).toBe(1);
  });
});

describe("PATCH /venues/:id", () => {
  it("rejects a request with no auth token", async () => {
    const res = await request(app)
      .patch("/venues/1")
      .send({ name: "New Name" });

    expect(res.status).toBe(401);
  });

  it("updates only the fields sent", async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 1, name: "Renamed Cafe", postcode: "SW1A 1AA" }],
    });

    const res = await request(app)
      .patch("/venues/1")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Renamed Cafe" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Renamed Cafe");
  });

  it("returns 404 when the venue doesn't exist or isn't owned by the user", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .patch("/venues/999")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "X" });

    expect(res.status).toBe(404);
  });

  it("returns 400 when the body has no valid fields", async () => {
    const res = await request(app)
      .patch("/venues/1")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });
});
