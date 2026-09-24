const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const SELF_SERVICE_ROLES = ["parent", "venue_owner"];

async function register(req, res) {
  const { email, password, role } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "email and password are required" });
  if (role !== undefined && !SELF_SERVICE_ROLES.includes(role))
    return res.status(400).json({ error: "Invalid role" });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, role });
  res.status(201).json(user);
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findByEmail(email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
  res.json({ token });
}

async function index(req, res) {
  const users = await User.findAll();
  res.json(users);
}

module.exports = { register, login, index };
