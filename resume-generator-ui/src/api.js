// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:5000/api",
//   headers: {
//     "Content-Type": "application/json"
//   },
//   withCredentials: true 
// });

// export default API;

// import axios from "axios";

// // 🔥 Detect environment (local or production)
// const BASE_URL =
//   window.location.hostname === "localhost"
//     ? "http://localhost:5000/api"
//     : "https://your-render-url.onrender.com/api"; // 🔁 change this

// const API = axios.create({
//   baseURL: BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   withCredentials: true, // 🔥 important for cookies (Google login)
// });

// // 🔥 Automatically attach token
// API.interceptors.request.use((req) => {
//   const token = localStorage.getItem("token");

//   if (token) {
//     req.headers.Authorization = `Bearer ${token}`;
//   }

//   return req;
// });

// export default API;


import axios from "axios";

// 🔥 Detect environment
const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "/api";

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 🔥 very important for cookies
});

// 🔥 Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;