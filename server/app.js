const express = require("express");
const cors = require("cors");

const authRouter = require("./routers/auth");
const venuesRouter = require("./routers/venues");
const reviewsRouter = require("./routers/reviews");
const amenitiesRouter = require("./routers/amenities");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "Baby & Me API",
    endpoints: [
      { method: "GET",  path: "/venues",                    description: "List venues. Query params: amenity, age, postcode" },
      { method: "GET",  path: "/venues/:id",                 description: "Get one venue" },
      { method: "POST", path: "/venues",                     description: "Create a venue (auth required)" },
      { method: "PUT",  path: "/venues/:id",                 description: "Update your own venue (auth required)" },
      { method: "GET",  path: "/venues/:venueId/reviews",     description: "List reviews for a venue" },
      { method: "POST", path: "/venues/:venueId/reviews",     description: "Add a review (auth required)" },
      { method: "GET",  path: "/amenities",                   description: "List all amenity types" },
      { method: "POST", path: "/auth/register",               description: "Create an account" },
      { method: "POST", path: "/auth/login",                  description: "Log in, returns a JWT" }
    ]
  });
});

app.use("/auth", authRouter);
app.use("/venues", venuesRouter);
app.use("/venues/:venueId/reviews", reviewsRouter);
app.use("/amenities", amenitiesRouter);

module.exports = app;
