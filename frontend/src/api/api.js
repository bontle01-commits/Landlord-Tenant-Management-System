import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000", // Backend address
});

export default API;