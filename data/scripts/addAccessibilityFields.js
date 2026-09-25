const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "../raw/venues_raw.json");

const outputPath = path.join(
  __dirname,
  "../raw/amenities.json"
);

const venues = JSON.parse(
  fs.readFileSync(inputPath, "utf8")
);

function convertWheelchairValue(properties) {
  const wheelchair =
    properties.facilities?.wheelchair ??
    properties.datasource?.raw?.wheelchair;

  if (wheelchair === true || wheelchair === "yes") {
    return true;
  }

  if (wheelchair === false || wheelchair === "no") {
    return false;
  }

  if (wheelchair === "limited") {
    return "limited";
  }

  return null;
}

const extracted = venues.map((venue) => {
  const properties = venue.properties;

  return {
    geoapify_place_id: properties.place_id,
    name: properties.name,
    wheelchair: convertWheelchairValue(properties),
    toilets:
      properties.facilities?.toilets ?? null
  };
});




fs.writeFileSync(
  outputPath,
  JSON.stringify(extracted, null, 2),
  "utf8"
);

console.log(`${venues.length} venues processed`);
console.log(`Saved to ${outputPath}`);