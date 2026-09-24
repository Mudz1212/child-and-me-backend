const Venue = require("../../../models/Venue");
const db = require("../../../db/connect");

describe("Venue", () => {
  beforeEach(() => jest.clearAllMocks());

  afterAll(() => jest.resetAllMocks());

  describe("findAll", () => {
    it("resolves with venues when called with no filters", async () => {
      const mockVenues = [
        {
          id: 1,
          name: "Test Cafe",
          postcode: "SW1A 1AA",
          amenities: ["Parking"],
        },
      ];
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: mockVenues });

      const venues = await Venue.findAll();

      expect(venues).toHaveLength(1);
      expect(venues[0].name).toBe("Test Cafe");
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("FROM venues v"),
        [],
      );
    });

    it("adds an age_suitability condition when age is provided", async () => {
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      await Venue.findAll({ age: "0-5" });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("v.age_suitability = $1"),
        ["0-5"],
      );
    });

    it("adds a postcode condition when postcode is provided", async () => {
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      await Venue.findAll({ postcode: "SW1A 1AA" });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("v.postcode = $1"),
        ["SW1A 1AA"],
      );
    });

    it("adds a HAVING clause when amenity is provided", async () => {
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      await Venue.findAll({ amenity: "Parking" });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("HAVING $1 = ANY(array_agg(a.name))"),
        ["Parking"],
      );
    });

    it("combines age, postcode and amenity filters with correct param order", async () => {
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      await Venue.findAll({
        age: "0-5",
        postcode: "SW1A 1AA",
        amenity: "Parking",
      });

      expect(db.query).toHaveBeenCalledWith(expect.any(String), [
        "0-5",
        "SW1A 1AA",
        "Parking",
      ]);
    });
  });

  describe("findById", () => {
    it("resolves with a venue on successful db query", async () => {
      const testVenue = { id: 1, name: "Test Cafe", postcode: "SW1A 1AA" };
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [testVenue] });

      const result = await Venue.findById(1);

      expect(result).toEqual(testVenue);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM venues WHERE id = $1",
        [1],
      );
    });

    it("returns undefined when the venue doesn't exist", async () => {
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      const result = await Venue.findById(999);

      expect(result).toBeUndefined();
    });
  });

  describe("create", () => {
    it("creates a venue and returns it", async () => {
      const testVenue = {
        id: 2,
        name: "New Venue",
        description: "test",
        latitude: 51.5,
        longitude: -0.1,
        postcode: "SW1A 1AA",
        age_suitability: "0-5",
        owner_id: 1,
      };
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [testVenue] });

      const result = await Venue.create({
        name: "New Venue",
        description: "test",
        latitude: 51.5,
        longitude: -0.1,
        postcode: "SW1A 1AA",
        ageSuitability: "0-5",
        ownerId: 1,
      });

      expect(result).toEqual(testVenue);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO venues"),
        ["New Venue", "test", 51.5, -0.1, "SW1A 1AA", "0-5", 1],
      );
    });
  });

  describe("update", () => {
    it("updates a venue owned by the requesting user", async () => {
      const updatedVenue = {
        id: 1,
        name: "Updated Name",
        description: "updated desc",
        postcode: "SW1A 1AA",
        age_suitability: "0-8",
        owner_id: 1,
      };
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [updatedVenue] });

      const result = await Venue.update(1, 1, {
        name: "Updated Name",
        description: "updated desc",
        postcode: "SW1A 1AA",
        ageSuitability: "0-8",
      });

      expect(result).toEqual(updatedVenue);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE venues"),
        ["Updated Name", "updated desc", "SW1A 1AA", "0-8", 1, 1],
      );
    });

    it("returns undefined when the venue doesn't exist or isn't owned by the user", async () => {
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      const result = await Venue.update(999, 1, {
        name: "X",
        description: "Y",
        postcode: "Z",
        ageSuitability: "0-5",
      });

      expect(result).toBeUndefined();
    });
  });
});
