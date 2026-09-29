const Favourite = require("../../../models/Favourite");
const db = require("../../../db/connect");

describe("Favourite", () => {
  beforeEach(() => jest.clearAllMocks());

  afterAll(() => jest.resetAllMocks());

  describe("add", () => {
    it("returns null when the geoapify_place_id doesn't match any venue", async () => {
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      const result = await Favourite.add(55, "nonexistent-id");

      expect(result).toBeNull();
      expect(db.query).toHaveBeenCalledTimes(1);
    });

    it("favourites a venue that exists", async () => {
      const link = { user_id: 55, venue_id: 12 };
      jest
        .spyOn(db, "query")
        .mockResolvedValueOnce({ rows: [{ id: 12 }] })
        .mockResolvedValueOnce({ rows: [link] });

      const result = await Favourite.add(55, "abc123");

      expect(result).toEqual(link);
      expect(db.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("ON CONFLICT (user_id, venue_id) DO NOTHING"),
        [55, 12],
      );
    });

    it("returns alreadyFavourited when the pair already exists", async () => {
      jest
        .spyOn(db, "query")
        .mockResolvedValueOnce({ rows: [{ id: 12 }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await Favourite.add(55, "abc123");

      expect(result).toEqual({ alreadyFavourited: true });
    });
  });

  describe("remove", () => {
    it("returns null when the geoapify_place_id doesn't match any venue", async () => {
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      const result = await Favourite.remove(55, "nonexistent-id");

      expect(result).toBeNull();
    });

    it("removes an existing favourite", async () => {
      const removed = { user_id: 55, venue_id: 12 };
      jest
        .spyOn(db, "query")
        .mockResolvedValueOnce({ rows: [{ id: 12 }] })
        .mockResolvedValueOnce({ rows: [removed] });

      const result = await Favourite.remove(55, "abc123");

      expect(result).toEqual(removed);
    });

    it("returns undefined when the venue exists but wasn't favourited", async () => {
      jest
        .spyOn(db, "query")
        .mockResolvedValueOnce({ rows: [{ id: 12 }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await Favourite.remove(55, "abc123");

      expect(result).toBeUndefined();
    });
  });

  describe("findByUser", () => {
    it("resolves with the user's favourited venues", async () => {
      const venues = [{ id: 12, name: "Costa" }];
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: venues });

      const result = await Favourite.findByUser(55);

      expect(result).toEqual(venues);
      expect(db.query).toHaveBeenCalledWith(expect.any(String), [55]);
    });

    it("resolves with an empty array when the user has no favourites", async () => {
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      const result = await Favourite.findByUser(55);

      expect(result).toEqual([]);
    });
  });
});
