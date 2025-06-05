import axios from "axios";

const API_BASE = "http://localhost:3000/api/solutions";

export const getSolutions = () => axios.get(`${API_BASE}`);
export const createSolution = (data) => axios.post(`${API_BASE}/create`, data);
export const updateSolution = (id, data) => axios.put(`${API_BASE}/${id}`, data);
export const deleteSolution = (id) => axios.delete(`${API_BASE}/${id}`);
