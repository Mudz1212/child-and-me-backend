const jwt = require("jsonwebtoken");
const { requireAuth } = require("../../../middleware/auth");

describe("requireAuth", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("rejects when no Authorization header is present", () => {
    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects when the Authorization header doesn't start with 'Bearer '", () => {
    req.headers.authorization = "Basic somecredentials";

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects when Bearer is present but the token itself is empty", () => {
    req.headers.authorization = "Bearer ";

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects a malformed token", () => {
    req.headers.authorization = "Bearer not.a.valid.jwt";

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid or expired token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects a token signed with the wrong secret", () => {
    const badToken = jwt.sign({ id: 1 }, "wrong-secret");
    req.headers.authorization = `Bearer ${badToken}`;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid or expired token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects an expired token", () => {
    const expiredToken = jwt.sign(
      { id: 1, email: "test@example.com", role: "parent" },
      process.env.JWT_SECRET,
      { expiresIn: -10 }, // this here has already expired 10 seconds ago so it should not work
    );
    req.headers.authorization = `Bearer ${expiredToken}`;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid or expired token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("accepts a valid token, attaches the payload to req.user, and calls next()", () => {
    const validToken = jwt.sign(
      { id: 1, email: "test@example.com", role: "venue_owner" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    req.headers.authorization = `Bearer ${validToken}`;

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(req.user).toMatchObject({
      id: 1,
      email: "test@example.com",
      role: "venue_owner",
    });
  });

  it("attaches exactly what was signed, nothing extra or missing", () => {
    const payload = { id: 42, email: "owner@example.com", role: "admin" };
    const validToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    req.headers.authorization = `Bearer ${validToken}`;

    requireAuth(req, res, next);

    expect(req.user.id).toBe(42);
    expect(req.user.email).toBe("owner@example.com");
    expect(req.user.role).toBe("admin");
  });
});
