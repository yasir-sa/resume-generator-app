
// const express = require("express");
// const router = express.Router();
// const passport = require("passport");
// const {verifyToken} =require("../config/jwt.js")
// const {
//   registerUser,
//   verifyOTP,
//   userlogin,
//   checkAuth,
//   logout,
//   googlelogin,
//   getUserProfile ,
//   getTitles,
//   createTitle ,
//   getChatMessages,
//   sendMessage,
//  clearChatByTitleId,
// deleteChatTitle,
//  updateChatTitle,
//  setPassword,
// submitResume, 
// saveResume,


  

//    // 👈 IMPORT IMPORTANT
// } = require("../controllers/auth.controller");

// // 🔹 Google OAuth start
// router.get(
//   "/auth/google",
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//   })
// );

// // 🔹 Google OAuth callback
// router.get(
//   "/auth/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: "/login",
//     session: false, // 🔥 JWT use panrom, session venam
//   }),
//   googlelogin // 👈 IPPO THAN UNGA CODE RUN AGUM ✅
// );

// // 🔹 Normal Auth
// router.get(
//   "/getChatMessages/:chattitle_id",
//   verifyToken,
//   getChatMessages
// );

// router.post("/save-resume",verifyToken,saveResume)
// router.post("/resume-details",submitResume);
// router.post("/user/set-password",verifyToken,setPassword);
// router.put("/chattitle-ubdate/:id",updateChatTitle);
// router.delete("/chattitle-delete/:id",deleteChatTitle);
// router.delete("/clear-chat/:titleid",clearChatByTitleId)
// router.post("/send-message", verifyToken, sendMessage);
// router.post("/create/newchat",verifyToken,createTitle);
// router.get("/getTitles", verifyToken, getTitles);
// router.get("/user/profile",verifyToken,getUserProfile);
// router.post("/register", registerUser);
// router.post("/verify-otp", verifyOTP);
// router.post("/login", userlogin);
// router.get("/check-auth", checkAuth);
// router.post("/logout", logout);

// module.exports = router;

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
  getUserProfile ,
  getTitles,
  createTitle ,
  getChatMessages,
  sendMessage,
  clearChatByTitleId,
  deleteChatTitle,
  updateChatTitle,
  setPassword,
  submitResume, 
  saveResume,
  uploadResumePhoto,    // 🔥 NEW: Photo upload middleware
  handlePhotoUpload,
  getAllTitles , 
  updateResumeTitle,
  deleteResumeTitle,
                      // 🔥 NEW: Photo upload handler
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
    session: false,
  }),
  googlelogin
);

// 🔹 Normal Auth
router.get(
  "/getChatMessages/:chattitle_id",
  verifyToken,
  getChatMessages
);





router.put("/update-resume-title", updateResumeTitle);
router.delete("/delete-resume-title/:id", deleteResumeTitle);
router.get("/getall-titles", verifyToken, getAllTitles);
router.post("/save-resume",verifyToken,saveResume)

// 🔥🔥🔥 CRITICAL: HANDLE BOTH PHOTO UPLOAD AND RESUME GENERATION
// This route handles both multipart/form-data (photo) and application/json (resume data)
router.post("/resume-details", (req, res, next) => {
  // Check if this is a file upload request (multipart/form-data)
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    // This is PHOTO UPLOAD
    return uploadResumePhoto(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
      // After multer processes the file, call the handler
      handlePhotoUpload(req, res);
    });
  } else {
    // This is RESUME GENERATION (JSON data)
    return submitResume(req, res);
  }
});

router.post("/user/set-password",verifyToken,setPassword);
router.put("/chattitle-ubdate/:id",updateChatTitle);
router.delete("/chattitle-delete/:id",deleteChatTitle);
router.delete("/clear-chat/:titleid",clearChatByTitleId);
router.post("/send-message", verifyToken, sendMessage);
router.post("/create/newchat",verifyToken,createTitle);
router.get("/getTitles", verifyToken, getTitles);
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