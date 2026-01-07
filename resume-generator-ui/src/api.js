import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true 
});

export default API;
