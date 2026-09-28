jest.mock("../../../db/connect");
const db = require("../../../db/connect");
const request = require("supertest");
const app = require("../../../app");

afterEach(() => {
  jest.clearAllMocks();
});

describe("GET /amenities", () => {
  it("returns the amenities list", async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        { id: 1, name: "Baby changing" },
        { id: 2, name: "Parking" },
      ],
    });

    const res = await request(app).get("/amenities");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe("POST /amenities", () => {
  it("rejects a request with no name", async () => {
    const res = await request(app).post("/amenities").send({});

    expect(res.status).toBe(400);
  });

  it("creates a new amenity", async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 3, name: "Baby changing" }],
    });

    const res = await request(app)
      .post("/amenities")
      .send({ name: "Baby changing" });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Baby changing");
  });
});
