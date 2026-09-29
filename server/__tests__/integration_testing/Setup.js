process.env.JWT_SECRET = process.env.JWT_SECRET || "integration-test-secret";
process.env.DB_HOST = process.env.DB_HOST || "localhost";
process.env.DB_PORT = process.env.DB_PORT || "5433";
process.env.DB_USER = process.env.DB_USER || "postgres";
process.env.DB_PASSWORD = process.env.DB_PASSWORD || "docker";
process.env.DB_NAME = process.env.DB_NAME || "child_and_me_test";
