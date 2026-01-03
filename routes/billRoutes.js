import express from "express";
import { createBill, listBills } from "../controllers/billController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Save a bill (auth optional)
router.post("/", authMiddleware, createBill);
// List bills for user
router.get("/", authMiddleware, listBills);

export default router;
