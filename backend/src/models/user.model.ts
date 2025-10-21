export interface User {
    phone_number: string;
    email: string;
    avatar_url: string;
}

export interface Address {
    id: number;
    city: string;
    ward: string;
    street: string;
    home_number: string;
    is_default: number;
    user_name: string;
    phone_number: string;
}

export interface UserProfile {
    username: string;
    dob: string;
    gender: number;
    avatar_url: string;
    updated_at: string;
}