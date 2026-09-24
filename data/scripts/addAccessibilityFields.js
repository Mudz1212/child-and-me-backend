const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "../raw/venues_raw.json");

const outputPath = path.join(
  __dirname,
  "../raw/venues_enriched.json"
);

const rawVenues = JSON.parse(
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

const venues = rawVenues.map((venue) => {
  const properties = venue.properties || {};

  return {
    place_id: properties.place_id,
    name: properties.name || properties.address_line1 || "Unknown venue",

    area: properties.county || null,
    town: properties.town || properties.city || null,
    type_of_place: properties.categories || [],

    address: properties.formatted || null,
    postcode: properties.postcode || null,

    latitude: properties.lat ?? venue.geometry?.coordinates?.[1] ?? null,
    longitude: properties.lon ?? venue.geometry?.coordinates?.[0] ?? null,

    website: properties.website || null,
    opening_hours: properties.opening_hours || null,

    family_accessibility: {
      accessible_entrance: convertWheelchairValue(properties),
      prams_allowed: null,
      pram_storage: null,
      changing_facilities: null,

      additional_provisions:
        properties.facilities?.wheelchair_details?.description || null,

      table_reservation: null,
      breastfeeding_friendly: null,
      childrens_activities: null,

      accessible_toilets:
        properties.facilities?.toilets === true
          ? true
          : null
    },

    verification: {
      source: "Geoapify/OpenStreetMap",
      verified_at: null
    }
  };
});

fs.mkdirSync(path.dirname(outputPath), {
  recursive: true
});

fs.writeFileSync(
  outputPath,
  JSON.stringify(venues, null, 2),
  "utf8"
);

console.log(`${venues.length} venues processed`);
console.log(`Saved to ${outputPath}`);