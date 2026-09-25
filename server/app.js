app.get("/", (req, res) => {
  res.json({
    name: "Baby & Me API",
    endpoints: [
      {
        method: "GET",
        path: "/venues",
        description: "List venues. Query params: amenity, age, postcode",
      },
      { method: "GET", path: "/venues/:id", description: "Get one venue" },
      {
        method: "GET",
        path: "/venues/geoapify/:geoapifyPlaceId",
        description: "Get one venue by its geoapify_place_id",
      },
      {
        method: "POST",
        path: "/venues",
        description: "Create a venue (auth required)",
      },
      {
        method: "PUT",
        path: "/venues/:id",
        description: "Update your own venue (auth required)",
      },
      {
        method: "GET",
        path: "/venues/:geoapifyPlaceId/reviews",
        description: "List reviews for a venue, looked up by geoapify_place_id",
      },
      {
        method: "POST",
        path: "/venues/:geoapifyPlaceId/reviews",
        description: "Add a review (auth required)",
      },
      {
        method: "GET",
        path: "/amenities",
        description: "List all amenity types",
      },
      {
        method: "GET",
        path: "/venue-amenities",
        description: "List venue-amenity links",
      },
      {
        method: "POST",
        path: "/venue-amenities",
        description: "Link an amenity to a venue",
      },
      {
        method: "POST",
        path: "/auth/register",
        description: "Create an account",
      },
      {
        method: "POST",
        path: "/auth/login",
        description: "Log in, returns a JWT",
      },
    ],
  });
});

app.use("/auth", authRouter);
app.use("/venues", venuesRouter);
app.use("/venues/:geoapifyPlaceId/reviews", reviewsRouter);
app.use("/amenities", amenitiesRouter);
app.use("/venueAmenities", venueAmenitiesRouter);
app.use("/geoapify", geoapifyRouter);

module.exports = app;
