const Geoapify = require("../../../models/Geoapify_id");
const db = require("../../../db/connect");

describe("Geoapify", () => {
  beforeEach(() => jest.clearAllMocks());

  afterAll(() => jest.resetAllMocks());

  describe("findByPlaceId", () => {
    it("resolves with a venue and its amenities on successful db query", async () => {
      const testVenue = {
        id: 10,
        geoapify_place_id:
          "51bd9b5dadc909c0bf598be4863a07c14940f00103f901d72e2c2200000000920305436f737461",
        name: "Costa",
        postcode: "WC2N 5NG",
        amenities: [
          { id: 1, name: "Accessible entrance" },
          { id: 9, name: "Parking" },
        ],
      };
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [testVenue] });

      const result = await Geoapify.findByPlaceId(testVenue.geoapify_place_id);

      expect(result).toEqual(testVenue);
      expect(result.amenities).toHaveLength(2);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE v.geoapify_place_id = $1"),
        [testVenue.geoapify_place_id],
      );
    });
  });
});
