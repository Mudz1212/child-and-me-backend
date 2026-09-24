jest.mock("../../../db/connect");
const db = require("../../../db/connect");
const request = require("supertest");
const app = require("../../../app");

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
