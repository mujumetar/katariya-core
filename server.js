const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

/* ================= DATABASE ================= */
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(
    "mongodb+srv://muzammilmetar82_db_user:rvEX2A63uXAK364y@katariya.pqt28ne.mongodb.net/katariya",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );

  isConnected = true;
  console.log("MongoDB Connected (Vercel)");
}

/* ================= MODEL ================= */
const PriceSchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

const Price =
  mongoose.models.Price || mongoose.model("Price", PriceSchema);

/* ================= ROUTES ================= */

app.get("/api/price", async (req, res) => {
  try {
    await connectDB();

    let price = await Price.findOne();
    if (!price) {
      price = await Price.create({ price: 0 });
    }

    res.json({ price: price.price });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.put("/api/price", async (req, res) => {
  try {
    await connectDB();

    const { price } = req.body;
    if (price == null || price < 0) {
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
    res.status(500).json({ message: "Server Error" });
  }
});

/* ================= EXPORT ================= */
module.exports = app;
