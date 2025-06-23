import axios from "axios";

const API_BASE = "https://excel-wcj1.onrender.com/api/statuses";

export const getStatuses = () => axios.get(`${API_BASE}`);
export const createStatus = (data) => axios.post(`${API_BASE}/create`, data);
export const updateStatus = (id, data) => axios.put(`${API_BASE}/${id}`, data);
export const deleteStatus = (id) => axios.delete(`${API_BASE}/${id}`);
