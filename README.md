# child-and-me

Baby & Me backend — Postgres DB + Express API. Primary model: Venues.
Frontend lives in a separate repository and is not part of this project.

```
child-and-me/
├── db/            Postgres — child_and_me.sql (schema + seed data)
├── server/        Express API — auth, venues, reviews, amenities
├── terraform/      backend/ (state storage) + infrastructure/ (VM, network, firewall)
├── docker-compose.yml
└── Jenkinsfile     build → push → terraform plan → apply (gated)
```

## Local dev

```
docker compose up -d child-and-me-db
cd server && npm install && npm run dev     # http://localhost:3001
```

## API endpoints

Hit `GET /` on the running server for a live list, e.g. `curl localhost:3001/`.
