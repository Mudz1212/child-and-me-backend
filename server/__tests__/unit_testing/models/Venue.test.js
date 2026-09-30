const Venue = require("../../../models/Venue");
const db = require("../../../db/connect");

describe("Venue", () => {
  beforeEach(() => jest.clearAllMocks());

  afterAll(() => jest.resetAllMocks());

  describe("findAll", () => {
    it("resolves with venues when called with no filters", async () => {
      const mockVenues = [{ id: 1, name: "Test Cafe", amenities: [] }];
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: mockVenues });

      const venues = await Venue.findAll();

      expect(venues).toEqual(mockVenues);
    });

    it("adds an age_suitability condition when age is provided", async () => {
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      await Venue.findAll({ age: "0-5" });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("v.age_suitability = $1"),
        ["0-5"],
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
      const testVenue = { id: 1, name: "Test Cafe" };
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [testVenue] });

      const result = await Venue.findById(1);

      expect(result).toEqual(testVenue);
    });

    it("returns undefined when the venue doesn't exist", async () => {
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      const result = await Venue.findById(999);

      expect(result).toBeUndefined();
    });
  });

  describe("create", () => {
    it("creates a venue and returns it", async () => {
      const testVenue = { id: 2, name: "New Venue", owner_id: 1 };
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
    });
  });

  describe("patch", () => {
    it("updates only the fields provided", async () => {
      const patchedVenue = { id: 1, name: "Renamed Cafe" };
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [patchedVenue] });

      const result = await Venue.patch(1, 1, { name: "Renamed Cafe" });

      expect(result).toEqual(patchedVenue);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("SET name = $1"),
        ["Renamed Cafe", 1, 1],
      );
    });

    it("supports patching Geoapify-sourced fields", async () => {
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await Venue.patch(1, 1, { category: "catering.cafe" });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("category = $1"),
        ["catering.cafe", 1, 1],
      );
    });

    it("returns undefined when the venue doesn't exist or isn't owned by the user", async () => {
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      const result = await Venue.patch(999, 1, { name: "X" });

      expect(result).toBeUndefined();
    });

    it("throws when no valid fields are provided", async () => {
      await expect(Venue.patch(1, 1, {})).rejects.toThrow(
        "No valid fields provided to update",
      );
    });
  });

  describe("seed", () => {
    it("inserts a venue and returns it", async () => {
      const rawVenue = {
        geoapify_place_id: "abc123",
        name: "Test Cafe",
        latitude: "51.5",
        longitude: "-0.1",
        postcode: "SW1A 1AA",
      };
      const insertedVenue = { id: 1, ...rawVenue };
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [insertedVenue] });

      const result = await Venue.seed([rawVenue]);

      expect(result).toEqual([insertedVenue]);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("ON CONFLICT (geoapify_place_id)"),
        expect.any(Array),
      );
    });

    it("resolves with an empty array when given no venues", async () => {
      const result = await Venue.seed([]);

      expect(result).toEqual([]);
      expect(db.query).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("updates a venue owned by the requesting user", async () => {
      const updatedVenue = { id: 1, name: "Updated Name", owner_id: 1 };
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [updatedVenue] });

      const result = await Venue.update(1, 1, {
        name: "Updated Name",
        description: "updated",
        postcode: "SW1A 1AA",
        ageSuitability: "0-8",
      });

      expect(result).toEqual(updatedVenue);
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
