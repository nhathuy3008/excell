// src/api/carApi.js
import axiosClient from "./axiosClient";

export const getCars = () => axiosClient.get("/cars");
export const getCarById = (id) => axiosClient.get(`/cars/${id}`);
export const createCar = (data) => axiosClient.post("/cars/create", data);
export const updateCar = (id, data) => axiosClient.put(`/cars/${id}`, data);
export const deleteCar = (id) => axiosClient.delete(`/cars/${id}`);
