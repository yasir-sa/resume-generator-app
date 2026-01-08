const express = require("express");
const router = express.Router();

const {
  registerUser,
  verifyOTP,
  userlogin
} = require("../controllers/auth.controller");
// POST /api/register
router.post("/register", registerUser);

router.post("/verify-otp", verifyOTP)

router.post("/login",userlogin)

module.exports = router;
