jest.mock("../../../db/connect");
const db = require("../../../db/connect");
const request = require("supertest");
const app = require("../../../app");

afterEach(() => {
  jest.clearAllMocks();
});

describe("GET /users/:id/favourites", () => {
  it("rejects a non-numeric id", async () => {
    const res = await request(app).get("/users/abc/favourites");

    expect(res.status).toBe(400);
  });

  it("returns the user's favourited venues", async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 12, name: "Costa" }],
    });

    const res = await request(app).get("/users/55/favourites");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Costa");
  });

  it("returns 500 instead of hanging when the database throws", async () => {
    db.query.mockRejectedValueOnce(new Error("connection lost"));

    const res = await request(app).get("/users/55/favourites");

    expect(res.status).toBe(500);
  });
});

describe("POST /users/:id/favourites/:geoapifyPlaceId", () => {
  it("returns 404 when the geoapify_place_id doesn't match a venue", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post("/users/55/favourites/nonexistent-id");

    expect(res.status).toBe(404);
  });

  it("favourites a venue that exists", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 12 }] })
      .mockResolvedValueOnce({ rows: [{ user_id: 55, venue_id: 12 }] });

    const res = await request(app).post("/users/55/favourites/abc123");

    expect(res.status).toBe(201);
    expect(res.body.venue_id).toBe(12);
  });

  it("returns 200 with a message when already favourited", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 12 }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post("/users/55/favourites/abc123");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Venue already favourited");
  });
});

describe("DELETE /users/:id/favourites/:geoapifyPlaceId", () => {
  it("returns 404 when the geoapify_place_id doesn't match a venue", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).delete(
      "/users/55/favourites/nonexistent-id",
    );

    expect(res.status).toBe(404);
  });

  it("removes an existing favourite", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 12 }] })
      .mockResolvedValueOnce({ rows: [{ user_id: 55, venue_id: 12 }] });

    const res = await request(app).delete("/users/55/favourites/abc123");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Removed from favourites");
  });

  it("returns 404 when the venue exists but wasn't favourited", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 12 }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).delete("/users/55/favourites/abc123");

    expect(res.status).toBe(404);
  });
});
