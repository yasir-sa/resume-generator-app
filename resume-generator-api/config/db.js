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
// const { Pool } = require("pg");
// require("dotenv").config();

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
//   ssl: {
//     rejectUnauthorized: false // required for Neon
//   }
// });

// pool.connect()
//   .then(() => console.log("Connected to Neon DB ✅",{user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
//   ssl: {
//     rejectUnauthorized: true // required for Neon
//   }
// }))
//   .catch(err => console.error("Connection error to Neon DB ❌", err));

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
    rejectUnauthorized: false, // Keep this false for Neon unless using custom CA
  },
  // Adding these helps manage serverless "idling"
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

// CRITICAL: This prevents the app from crashing if a connection drops
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit the process; the pool will try to create a new client on the next request
});

pool.connect()
  .then(() => console.log("Connected to Neon DB ✅"))
  .catch(err => console.error("Connection error to Neon DB ❌", err));

module.exports = pool;
