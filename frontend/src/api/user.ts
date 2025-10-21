import axios from "axios";
import type { AddressType, UserProfileType, UserType } from "../types/UserType";

const API_URL = "http://localhost:5000/api/user";

export const fetchUserById = async (id: number): Promise<UserType> => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
}

export const fetchAddressByUserId = async (id: string): Promise<AddressType[]> => {
    const res = await axios.get(`${API_URL}/${id}/address`);
    return res.data;
}

export const fetchUserProfile = async (id: string): Promise<UserProfileType> => {
    const res = await axios.get(`${API_URL}/${id}/profile`);
    return res.data;
}

export const updateProfile = async (hihi: any) => {
    const res = await axios.put(`${API_URL}/${hihi.id}/profile`, hihi);
    console.log(res);
    return res.data;
}