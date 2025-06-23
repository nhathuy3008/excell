import axios from "axios";

const API_URL = "https://excel-wcj1.onrender.com/api/accounts";

// Auth & Account
export const registerAccount = (data) => axios.post(`${API_URL}/register`, data);
export const loginAccount = (data) => axios.post(`${API_URL}/login`, data);
export const forgotPassword = (data) => axios.post(`${API_URL}/forgot-password`, data);
export const resetPassword = (data) => axios.post(`${API_URL}/reset-password`, data);

// Logged-in account
export const getMyAccount = () => axios.get(`${API_URL}/me`);
export const updateMyAccount = (data) => axios.put(`${API_URL}/me`, data);

// Admin - all accounts
export const getAllAccounts = () => axios.get(`${API_URL}`);
