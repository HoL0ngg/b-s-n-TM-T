import axios from "axios"

const API_URL = "http://localhost:5000/api/admin";

export const loginAdmin = async (sdt: string, password: string) => {
    const response = await axios.post(`${API_URL}/login`, { sdt, password });
    return response.data;
}