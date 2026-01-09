const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

/* ================= DATABASE ================= */
mongoose
  .connect("mongodb+srv://muzammilmetar82_db_user:rvEX2A63uXAK364y@katariya.pqt28ne.mongodb.net/?appName=KATARIYA")
  .then(() => console.log("MongoDB Connected cloud"))
  .catch(console.error);

/* ================= MODEL ================= */
const Price = mongoose.model(
  "Price",
  new mongoose.Schema(
    {
      price: {
        type: Number,
        required: true,
        default: 0
      }
    },
    { timestamps: true }
  )
);

/* ================= ROUTES ================= */

/* GET consultation fee (public) */
app.get("/api/price", async (req, res) => {
  let price = await Price.findOne();

  // If not exists, auto-create
  if (!price) {
    price = await Price.create({ price: 0 });
  }

  res.json({ price: price.price });
});

/* SET / UPDATE consultation fee (admin) */
app.put("/api/price", async (req, res) => {
  const { price } = req.body;

  if (price == null || price < 0) {
    return res.status(400).json({ message: "Invalid price" });
  }

  const updated = await Price.findOneAndUpdate(
    {},
    { price },
    { new: true, upsert: true }
  );

  res.json({
    success: true,
    price: updated.price
  });
});

/* ================= SERVER ================= */
app.listen(5000, () => {
  console.log("Server running → http://localhost:5000");
});
