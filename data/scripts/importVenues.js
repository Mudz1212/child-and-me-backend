const fs = require("fs");
const path = require("path");
require("dotenv").config();

const filePath = path.join(__dirname, "../cleaned/venues_cleaned.json");

const venues = JSON.parse(fs.readFileSync(filePath, "utf8"));

async function importVenues() {
  try {
    console.log(`Sending venues...`);

    const response = await fetch("http://4.223.159.135/venues/import", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(venues),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed: ${response.status}`);
    }

    console.log("Import complete");

    console.log(data);
  } catch (error) {
    console.error("Import failed:");
    console.error(error.message);
  }
}

importVenues();
