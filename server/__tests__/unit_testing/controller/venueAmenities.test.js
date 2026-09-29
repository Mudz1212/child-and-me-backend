jest.mock("../../../db/connect");
const db = require("../../../db/connect");
const request = require("supertest");
const app = require("../../../app");

afterEach(() => {
  jest.clearAllMocks();
});

describe("GET /venueAmenities", () => {
  it("returns every venue-amenity link", async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ venue_id: 1, amenity_id: 2, amenity_name: "Parking" }],
    });

    const res = await request(app).get("/venueAmenities");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].amenity_name).toBe("Parking");
  });
});

describe("POST /venueAmenities", () => {
  it("rejects a request missing venue_id or amenity_id", async () => {
    const res = await request(app)
      .post("/venueAmenities")
      .send({ venue_id: 1 });

    expect(res.status).toBe(400);
  });

  it("creates a new link", async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ venue_id: 1, amenity_id: 2 }],
    });

    const res = await request(app)
      .post("/venueAmenities")
      .send({ venue_id: 1, amenity_id: 2 });

    expect(res.status).toBe(201);
    expect(res.body.amenity_id).toBe(2);
  });

  it("returns a friendly message instead of an error when the link already exists", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post("/venueAmenities")
      .send({ venue_id: 1, amenity_id: 2 });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Venue already has this amenity");
  });
});
