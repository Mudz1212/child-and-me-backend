const request = require("supertest");
const app = require("../../app");
const db = require("../../db/connect");
const { resetDb } = require("./helpers/resetDb");

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await db.end();
});

async function registerAndLogin(email) {
  await request(app)
    .post("/auth/register")
    .send({ email, password: "password123" });
  const res = await request(app)
    .post("/auth/login")
    .send({ email, password: "password123" });
  return { token: res.body.token, id: res.body.id };
}

describe("Venue creation and lookup", () => {
  it("creates a venue and finds it by internal id", async () => {
    const { token } = await registerAndLogin("owner1@example.com");

    const createRes = await request(app)
      .post("/venues")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Costa",
        description: "test",
        latitude: 51.5,
        longitude: -0.1,
        postcode: "SW1A 1AA",
        ageSuitability: "0-5",
      });
    expect(createRes.status).toBe(201);

    const byId = await request(app).get(`/venues/${createRes.body.id}`);
    expect(byId.status).toBe(200);
    expect(byId.body.name).toBe("Costa");
  });
});

describe("Venue import (real ON CONFLICT upsert)", () => {
  it("re-importing the same geoapify_place_id updates the row instead of duplicating it", async () => {
    const venue = {
      geoapify_place_id: "abc123",
      name: "Cafe One",
      latitude: 51.5,
      longitude: -0.1,
      postcode: "SW1A 1AA",
    };

    const first = await request(app).post("/venues/import").send([venue]);
    expect(first.status).toBe(201);
    expect(first.body.imported).toBe(1);

    const second = await request(app)
      .post("/venues/import")
      .send([{ ...venue, name: "Cafe Renamed" }]);
    expect(second.status).toBe(201);

    const { rows } = await db.query(
      "SELECT name FROM venues WHERE geoapify_place_id = 'abc123'",
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Cafe Renamed");
  });

  it("looks up an imported venue by its geoapify_place_id via the API", async () => {
    await request(app)
      .post("/venues/import")
      .send([
        {
          geoapify_place_id: "findme123",
          name: "Findable Cafe",
          latitude: 51.5,
          longitude: -0.1,
          postcode: "SW1A 1AA",
        },
      ]);

    const res = await request(app).get("/venues/geoapify/findme123");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Findable Cafe");
    expect(res.body.amenities).toEqual([]);
  });

  // This documents current, real behaviour: seed() has no per-row error handling,
  // so one bad row in a batch aborts everything after it in that request.
  it("aborts the rest of the batch when one row violates a NOT NULL constraint", async () => {
    const venues = [
      {
        geoapify_place_id: "ok1",
        name: "Good Venue",
        latitude: 51.5,
        longitude: -0.1,
        postcode: "SW1A 1AA",
      },
      {
        geoapify_place_id: "bad1",
        name: "Bad Venue",
        latitude: null,
        longitude: -0.1,
        postcode: "SW1A 1AA",
      },
    ];

    const res = await request(app).post("/venues/import").send(venues);

    expect(res.status).toBe(500);

    const { rows } = await db.query("SELECT geoapify_place_id FROM venues");
    expect(rows.length).toBeLessThan(venues.length);
  });
});

describe("PATCH /venues/:id ownership", () => {
  it("lets an owner patch their own venue without touching other fields", async () => {
    const { token } = await registerAndLogin("owner2@example.com");

    const createRes = await request(app)
      .post("/venues")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Original Name",
        description: "original description",
        latitude: 51.5,
        longitude: -0.1,
        postcode: "SW1A 1AA",
        ageSuitability: "0-5",
      });

    const patchRes = await request(app)
      .patch(`/venues/${createRes.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Renamed" });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.name).toBe("Renamed");
    expect(patchRes.body.description).toBe("original description");
  });

  it("blocks a different user from patching someone else's venue", async () => {
    const owner = await registerAndLogin("owner3@example.com");
    const stranger = await registerAndLogin("stranger@example.com");

    const createRes = await request(app)
      .post("/venues")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        name: "Owned Venue",
        description: "test",
        latitude: 51.5,
        longitude: -0.1,
        postcode: "SW1A 1AA",
        ageSuitability: "0-5",
      });

    const patchRes = await request(app)
      .patch(`/venues/${createRes.body.id}`)
      .set("Authorization", `Bearer ${stranger.token}`)
      .send({ name: "Hijacked" });

    expect(patchRes.status).toBe(404);

    const check = await request(app).get(`/venues/${createRes.body.id}`);
    expect(check.body.name).toBe("Owned Venue");
  });
});

describe("GET /venues filters", () => {
  it("filters by amenity, age and postcode together against real joined data", async () => {
    const { token } = await registerAndLogin("owner4@example.com");

    const venueRes = await request(app)
      .post("/venues")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Filtered Cafe",
        description: "test",
        latitude: 51.5,
        longitude: -0.1,
        postcode: "SW1A 1AA",
        ageSuitability: "0-5",
      });

    const { rows: amenityRows } = await db.query(
      "SELECT id FROM amenities WHERE name = 'Parking'",
    );
    await request(app)
      .post("/venueAmenities")
      .send({ venue_id: venueRes.body.id, amenity_id: amenityRows[0].id });

    const res = await request(app).get(
      "/venues?amenity=Parking&age=0-5&postcode=SW1A 1AA",
    );

    expect(res.status).toBe(200);
    expect(res.body.some((v) => v.id === venueRes.body.id)).toBe(true);
  });
});
