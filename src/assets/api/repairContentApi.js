import axios from "axios";

const API_URL = "http://localhost:3000/api/repair-contents"; // Thay đổi URL backend phù hợp

export const getRepairContents = () => axios.get(`${API_URL}/`);
export const createRepairContent = (data) => axios.post(`${API_URL}/create`, data);
export const updateRepairContent = (id, data) => axios.put(`${API_URL}/${id}`, data);
export const deleteRepairContent = (id) => axios.delete(`${API_URL}/${id}`);
