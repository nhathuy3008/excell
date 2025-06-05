import axios from "axios";

const API_URL = "https://excel-ndpr.onrender.com/api/cars";

export const getCars = () => axios.get(`${API_URL}/`);
export const getCarById = (id) => axios.get(`${API_URL}/${id}`);
export const createCar = (data) => axios.post(`${API_URL}/create`, data);
export const updateCar = (id, data) => axios.put(`${API_URL}/${id}`, data);
export const deleteCar = (id) => axios.delete(`${API_URL}/${id}`);
