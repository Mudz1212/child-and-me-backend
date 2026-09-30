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

describe("Auth flow", () => {
  it("registers a new user with a real bcrypt hash, never the plaintext password", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "parent@example.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe("parent");

    const { rows } = await db.query(
      "SELECT password_hash FROM users WHERE email = $1",
      ["parent@example.com"],
    );
    expect(rows[0].password_hash).not.toBe("password123");
    expect(rows[0].password_hash.startsWith("$2")).toBe(true);
  });

  it("rejects registering the same email twice", async () => {
    await request(app)
      .post("/auth/register")
      .send({ email: "dupe@example.com", password: "password123" });

    const res = await request(app)
      .post("/auth/register")
      .send({ email: "dupe@example.com", password: "password123" });

    expect(res.status).toBe(409);
  });

  it("logs in and the returned token actually authorises a request", async () => {
    await request(app)
      .post("/auth/register")
      .send({ email: "login@example.com", password: "password123" });

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: "login@example.com", password: "password123" });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
    expect(loginRes.body.id).toBeDefined();

    const venueRes = await request(app)
      .post("/venues")
      .set("Authorization", `Bearer ${loginRes.body.token}`)
      .send({
        name: "Test Venue",
        description: "test",
        latitude: 51.5,
        longitude: -0.1,
        postcode: "SW1A 1AA",
        ageSuitability: "0-5",
      });

    expect(venueRes.status).toBe(201);
  });

  it("rejects login with the wrong password", async () => {
    await request(app)
      .post("/auth/register")
      .send({ email: "wrongpass@example.com", password: "password123" });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "wrongpass@example.com", password: "nope" });

    expect(res.status).toBe(401);
  });

  it("only an admin can list all users", async () => {
    await request(app)
      .post("/auth/register")
      .send({ email: "plain@example.com", password: "password123" });

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: "plain@example.com", password: "password123" });

    const forbidden = await request(app)
      .get("/auth")
      .set("Authorization", `Bearer ${loginRes.body.token}`);
    expect(forbidden.status).toBe(403);

    await db.query("UPDATE users SET role = 'admin' WHERE email = $1", [
      "plain@example.com",
    ]);

    const adminLogin = await request(app)
      .post("/auth/login")
      .send({ email: "plain@example.com", password: "password123" });

    const allowed = await request(app)
      .get("/auth")
      .set("Authorization", `Bearer ${adminLogin.body.token}`);
    expect(allowed.status).toBe(200);
    expect(Array.isArray(allowed.body)).toBe(true);
  });
});
