
const express = require("express");
const router = express.Router();
const passport = require("passport");
const {verifyToken} =require("../config/jwt.js")
const {
  registerUser,
  verifyOTP,
  userlogin,
  checkAuth,
  logout,
  googlelogin,
  getUserProfile   // 👈 IMPORT IMPORTANT
} = require("../controllers/auth.controller");

// 🔹 Google OAuth start
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// 🔹 Google OAuth callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false, // 🔥 JWT use panrom, session venam
  }),
  googlelogin // 👈 IPPO THAN UNGA CODE RUN AGUM ✅
);

// 🔹 Normal Auth
router.get("/user/profile",verifyToken,getUserProfile);
router.post("/register", registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/login", userlogin);
router.get("/check-auth", checkAuth);
router.post("/logout", logout);

module.exports = router;


















// const express = require("express");
// const router = express.Router();
// const passport = require("passport");
// const {googlelogin }=require("../controllers/auth.controller")
// const {verifyToken} =require("../config/jwt")
// const {
//   registerUser,
//   verifyOTP,
//   userlogin,
//   checkAuth,
//   logout,
//   getUserProfile
// } = require("../controllers/auth.controller");

// // // 🔹 Google OAuth
// // router.get(
// //   "/auth/google",
// //   passport.authenticate("google", {
// //     scope: ["profile", "email"],
// //   })
// // );

// // router.get(
// //   "/auth/google/callback",

// //   (req, res) => {
// //     console.log('Req',req);
// //     res.send("Google login success ✅");
// //   }
// // );


// // Google Login Route
// // ====================
// router.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })


// );

// // ====================
// // Google Callback Route
// // ====================
// router.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/" }),
//    googlelogin,
 
//   (req, res) => {
//     // Success: User data / token check
//     console.log("USER PROFILE:", req.user); // profile data console-ல் பார்க்கலாம்
//     res.send("Google Login Success ✅ Check console for profile");
//   }
// );


// router.get("/profile", verifyToken, getUserProfile);

// // 🔹 Normal Auth
// router.post("/register", registerUser);
// router.post("/verify-otp", verifyOTP);
// router.post("/login", userlogin);
// router.get("/check-auth", checkAuth);
// router.post("/logout", logout);

// module.exports = router;