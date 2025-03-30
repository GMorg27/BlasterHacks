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

// GET request to retrieve a list of friends of the user
export async function getUserFriends(username) {
    const queryParam = "?username=" + username;
    const URL = "http://localhost:8000/users/friends" + queryParam;
    try {
        const response = await fetch(URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        
        if (!response.ok) {
            throw new Error("Failed to fetch friends for " + username);
        }

        const data = await response.json();
        console.log("Success:", data);
        return data.map(userData => new User(userData.name));
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

// GET request to retrieve a list of notifications for the user
export async function getUserNotifications(username) {
    const queryParam = "?username=" + username;
    const URL = "http://localhost:8000/users/notifications" + queryParam;
    try {
        const response = await fetch(URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        
        if (!response.ok) {
            throw new Error("Failed to fetch notifications for " + username);
        }

        const data = await response.json();
        console.log("Success:", data);
        return data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

// GET request to get the user's star count
export async function getStarCount(username) {
    const URL = "http://localhost:8000/users/stars?username=" + username;
    try {
        const response = await fetch(URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        
        if (!response.ok) {
            throw new Error("Failed to fetch notifications for " + username);
        }

        const data = await response.json();
        console.log("Success:", data);
        return data;
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
        return data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

// POST request to make two users friends
export async function addFriendship(username1, username2) {
    const URL = "http://localhost:8000/users/friends?firstUser=" + username1 + "&secondUser=" + username2;
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });
        
        if (!response.ok) {
            throw new Error("Failed to add friend");
        }

        const data = await response.json();
        console.log("Success:", data);
        return data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

// POST request to send a notification to the user
export async function sendNotification(username, notification) {
    const URL = "http://localhost:8000/users/notifications?username=" + username;
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(notification)
        });
        
        if (!response.ok) {
            throw new Error("Failed to send notification to " + username);
        }

        const data = await response.json();
        console.log("Success:", data);
        return data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

// POST request to update the user's notifications
export async function updateNotifications(username, notifications) {
    const URL = "http://localhost:8000/users/notifications/update?username=" + username;
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(notifications)
        });
        
        if (!response.ok) {
            throw new Error("Failed to send notification to " + username);
        }

        const data = await response.json();
        console.log("Success:", data);
        return data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

// PUT request to give the user a star
export async function giveStar(username) {
    const URL = "http://localhost:8000/users/stars?username=" + username;
    try {
        const response = await fetch(URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
        });
        
        if (!response.ok) {
            throw new Error("Failed to give star to " + username);
        }

        const data = await response.json();
        console.log("Success:", data);
        return data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}
