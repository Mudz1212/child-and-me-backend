const Amenity = require("../../../models/Amenity");
const db = require("../../../db/connect");

describe("Amenity", () => {
  beforeEach(() => jest.clearAllMocks());

  afterAll(() => jest.resetAllMocks());

  describe("findAll", () => {
    it("resolves with amenities on successful db query", async () => {
      const mockAmenities = [
        { id: 1, name: "Baby changing" },
        { id: 2, name: "Parking" },
      ];
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: mockAmenities });

      const amenities = await Amenity.findAll();

      expect(amenities).toHaveLength(2);
      expect(amenities[0]).toHaveProperty("id");
      expect(amenities[0].name).toBe("Baby changing");
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM amenities ORDER BY name",
      );
    });

    it("resolves with an empty array when no amenities exist", async () => {
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      const amenities = await Amenity.findAll();

      expect(amenities).toEqual([]);
    });
  });

  describe("create", () => {
    it("creates a new amenity", async () => {
      const testAmenity = { id: 3, name: "Baby changing" };
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [testAmenity] });

      const result = await Amenity.create("Baby changing");

      expect(result).toEqual(testAmenity);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("ON CONFLICT (name) DO UPDATE"),
        ["Baby changing"],
      );
    });

    it("does not error when the name already exists", async () => {
      const existing = { id: 3, name: "Parking" };
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [existing] });

      const result = await Amenity.create("Parking");

      expect(result).toEqual(existing);
    });
  });
});
