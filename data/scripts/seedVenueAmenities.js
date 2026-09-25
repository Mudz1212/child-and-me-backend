const fs = require("fs");
const path = require("path");

const API_URL = "http://4.223.159.135";;

const amenitiesPath = path.join(
  __dirname,
  "../raw/amenities.json"
);

const amenityData = JSON.parse(
  fs.readFileSync(amenitiesPath, "utf8")
);


// Maps JSON property names to names in the amenities table
const amenityNameMap = {
  accessible_entrance: "Accessible entrance",
  prams_allowed: "Prams allowed",
  pram_storage: "Pram storage",
  changing_facilities: "Changing facilities",
  table_reservation: "Table reservation",
  breastfeeding_friendly: "Breastfeeding friendly",
  childrens_activities: "Children's activities",
  accessible_toilets: "Accessible toilet"
};


async function seedVenueAmenities() {
  console.log("Loading venues...");

  const venuesResponse = await fetch(`${API_URL}/venues`);
  const venues = await venuesResponse.json();

  console.log(`Found ${venues.length} venues in database`);


  console.log("Loading amenities...");

  const amenitiesResponse = await fetch(`${API_URL}/amenities`);
  const amenities = await amenitiesResponse.json();

  console.log(`Found ${amenities.length} amenities in database`);


  const venueLookup = new Map(
    venues.map((venue) => [
      venue.geoapify_place_id,
      venue.id
    ])
  );


  const amenityLookup = new Map(
    amenities.map((amenity) => [
      amenity.name,
      amenity.id
    ])
  );


  let added = 0;
  let skipped = 0;


  for (const venueData of amenityData) {

    const venueId = venueLookup.get(
      venueData.place_id
    );

    if (!venueId) {
      console.log(
        `Skipping ${venueData.name}: venue not found in DB`
      );

      skipped++;
      continue;
    }


    const accessibility =
      venueData.family_accessibility || {};


    for (const [field, value] of Object.entries(accessibility)) {

      if (value !== true) {
        continue;
      }


      const amenityName =
        amenityNameMap[field];

      if (!amenityName) {
        continue;
      }


      const amenityId =
        amenityLookup.get(amenityName);

      if (!amenityId) {
        console.log(
          `Amenity not found in DB: ${amenityName}`
        );

        continue;
      }


      const response = await fetch(
        `${API_URL}/venueAmenities`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            venue_id: venueId,
            amenity_id: amenityId
          })
        }
      );


      if (!response.ok) {
        console.error(
          `Failed: ${venueData.name} -> ${amenityName}`
        );

        continue;
      }


      added++;
    }
  }


  console.log("\nSeed complete");
  console.log(`Relationships processed: ${added}`);
  console.log(`Venues not found: ${skipped}`);
}


seedVenueAmenities()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });