import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

export const signup = async (req, res) => {
  const { phone, email, password } = req.body;
  if (!phone || !email || !password) {
    return res
      .status(400)
      .json({ message: "Phone, email, and password required" });
  }
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      phone,
      email,
      password: hashedPassword,
      isVerified: true,
    });
    await user.save();
    res.status(201).json({ message: "User created", email });
  } catch (err) {
    console.error("Signup error:", err && err.message ? err.message : err);
    if (err && err.stack) console.error(err.stack);
    // Return error message to client in debug mode so deployed logs show root cause.
    // NOTE: Remove or sanitize this in production for security.
    res.status(500).json({
      message: "Server error",
      error: err && err.message ? err.message : String(err),
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Account not verified. Please verify OTP." });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// OTP verification endpoint
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    user.isVerified = true;
    user.otp = undefined;
    await user.save();
    res.json({ message: "Account verified. You can now log in." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
