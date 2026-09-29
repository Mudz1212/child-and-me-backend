const VenueAmenity = require("../../../models/VenueAmenity");
const db = require("../../../db/connect");

describe("VenueAmenity", () => {
  beforeEach(() => jest.clearAllMocks());

  afterAll(() => jest.resetAllMocks());

  describe("create", () => {
    it("links a venue to an amenity and returns the row", async () => {
      const link = { venue_id: 1, amenity_id: 2 };
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [link] });

      const result = await VenueAmenity.create(1, 2);

      expect(result).toEqual(link);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining(
          "ON CONFLICT (venue_id, amenity_id) DO NOTHING",
        ),
        [1, 2],
      );
    });

    it("returns undefined when the link already exists", async () => {
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      const result = await VenueAmenity.create(1, 2);

      expect(result).toBeUndefined();
    });
  });

  describe("getAll", () => {
    it("resolves with every venue-amenity link, joined with the amenity name", async () => {
      const links = [
        { venue_id: 1, amenity_id: 2, amenity_name: "Parking" },
        { venue_id: 1, amenity_id: 3, amenity_name: "High chairs" },
      ];
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: links });

      const result = await VenueAmenity.getAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("amenity_name");
    });

    it("resolves with an empty array when there are no links", async () => {
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      const result = await VenueAmenity.getAll();

      expect(result).toEqual([]);
    });
  });
});
