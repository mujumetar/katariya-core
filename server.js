const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

/* ================= MIDDLEWARE ================= */
app.use(cors({
  origin: "*",
  methods: ["GET", "PUT"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/* ================= DB CONNECTION ================= */
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
  console.log("MongoDB Connected");
}

/* ================= MODEL ================= */
const PriceSchema = new mongoose.Schema(
  { price: { type: Number, default: 0 } },
  { timestamps: true }
);

const Price = mongoose.models.Price || mongoose.model("Price", PriceSchema);

/* ================= ROUTES ================= */
app.get("/", async (req, res) => {
  try {
    await connectDB();

    let price = await Price.findOne();
    if (!price) price = await Price.create({ price: 0 });

    res.json({ price: price.price });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/", async (req, res) => {
  try {
    await connectDB();
    const { price } = req.body;

    if (price === undefined || price < 0) {
      return res.status(400).json({ message: "Invalid price" });
    }

    const updated = await Price.findOneAndUpdate(
      {},
      { price },
      { new: true, upsert: true }
    );

    res.json({ success: true, price: updated.price });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= START SERVER ================= */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
