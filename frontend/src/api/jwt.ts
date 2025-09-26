import axios from "axios"

const API_URL = "http://localhost:5000/api/jwt";

export const setAuthToken = (token?: string | null) => {
    if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    else delete axios.defaults.headers.common["Authorization"];
};

export const login = async (username: string, password: string) => {
    const res = await axios.post(`${API_URL}/login`, { username, password });
    localStorage.setItem("token", res.data.token); // lưu JWT
    return res.data;
};

export const register = async (username: string, password: string) => {
    const res = await axios.post(`${API_URL}/register`, { username, password });
    return res.data;
};

export const fetchProfile = () => axios.get(`${API_URL}/profile`);