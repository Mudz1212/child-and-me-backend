require("dotenv").config();

const API_URL = "http://4.223.159.135";

const MIN_AMENITIES = 1;
const MAX_AMENITIES = 4;


const START_VENUE_ID = 6;

function getRandomItems(items, amount) {
  return [...items]
    .sort(() => Math.random() - 0.5)
    .slice(0, amount);
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedDemoVenueAmenities() {
  try {
    const venuesResponse = await fetch(`${API_URL}/venues`);

    if (!venuesResponse.ok) {
      throw new Error(
        `Failed to load venues: ${venuesResponse.status}`
      );
    }

    const venues = await venuesResponse.json();

    const amenitiesResponse = await fetch(`${API_URL}/amenities`);

    if (!amenitiesResponse.ok) {
      throw new Error(
        `Failed to load amenities: ${amenitiesResponse.status}`
      );
    }

    const amenities = await amenitiesResponse.json();

    const demoVenues = venues.filter(
      (venue) => venue.id >= START_VENUE_ID
    );

    console.log(`Venues available: ${venues.length}`);
    console.log(`Demo venues to process: ${demoVenues.length}`);
    console.log(`Amenities available: ${amenities.length}`);

    let created = 0;
    let failed = 0;

    for (const venue of demoVenues) {
      const amount = randomNumber(
        MIN_AMENITIES,
        Math.min(MAX_AMENITIES, amenities.length)
      );

      const selectedAmenities = getRandomItems(
        amenities,
        amount
      );

      console.log(`\n${venue.name}`);

      for (const amenity of selectedAmenities) {
        const response = await fetch(
          `${API_URL}/venue-amenities`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              venue_id: venue.id,
              amenity_id: amenity.id,
            }),
          }
        );

        if (response.ok) {
          console.log(` ${amenity.name}`);
          created++;
        } else {
          console.log(`${amenity.name}`);
          failed++;
        }
      }
    }

    console.log("\nDemo amenity seeding complete.");
    console.log(`Relationships processed: ${created}`);
    console.log(`Failed: ${failed}`);
  } catch (error) {
    console.error("Demo seed failed:");
    console.error(error.message);
  }
}

seedDemoVenueAmenities();