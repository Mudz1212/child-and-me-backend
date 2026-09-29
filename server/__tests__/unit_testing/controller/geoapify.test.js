jest.mock("../../../db/connect");
const db = require("../../../db/connect");
const request = require("supertest");
const app = require("../../../app");

afterEach(() => {
  jest.clearAllMocks();
});

describe("GET /geoapify/:geoapifyPlaceId", () => {
  it("returns 404 when no venue matches", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/geoapify/nonexistent-id");

    expect(res.status).toBe(404);
  });

  it("returns the venue with its amenities", async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        {
          id: 10,
          geoapify_place_id: "abc123",
          name: "Costa",
          amenities: [{ id: 1, name: "Parking" }],
        },
      ],
    });

    const res = await request(app).get("/geoapify/abc123");

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Costa");
    expect(res.body.amenities).toHaveLength(1);
  });
});
