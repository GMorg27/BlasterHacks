import { User } from "../models/user.ts";

// GET request to retrieve a list of all users
export async function getAllUsers() {
    try {
        const response = await fetch("http://localhost:8000/users", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        
        if (!response.ok) {
            throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        console.log("Success:", data);
        return data.map(userData => new User(userData.name));
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

// POST request to create a new user
export async function createNewUser(user) {
    try {
        const response = await fetch("http://localhost:8000/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(user)
        });
        
        if (!response.ok) {
            throw new Error("Failed to create new user");
        }

        const data = await response.json();
        console.log("Success:", data);
        return;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}
