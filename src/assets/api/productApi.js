import axios from "axios";

const API_BASE = "http://localhost:3000/api/products"; // 👈 Nếu BE chạy ở cổng 3000 (xem server.js)

export const getProducts = () => axios.get(API_BASE);
export const createProduct = (data) => axios.post(`${API_BASE}/create`, data);
export const updateProduct = (id, data) => axios.put(`${API_BASE}/${id}`, data);
export const deleteProduct = (id) => axios.delete(`${API_BASE}/${id}`);
