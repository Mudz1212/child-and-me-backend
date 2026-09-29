jest.mock("../../../db/connect");
const db = require("../../../db/connect");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const app = require("../../../app");

const placeId = "abc123";
const token = jwt.sign(
  { id: 1, email: "parent@example.com", role: "parent" },
  process.env.JWT_SECRET,
);

afterEach(() => {
  jest.clearAllMocks();
});

describe("GET /venues/:geoapifyPlaceId/reviews", () => {
  it("returns 404 when the venue doesn't exist", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get(`/venues/${placeId}/reviews`);

    expect(res.status).toBe(404);
  });

  it("returns the reviews for a venue that exists", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 5, geoapify_place_id: placeId }] })
      .mockResolvedValueOnce({
        rows: [{ id: 1, venue_id: 5, rating: 5, comment: "Great!" }],
      });

    const res = await request(app).get(`/venues/${placeId}/reviews`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].comment).toBe("Great!");
  });

  it("returns 500 instead of hanging when the database throws", async () => {
    db.query.mockRejectedValueOnce(new Error("connection lost"));

    const res = await request(app).get(`/venues/${placeId}/reviews`);

    expect(res.status).toBe(500);
  });
});

describe("POST /venues/:geoapifyPlaceId/reviews", () => {
  it("rejects a request with no auth token", async () => {
    const res = await request(app)
      .post(`/venues/${placeId}/reviews`)
      .send({ rating: 5, comment: "Lovely" });

    expect(res.status).toBe(401);
  });

  it("returns 404 when the venue doesn't exist", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post(`/venues/${placeId}/reviews`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 5, comment: "Lovely" });

    expect(res.status).toBe(404);
  });

  it("creates a review for a venue that exists", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 5, geoapify_place_id: placeId }] })
      .mockResolvedValueOnce({
        rows: [
          { id: 1, venue_id: 5, user_id: 1, rating: 5, comment: "Lovely" },
        ],
      });

    const res = await request(app)
      .post(`/venues/${placeId}/reviews`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 5, comment: "Lovely" });

    expect(res.status).toBe(201);
    expect(res.body.comment).toBe("Lovely");
  });

  it("returns 500 instead of hanging when the database throws", async () => {
    db.query.mockRejectedValueOnce(new Error("connection lost"));

    const res = await request(app)
      .post(`/venues/${placeId}/reviews`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 5, comment: "Lovely" });

    expect(res.status).toBe(500);
  });
});
