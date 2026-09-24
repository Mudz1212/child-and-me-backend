const Geoapify = require("../../../models/Geoapify_id");
const db = require("../../../db/connect");

describe("Geoapify", () => {
  beforeEach(() => jest.clearAllMocks());

  afterAll(() => jest.resetAllMocks());

  describe("findByPlaceId", () => {
    it("resolves with a venue on successful db query", async () => {
      const testVenue = {
        id: 10,
        geoapify_place_id:
          "51bd9b5dadc909c0bf598be4863a07c14940f00103f901d72e2c2200000000920305436f737461",
        name: "Costa",
        postcode: "WC2N 5NG",
      };
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [testVenue] });

      const result = await Geoapify.findByPlaceId(testVenue.geoapify_place_id);

      expect(result).toEqual(testVenue);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM venues WHERE geoapify_place_id = $1",
        [testVenue.geoapify_place_id],
      );
    });

    it("returns undefined when no venue matches the place id", async () => {
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      const result = await Geoapify.findByPlaceId("nonexistent-id");

      expect(result).toBeUndefined();
    });
  });
});
