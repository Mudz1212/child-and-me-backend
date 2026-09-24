require("dotenv").config();

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set");
  process.exit(1);
}

const app = require("./app");
const PORT = process.env.PORT || 80;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
