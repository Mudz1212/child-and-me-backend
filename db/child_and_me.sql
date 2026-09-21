DROP TABLE IF EXISTS reviews, venue_amenities, amenities, venues, users CASCADE;

CREATE TABLE users (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'parent',
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE venues (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  postcode VARCHAR(20) NOT NULL,
  age_suitability VARCHAR(50),
  owner_id INT REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE amenities (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE venue_amenities (
  venue_id INT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  amenity_id INT NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (venue_id, amenity_id)
);

CREATE TABLE reviews (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  venue_id INT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

INSERT INTO amenities (name) VALUES
  ('Baby changing'), ('Pushchair access'), ('Parking'), ('Accessible toilet'), ('High chairs');

INSERT INTO users (email, password_hash, role) VALUES
  ('owner@example.com', 'placeholder-hash', 'venue_owner'),
  ('parent1@example.com', 'placeholder-hash', 'parent'),
  ('parent2@example.com', 'placeholder-hash', 'parent');

INSERT INTO venues (name, description, latitude, longitude, postcode, age_suitability, owner_id) VALUES
  ('Jacob the Angel', 'Cafe on Neal''s Yard, quiet corner seating.', 51.514380, -0.126166, 'WC2H 9DP', '0-5', 1),
  ('Little Leaf Cafe', 'Family-run cafe near Regent''s Park with a soft play corner.', 51.526320, -0.153980, 'NW1 6XE', '0-3', 1),
  ('The Hideout', 'Independent coffee shop, step-free entrance, wide aisles.', 51.507350, -0.127680, 'SE1 8XX', '0-8', 1),
  ('Bumble & Co', 'Baby-friendly brunch spot with a dedicated feeding room.', 51.489900, -0.176300, 'SW11 1JQ', '0-2', 1),
  ('Riverside Kitchen', 'Riverside terrace, buggy-accessible throughout.', 51.503330, -0.119500, 'SE1 9PP', '0-10', 1);

INSERT INTO venue_amenities (venue_id, amenity_id) VALUES
  (1, 1), (1, 2),
  (2, 1), (2, 2), (2, 5),
  (3, 2), (3, 4),
  (4, 1), (4, 3), (4, 5),
  (5, 1), (5, 2), (5, 3), (5, 4);

INSERT INTO reviews (venue_id, user_id, rating, comment) VALUES
  (1, 2, 5, 'Easy to get the pushchair in, staff were lovely.'),
  (1, 3, 4, 'Good spot but gets busy on weekends.'),
  (2, 2, 5, 'Soft play corner was a lifesaver.'),
  (3, 3, 3, 'Step-free but a bit cramped with a double buggy.'),
  (4, 2, 5, 'Feeding room was clean and private.'),
  (5, 3, 4, 'Lovely terrace, plenty of room to manoeuvre.');
