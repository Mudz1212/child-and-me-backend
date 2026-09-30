const API_URL = "https://child-and-me-server.azurewebsites.net";

let passed = 0;
let failed = 0;

async function check(name, fn) {
  try {
    const result = await fn();
    if (result) {
      console.log(`PASS: ${name}`);
      passed++;
    } else {
      console.log(`FAIL: ${name} (unexpected response)`);
      failed++;
    }
  } catch (err) {
    console.log(`FAIL: ${name} (${err.message})`);
    failed++;
  }
}

async function run() {
  let token, userId, venueId, geoapifyId;

  await check("GET /", async () => {
    const res = await fetch(`${API_URL}/`);
    return res.status === 200;
  });

  await check("GET /amenities", async () => {
    const res = await fetch(`${API_URL}/amenities`);
    const data = await res.json();
    return res.status === 200 && Array.isArray(data) && data.length > 0;
  });

  await check("GET /venues", async () => {
    const res = await fetch(`${API_URL}/venues`);
    const data = await res.json();
    if (data.length > 0) {
      venueId = data[0].id;
      geoapifyId = data[0].geoapify_place_id;
    }
    return res.status === 200 && Array.isArray(data);
  });

  await check("GET /venues/:id", async () => {
    const res = await fetch(`${API_URL}/venues/${venueId}`);
    return res.status === 200;
  });

  await check("GET /venues/geoapify/:geoapifyPlaceId", async () => {
    const res = await fetch(`${API_URL}/venues/geoapify/${geoapifyId}`);
    return res.status === 200;
  });

  await check("GET /venues/:geoapifyPlaceId/reviews", async () => {
    const res = await fetch(`${API_URL}/venues/${geoapifyId}/reviews`);
    return res.status === 200;
  });

  await check("GET /venueAmenities", async () => {
    const res = await fetch(`${API_URL}/venueAmenities`);
    return res.status === 200;
  });

  const testEmail = `smoketest_${Date.now()}@example.com`;

  await check("POST /auth/register", async () => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "password123" }),
    });
    return res.status === 201;
  });

  await check("POST /auth/login", async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "password123" }),
    });
    const data = await res.json();
    token = data.token;
    userId = data.id;
    return res.status === 200 && token;
  });

  await check("POST /auth/register duplicate returns 409", async () => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "password123" }),
    });
    return res.status === 409;
  });

  await check("GET /auth rejects non-admin", async () => {
    const res = await fetch(`${API_URL}/auth`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.status === 403;
  });

  await check("GET /users/:id", async () => {
    const res = await fetch(`${API_URL}/users/${userId}`);
    return res.status === 200;
  });

  await check("PATCH /users/:id/preferences", async () => {
    const res = await fetch(`${API_URL}/users/${userId}/preferences`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferences: ["Parking"] }),
    });
    return res.status === 200;
  });

  await check("PATCH /users/:id/preferences/add", async () => {
    const res = await fetch(`${API_URL}/users/${userId}/preferences/add`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preference: "High chairs" }),
    });
    return res.status === 200;
  });

  let createdVenueId;

  await check("POST /venues (auth required)", async () => {
    const res = await fetch(`${API_URL}/venues`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: "Smoke Test Venue",
        description: "test",
        latitude: 51.5,
        longitude: -0.1,
        postcode: "SW1A 1AA",
        ageSuitability: "0-5",
      }),
    });
    const data = await res.json();
    createdVenueId = data.id;
    return res.status === 201;
  });

  await check("PATCH /venues/:id", async () => {
    const res = await fetch(`${API_URL}/venues/${createdVenueId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: "Renamed Smoke Test Venue" }),
    });
    return res.status === 200;
  });

  let reviewId;

  await check("POST /venues/:geoapifyPlaceId/reviews", async () => {
    const res = await fetch(`${API_URL}/venues/${geoapifyId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating: 4.5, comment: "Smoke test review" }),
    });
    const data = await res.json();
    reviewId = data.id;
    return res.status === 201;
  });

  await check("GET /users/:id/reviews", async () => {
    const res = await fetch(`${API_URL}/users/${userId}/reviews`);
    return res.status === 200;
  });

  await check("DELETE /venues/:geoapifyPlaceId/reviews/:reviewId", async () => {
    const res = await fetch(
      `${API_URL}/venues/${geoapifyId}/reviews/${reviewId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return res.status === 200;
  });

  await check("POST /users/:id/favourites/:geoapifyPlaceId", async () => {
    const res = await fetch(
      `${API_URL}/users/${userId}/favourites/${geoapifyId}`,
      { method: "POST" },
    );
    return res.status === 201 || res.status === 200;
  });

  await check("GET /users/:id/favourites", async () => {
    const res = await fetch(`${API_URL}/users/${userId}/favourites`);
    return res.status === 200;
  });

  await check("DELETE /users/:id/favourites/:geoapifyPlaceId", async () => {
    const res = await fetch(
      `${API_URL}/users/${userId}/favourites/${geoapifyId}`,
      { method: "DELETE" },
    );
    return res.status === 200;
  });

  console.log(`\n${passed} passed, ${failed} failed`);
}

run();
