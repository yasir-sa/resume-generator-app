const express = require("express");
const router = express.Router();

const { registerUser  } = require("../controllers/auth.controller");
const { verifyOTP } = require("../controllers/auth.controller");


// POST /api/register
router.post("/register", registerUser);

router.post("/verify-otp", verifyOTP)

module.exports = router;
