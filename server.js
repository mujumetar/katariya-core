const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

/* ================= MIDDLEWARE ================= */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});


app.use(express.json());

/* ================= DB CONNECTION ================= */
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  await mongoose.connect("mongodb+srv://muzammilmetar82_db_user:jotodiQ7SejvtAID@katariya.pqt28ne.mongodb.net/?appName=KATARIYA");
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
