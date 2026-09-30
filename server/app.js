const express = require("express");
const cors = require("cors");

const authRouter = require("./routers/auth");
const venuesRouter = require("./routers/venues");
const reviewsRouter = require("./routers/reviews");
const amenitiesRouter = require("./routers/amenities");
const venueAmenitiesRouter = require("./routers/venueAmenities");
const geoapifyRouter = require("./routers/geoapify");
const usersRouter = require("./routers/users");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

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
      {
        method: "GET",
        path: "/users/:id",
        description: "Get a user",
      },
      {
        method: "PATCH",
        path: "/users/:id/preferences",
        description: "Replace a user's preferences",
      },
      {
        method: "PATCH",
        path: "/users/:id/preferences/add",
        description: "Add one preference",
      },
      {
        method: "GET",
        path: "/users/:id/favourites",
        description: "List a user's favourited venues",
      },
      {
        method: "POST",
        path: "/users/:id/favourites/:geoapifyPlaceId",
        description: "Favourite a venue by its geoapify_place_id",
      },
      {
        method: "DELETE",
        path: "/users/:id/favourites/:geoapifyPlaceId",
        description: "Unfavourite a venue by its geoapify_place_id",
      },
      {
        method: "GET",
        path: "/users/:id/reviews",
        description: "List a user's reviews",
      },
    ],
  });
});

app.use("/auth", authRouter);
app.use("/venues", venuesRouter);
app.use("/users", usersRouter);
app.use("/venues/:geoapifyPlaceId/reviews", reviewsRouter);
app.use("/amenities", amenitiesRouter);
app.use("/venueAmenities", venueAmenitiesRouter);
app.use("/geoapify", geoapifyRouter);

module.exports = app;
