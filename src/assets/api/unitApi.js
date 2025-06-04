import axios from "axios";

const API_URL = "http://localhost:3000/api/units";

export const getUnits = () => axios.get(API_URL);

export const createUnit = (name) => axios.post(`${API_URL}/create`, { name });

export const deleteUnit = (id) => axios.delete(`${API_URL}/${id}`);

export const updateUnit = (id, name) => axios.put(`${API_URL}/${id}`, { name });
