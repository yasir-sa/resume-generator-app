// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// require('dotenv').config();
// console.log("CRED",{
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/api/auth/google/callback", // relative is safer
//     });
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/api/auth/google/callback", // relative is safer
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       const googleData = {
//         googleId: profile.id,
//         name: profile.displayName,
//         email: profile.emails?.[0]?.value,
//         picture: profile.photos?.[0]?.value,
//       };

//       return done(null, googleData);
//     }
//   )
// );



// module.exports = passport;
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.BACKEND_URL   // 🔥 use env
    : "http://localhost:5000";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BASE_URL}/api/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;
// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;

// const BASE_URL =
//   process.env.NODE_ENV === "production"
//     ? process.env.BACKEND_URL   // 🔥 important
//     : "http://localhost:5000";

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: `${BASE_URL}/api/auth/google/callback`,
//     },
//     (accessToken, refreshToken, profile, done) => {
//       console.log("ACCESS TOKEN:", accessToken);
//       console.log("PROFILE:", profile);
//       return done(null, profile);
//     }
//   )
// );

// passport.serializeUser((user, done) => done(null, user));
// passport.deserializeUser((user, done) => done(null, user));

// module.exports = passport;