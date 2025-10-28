export type UserType = {
    id: number;
    email: string;
    avatar_url: string;
} | null;

export interface AddressType {
    id: number;
    city: string;
    ward: string;
    street: string;
    home_number: string;
    is_default: number;
    user_name: string;
    phone_number_jdo: string;
}

export type UserProfileType = {
    username: string;
    dob: string;
    gender: number;
    updated_at: string;
    phone_number: string;
} | null;