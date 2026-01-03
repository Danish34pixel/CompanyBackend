import mongoose from "mongoose";

const billItemSchema = new mongoose.Schema({
  item: String,
  hsn: String,
  qty: Number,
  unit: String,
  price: Number,
  amount: Number,
});

const billSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    mobile: { type: String, required: true },
    items: [billItemSchema],
    subTotal: Number,
    cgst: Number,
    sgst: Number,
    grandTotal: Number,
    generatedAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Bill = mongoose.model("Bill", billSchema);
export default Bill;
