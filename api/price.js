const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const serverless = require("serverless-http");

const app = express();

app.use(express.json());
app.use(cors({
  origin: "*",  // Allow all origins (or specify e.g., "http://localhost:5173" for dev)
  methods: ["GET", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

// Handle OPTIONS preflight
app.options("*", cors());

// MongoDB Connection (cached for serverless)
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,  // Better for serverless
    });
  }
  try {
    cached.conn = await cached.promise;
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
  return cached.conn;
}

// Model
const PriceSchema = new mongoose.Schema(
  { price: { type: Number, default: 0 } },
  { timestamps: true }
);
const Price = mongoose.models.Price || mongoose.model("Price", PriceSchema);

// Routes
app.get("/", async (req, res) => {
  try {
    await connectDB();
    let price = await Price.findOne();
    if (!price) price = await Price.create({ price: 0 });
    res.json({ price: price.price });
  } catch (err) {
    console.error("GET error:", err);
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
    console.error("PUT error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Export without basePath (Vercel handles routing)
module.exports = serverless(app);