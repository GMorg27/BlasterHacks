import { User } from "../models/user.ts";


// POST request to send ICS file to the backend
export async function uploadICSFile(user) {
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
