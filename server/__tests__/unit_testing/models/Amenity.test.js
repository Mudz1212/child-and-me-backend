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
});
