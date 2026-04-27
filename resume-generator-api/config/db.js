

// const { Pool } = require("pg");
// require("dotenv").config();

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
//   ssl: {
//     rejectUnauthorized: false, // Neon-க்கு இது மிகவும் முக்கியம்
//   },
//   // Pooler பயன்படுத்துவதால் இவை கூடுதல் பாதுகாப்பு தரும்
//   max: 10,
//   idleTimeoutMillis: 30000,
// });

// pool.on('error', (err) => {
//   console.error('Unexpected error on idle client', err.message);
// });

// // எளிய Query மூலம் இணைப்பை உறுதி செய்தல்
// pool.query('SELECT NOW()')
//   .then(() => console.log("Connected to Neon DB ✅"))
//   .catch(err => console.error("Connection error to Neon DB ❌", err.message));

// module.exports = {
//   query: (text, params) => pool.query(text, params),
// };



// db.js
const { Pool } = require("pg");
const { Sequelize } = require("sequelize"); // Sequelize-ஐ இம்போர்ட் செய்கிறோம்
require("dotenv").config();

// 1. பழைய Pool செட்டப் (மற்ற டேபிள்களுக்கு)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
});

// 2. புதிய ORM (Sequelize) செட்டப்
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
    logging: false, // SQL கமாண்ட்களை கன்சோலில் காட்டாமல் இருக்க
  }
);

// கனெக்ஷனை உறுதி செய்தல்
sequelize.authenticate()
  .then(() => console.log("ORM Connected to Neon DB ✅"))
  .catch(err => console.error("ORM Connection error ❌", err));

module.exports = {
  query: (text, params) => pool.query(text, params), // பழைய Pool
  sequelize, // புதிய ORM இன்ஸ்டன்ஸ்
};