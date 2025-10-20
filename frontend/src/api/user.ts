import axios from "axios";
import type { UserType } from "../types/UserType";

const API_URL = "http://localhost:5000/api/user";

export const fetchUserById = async (id: number): Promise<UserType> => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
}