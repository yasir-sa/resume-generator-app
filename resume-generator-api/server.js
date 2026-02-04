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


const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const passport = require("./config/passport"); // passport.js
const session = require("express-session");

const app = express();

// ====================
// Session Setup
// ====================
app.use(
  session({
    secret: "google-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,      // dev: http, prod: true if https
      httpOnly: true,
      sameSite: "lax",    // cross-origin cookie support
    },
  })
);

// ====================
// Middleware
// ====================
app.use(
  cors({
    origin: "http://localhost:5173", // React frontend
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(passport.initialize());
app.use(passport.session());

// ====================
// Routes
// ====================
const authRoutes = require("./routes/auth.routes");
app.use("/api", authRoutes);

// ====================
// React Build / SPA
// ====================
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

app.get("/helo", (req, res) => {
  res.send("hello from resume generator API");
});

// For all other routes, serve React index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// ====================
// Start Server
// ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
