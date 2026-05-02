// const express=require("express")
// const path = require("path");
// const cors = require("cors");
// require("dotenv").config();
// const cookieParser = require("cookie-parser");
// const passport = require("./config/passport");
// const session = require("express-session");


// const app= express()
// app.set("trust proxy", 1);


// app.use(
//   session({
//     secret: "google-secret",
//     resave: false,
//     saveUninitialized: false,
//   })
// );


// app.use(cors({
//   origin: "http://localhost:5173", 
//   credentials: true
// }));
// app.use(cookieParser());
// app.use(express.json());
// app.use(passport.initialize());
// app.use(passport.session());

// const authRoutes = require("./routes/auth.routes");
// app.use("/api", authRoutes);

// const distPath = path.join(__dirname, "dist");
// app.use(express.static(distPath));

// app.get("/helo",(req,res)=>{
//     res.send("hello from resume generator API")
// });



// app.get("*", (req, res) => {
//   res.sendFile(path.join(distPath, "index.html"));
// });


// const PORT = process.env.PORT || 5000;
// app.listen(PORT,()=>{
//     console.log(`Server running on http://localhost:${PORT}`)
// });










































// const express = require("express");
// const path = require("path");
// const cors = require("cors");
// require("dotenv").config();
// const cookieParser = require("cookie-parser");
// const passport = require("./config/passport"); // passport.js
// const session = require("express-session");

// const app = express();
// app.use(express.json({ limit: "10mb" }));

// // ====================
// // Session Setup
// // ====================
// app.use(
//   session({
//     secret: "google-secret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: false,      // dev: http, prod: true if https
//       httpOnly: true,
//       sameSite: "lax",    // cross-origin cookie support
//     },
//   })
// );

// // ====================
// // Middleware
// // ====================
// app.use(
//   cors({
//     origin: "http://localhost:5173", // React frontend
//     credentials: true,
//   })
// );
// app.use(cookieParser());
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// app.use(passport.initialize());
// app.use(passport.session());

// // 🔥🔥🔥 CRITICAL: SERVE STATIC FILES FOR UPLOADED PHOTOS
// // ADD THIS LINE - WITHOUT THIS, PHOTO URLs WON'T WORK!
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // ====================
// // Routes
// // ====================
// const authRoutes = require("./routes/auth.routes");
// app.use("/api", authRoutes);

// // ====================
// // React Build / SPA
// // ====================
// const distPath = path.join(__dirname, "dist");
// app.use(express.static(distPath));

// app.get("/helo", (req, res) => {
//   res.send("hello from resume generator API");
// });

// // For all other routes, serve React index.html


// // ====================
// // Start Server
// // ====================
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`✅ Server running on http://localhost:${PORT}`);
//   console.log(`📁 Uploads folder: ${path.join(__dirname, 'uploads')}`);
// });


// app.use(express.static(path.join(__dirname, '../resume-generator-ui/dist')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../resume-generator-ui/dist/index.html'));
// });
// app.get("*", (req, res) => {
//   res.sendFile(path.join(distPath, "index.html"));
// });






















const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");
const session = require("express-session");

const app = express();

// ====================
// Render Proxy Fix
// ====================
app.set("trust proxy", 1);

// ====================
// Middleware
// ====================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ====================
// CORS Setup (PRODUCTION SAFE)
// ====================
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:5173"
    ],
    credentials: true,
  })
);

// ====================
// Session Setup (Google Login SAFE)
// ====================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "google-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// ====================
// Passport
// ====================
app.use(passport.initialize());
app.use(passport.session());

// ====================
// Static files (uploads)
// ====================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ====================
// API Routes
// ====================
const authRoutes = require("./routes/auth.routes");
app.use("/api", authRoutes);

app.get("/helo", (req, res) => {
  res.send("hello from resume generator API");
});

// ====================
// React Build Serve
// ====================
const uiDistPath = path.join(__dirname, "../resume-generator-ui/dist");

app.use(express.static(uiDistPath));

// SPA fallback route
app.get("*", (req, res) => {
  res.sendFile(path.join(uiDistPath, "index.html"));
});

// ====================
// Start Server
// ====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});











// const express = require("express");
// const path = require("path");
// const cors = require("cors");
// require("dotenv").config();
// const cookieParser = require("cookie-parser");
// const passport = require("./config/passport"); // passport.js
// const session = require("express-session");

// const app = express();

// // ====================
// // Session Setup
// // ====================
// app.use(
//   session({
//     secret: "google-secret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: false,      // dev: http, prod: true if https
//       httpOnly: true,
//       sameSite: "lax",    // cross-origin cookie support
//     },
//   })
// );

// // ====================
// // Middleware
// // ====================
// app.use(
//   cors({
//     origin: "http://localhost:5173", // React frontend
//     credentials: true,
//   })
// );
// app.use(cookieParser());
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// app.use(passport.initialize());
// app.use(passport.session());

// // ====================
// // Routes
// // ====================
// const authRoutes = require("./routes/auth.routes");
// app.use("/api", authRoutes);

// // ====================
// // React Build / SPA
// // ====================
// const distPath = path.join(__dirname, "dist");
// app.use(express.static(distPath));

// app.get("/helo", (req, res) => {
//   res.send("hello from resume generator API");
// });

// // For all other routes, serve React index.html
// app.get("*", (req, res) => {
//   res.sendFile(path.join(distPath, "index.html"));
// });

// // ====================
// // Start Server
// // ====================
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
