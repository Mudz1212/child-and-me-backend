const Review = require("../../../models/Review");
const db = require("../../../db/connect");

describe("Review", () => {
  beforeEach(() => jest.clearAllMocks());

  afterAll(() => jest.resetAllMocks());

  describe("findByVenue", () => {
    it("resolves with reviews for a venue on successful db query", async () => {
      const mockReviews = [
        { id: 1, venue_id: 1, user_id: 2, rating: 5, comment: "Great!" },
        { id: 2, venue_id: 1, user_id: 3, rating: 4, comment: "Good spot" },
      ];
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: mockReviews });

      const reviews = await Review.findByVenue(1);

      expect(reviews).toHaveLength(2);
      expect(reviews[0]).toHaveProperty("id");
      expect(reviews[0].rating).toBe(5);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM reviews WHERE venue_id = $1 ORDER BY created_at DESC",
        [1],
      );
    });

    it("resolves with an empty array when the venue has no reviews", async () => {
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      const reviews = await Review.findByVenue(999);

      expect(reviews).toEqual([]);
    });
  });

  describe("create", () => {
    it("creates a review and returns it", async () => {
      const testReview = {
        id: 1,
        venue_id: 1,
        user_id: 2,
        rating: 5,
        comment: "Great!",
      };
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [testReview] });

      const result = await Review.create({
        venueId: 1,
        userId: 2,
        rating: 5,
        comment: "Great!",
      });

      expect(result).toEqual(testReview);
      expect(db.query).toHaveBeenCalledWith(
        `INSERT INTO reviews (venue_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4) RETURNING *`,
        [1, 2, 5, "Great!"],
      );
    });
  });
});
