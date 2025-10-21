export interface UserType {
    id: number;
    email: string;
    avatar_url: string;
}

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

export interface UserProfileType {
    username: string;
    dob: string;
    gender: number;
    avatar_url: string;
    updated_at: string;
}