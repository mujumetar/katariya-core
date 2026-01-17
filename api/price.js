const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const serverless = require("serverless-http");

const app = express();

/* ================= CORS (VERCEL SAFE) ================= */
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

/* ================= DB (SERVERLESS CACHE) ================= */
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/* ================= MODEL ================= */
const PriceSchema = new mongoose.Schema(
  { price: { type: Number, default: 0 } },
  { timestamps: true }
);

const Price =
  mongoose.models.Price || mongoose.model("Price", PriceSchema);

/* ================= ROUTES ================= */
app.get("/", async (req, res) => {
  try {
    await connectDB();
    let price = await Price.findOne();
    if (!price) price = await Price.create({ price: 0 });
    res.json({ price: price.price });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/", async (req, res) => {
  try {
    await connectDB();
    const { price } = req.body;

    if (!price || price <= 0) {
      return res.status(400).json({ message: "Invalid price" });
    }

    const updated = await Price.findOneAndUpdate(
      {},
      { price },
      { new: true, upsert: true }
    );

    res.json({ success: true, price: updated.price });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= EXPORT ================= */
module.exports = serverless(app);
