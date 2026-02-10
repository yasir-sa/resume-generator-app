// const {Pool} = require("pg");
// require("dotenv").config()

// const pool =new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
//   ssl: false   // local postgresக்கு

// })

// module.exports = pool;
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false // required for Neon
  }
});

pool.connect()
  .then(() => console.log("Connected to Neon DB ✅",{user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: true // required for Neon
  }
}))
  .catch(err => console.error("Connection error to Neon DB ❌", err));

module.exports = pool;
