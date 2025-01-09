// Already simple. Tests ensure username/password are strings and password length is sufficient.

export interface CreateUserDTO {
    username: string;
    password: string;
    role?: string; // Optioneel, standaard naar 'user' als niet opgegeven
}

