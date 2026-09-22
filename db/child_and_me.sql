DROP TABLE IF EXISTS reviews, venue_amenities, amenities, venues, users, search_events, search_event_amenities, partnerships, venue_amendments, venue_views CASCADE;

CREATE TABLE users (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'parent',
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE venues (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  geoapify_place_id VARCHAR(255) UNIQUE,
  category VARCHAR(255),
  address VARCHAR(255),
  borough VARCHAR(255),
  website VARCHAR(255),
  opening_hours VARCHAR(255),
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

CREATE TABLE search_events (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    radius INT CHECK (radius > 0),
    category VARCHAR(255),
    result_count INT CHECK (result_count >= 0),
    searched_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE search_event_amenities (
    search_event_id INT NOT NULL REFERENCES search_events(id) ON DELETE CASCADE,
    amenity_id INT NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (search_event_id, amenity_id)
);

CREATE TABLE reviews (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  venue_id INT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE partnerships (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    venue_id INT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    sponsored BOOLEAN NOT NULL DEFAULT FALSE,
    start_date DATE,
    end_date DATE,
    CHECK (
        end_date IS NULL
        OR start_date IS NULL
        OR end_date >= start_date
    )
);


CREATE TABLE venue_amendments (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    venue_id INT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    submitted_by INT REFERENCES users(id) ON DELETE SET NULL,
    changes TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE venue_views (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    venue_id INT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    viewed_at TIMESTAMP NOT NULL DEFAULT NOW()
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
