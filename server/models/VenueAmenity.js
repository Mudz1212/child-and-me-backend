const db = require("../db/connect");

class VenueAmenity{
    static async create(venue_id, amenity_id){
        const result = await db.query("INSERT INTO venue_amenities(venue_id, amenity_id) VALUES ($1, $2) RETURNING *", [venue_id, amenity_id]);
        return result.rows
    }

    static async getAll(){
        const result = await db.query("SELECT venue_amenities.venue_id, venue_amenities.amenity_id, amenities.name AS amenity_name FROM venue_amenities LEFT JOIN amenities ON amenities.id = venue_amenities.amenity_id ORDER BY venue_amenities.venue_id, amenities.name")
        return result.rows
    }
}

module.exports = VenueAmenity 