import Bill from "../models/Bill.js";

export const createBill = async (req, res) => {
  try {
    const {
      customerName,
      mobile,
      items,
      subTotal,
      cgst,
      sgst,
      grandTotal,
      generatedAt,
    } = req.body;
    if (!customerName || !mobile || !items || !items.length) {
      return res.status(400).json({ message: "Missing bill data" });
    }
    const bill = new Bill({
      customerName,
      mobile,
      items,
      subTotal,
      cgst,
      sgst,
      grandTotal,
      generatedAt: generatedAt ? new Date(generatedAt) : new Date(),
      createdBy: req.user ? req.user.id : undefined,
    });
    await bill.save();
    res.status(201).json({ message: "Bill saved", bill });
  } catch (err) {
    console.error("Create bill error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const listBills = async (req, res) => {
  try {
    const query = {};
    if (req.user) query.createdBy = req.user.id;
    const bills = await Bill.find(query).sort({ createdAt: -1 }).limit(100);
    res.json({ bills });
  } catch (err) {
    console.error("List bills error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
