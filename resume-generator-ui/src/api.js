// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:5000/api",
//   headers: {
//     "Content-Type": "application/json"
//   },
//   withCredentials: true 
// });

// export default API;

//importand 
// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:5000/api",
//   headers: {
//     "Content-Type": "application/json"
//   }
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

const BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://resume-generator-app-1.onrender.com/api"
    : "http://localhost:5000/api";

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 🔥 IMPORTANT for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔥 Attach token if exists
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;
