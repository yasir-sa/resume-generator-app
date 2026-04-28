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



// // module.exports = passport;

//importand
// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: "412807923502-9muib2nmglgkcm973jckrr542nrflvbd.apps.googleusercontent.com",
//       clientSecret: "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",
//       callbackURL: "http://localhost:5000/api/auth/google/callback",
//     },
//     (accessToken, refreshToken, profile, done) => {
//       console.log("ACCESS TOKEN:", accessToken); // Token check
//       console.log("PROFILE:", profile);         // Name, email, picture check
//       return done(null, profile);
//     }
//   )
// );

// passport.serializeUser((user, done) => done(null, user));
// passport.deserializeUser((user, done) => done(null, user));




// module.exports = passport;



const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: "412807923502-9muib2nmglgkcm973jckrr542nrflvbd.apps.googleusercontent.com",
      clientSecret: "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",
      
      // இங்கே மாற்றவும் 👇
      callbackURL: process.env.NODE_ENV === "production" 
        ? "https://resume-generator-app-deg4.onrender.com/api/auth/google/callback" 
        : "http://localhost:5000/api/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("ACCESS TOKEN:", accessToken);
      console.log("PROFILE:", profile);
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;