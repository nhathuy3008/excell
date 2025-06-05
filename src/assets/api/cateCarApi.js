import axios from "axios";

const API_URL = "http://localhost:3000/api/catecar"; // đổi theo URL backend bạn

export const getCateCars = () => axios.get(`${API_URL}/`);
export const createCateCar = (data) => axios.post(`${API_URL}/create`, data);
export const updateCateCar = (id, data) => axios.put(`${API_URL}/${id}`, data);
export const deleteCateCar = (id) => axios.delete(`${API_URL}/${id}`);
