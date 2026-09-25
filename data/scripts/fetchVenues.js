const fs = require("fs");
const path = require("path");
require('dotenv').config()

const API_KEY = process.env.API_KEY;

// Approximate centre of Hertfordshire
const longitude = -0.2237;
const latitude = 51.8098;

// Radius is measured in metres
const radius = 35000;
const limit = 100;

const categories = ["catering.cafe", "catering.restaurant", "entertainment.museum", "leisure.playground"];


async function fetchCategory(category) {
  const url = new URL("https://api.geoapify.com/v2/places");

  url.searchParams.append("categories", category);

  url.searchParams.append(
    "filter",
    `circle:${longitude},${latitude},${radius}`
  );

  url.searchParams.append(
    "bias",
    `proximity:${longitude},${latitude}`
  );

  url.searchParams.append("limit", limit);
  url.searchParams.append("apiKey", API_KEY);

  console.log(`Fetching...`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Geoapify request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  console.log(
    `${category}: ${data.features.length} venues returned`
  );

  return data.features;
}



async function fetchVenues() {

  let allVenues = [];

  for (const category of categories) {
    const venues = await fetchCategory(category);

    allVenues = allVenues.concat(venues);
  }



  const outputPath = path.join(
    __dirname,
    "../raw/venues_raw.json"
  );

  fs.writeFileSync(outputPath, JSON.stringify(allVenues, null, 2),"utf8");

  console.log(`Total raw venues: ${allVenues.length}`);
}


fetchVenues().catch((error) => {
  console.error("Error fetching venues:");
  console.error(error);
});
