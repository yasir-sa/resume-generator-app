const express = require("express");
const router = express.Router();

const {
  registerUser,
  verifyOTP,
  userlogin,
  checkAuth,
  logout
} = require("../controllers/auth.controller");
// POST /api/register
router.post("/register", registerUser);

router.post("/verify-otp", verifyOTP)

router.post("/login",userlogin)
router.get("/check-auth",checkAuth)
router.post("/logout", logout);

module.exports = router;
