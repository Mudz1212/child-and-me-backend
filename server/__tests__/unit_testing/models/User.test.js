const User = require("../../../models/User");
const db = require("../../../db/connect");

jest.mock("../../../db/connect");

describe("User", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("creates a new user and returns id, email, role", async () => {
      const testUser = { id: 1, email: "test@example.com", role: "parent" };

      db.query.mockResolvedValueOnce({ rows: [testUser] });

      const result = await User.create({
        email: "test@example.com",
        passwordHash: "hashedPassword",
      });

      expect(db.query).toHaveBeenCalledTimes(1);
      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role",
        ["test@example.com", "hashedPassword", "parent"],
      );
      expect(result.email).toBe("test@example.com");
      expect(result.role).toBe("parent");
    });

    it("defaults role to 'parent' when not provided", async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: 2, email: "owner@example.com", role: "parent" }],
      });

      await User.create({ email: "owner@example.com", passwordHash: "hash" });

      expect(db.query).toHaveBeenCalledWith(expect.any(String), [
        "owner@example.com",
        "hash",
        "parent",
      ]);
    });

    it("respects an explicitly provided role", async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: 3, email: "owner2@example.com", role: "venue_owner" }],
      });

      await User.create({
        email: "owner2@example.com",
        passwordHash: "hash",
        role: "venue_owner",
      });

      expect(db.query).toHaveBeenCalledWith(expect.any(String), [
        "owner2@example.com",
        "hash",
        "venue_owner",
      ]);
    });
  });

  describe("findByEmail", () => {
    it("returns a user by email", async () => {
      const testUser = {
        id: 1,
        email: "test@example.com",
        password_hash: "hashedPassword",
        role: "parent",
      };

      db.query.mockResolvedValueOnce({ rows: [testUser] });

      const result = await User.findByEmail("test@example.com");

      expect(db.query).toHaveBeenCalledTimes(1);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE email = $1",
        ["test@example.com"],
      );
      expect(result.email).toBe("test@example.com");
    });

    it("returns undefined when no user matches", async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const result = await User.findByEmail("nobody@example.com");

      expect(result).toBeUndefined();
    });
  });

  describe("findAll", () => {
    it("returns all users without password hashes", async () => {
      const mockUsers = [
        {
          id: 1,
          email: "a@example.com",
          role: "parent",
          created_at: "2026-01-01",
        },
        {
          id: 2,
          email: "b@example.com",
          role: "venue_owner",
          created_at: "2026-01-02",
        },
      ];

      db.query.mockResolvedValueOnce({ rows: mockUsers });

      const result = await User.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty("password_hash");
      expect(db.query).toHaveBeenCalledWith(
        "SELECT id, email, role, created_at FROM users ORDER BY id",
      );
    });

    it("returns an empty array when there are no users", async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const result = await User.findAll();

      expect(result).toEqual([]);
    });
  });
});
