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
    rejectUnauthorized: false, // Neon-க்கு இது மிகவும் முக்கியம்
  },
  // Pooler பயன்படுத்துவதால் இவை கூடுதல் பாதுகாப்பு தரும்
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err.message);
});

// எளிய Query மூலம் இணைப்பை உறுதி செய்தல்
pool.query('SELECT NOW()')
  .then(() => console.log("Connected to Neon DB ✅"))
  .catch(err => console.error("Connection error to Neon DB ❌", err.message));

module.exports = {
  query: (text, params) => pool.query(text, params),
};