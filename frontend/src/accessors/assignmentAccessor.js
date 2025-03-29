// GET request to get all the assingments for a given user
export async function getUserAssignments(username) {
    const queryParam = "?username=" + username;
    const URL = "http://localhost:8000/assignments/" + queryParam;
    const isCompleted = false; 
    try {
        const response = await fetch(URL, {
            method: "GET",
            headers: {
            "Content-Type": "application/json",
            },
        });
        
        if (!response.ok) {
            throw new Error("Failed to retrieve user assignments");
        }
    
        const data = await response.json();
        console.log("Success:", data);
        return data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

// POST request to send an ICS string to the backend for a user
export async function uploadICSString(icsString, username) {
    const queryParam = "?username=" + username;
    const URL = "http://localhost:8000/assignments/upload" + queryParam;
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify(icsString)
        });
        
        if (!response.ok) {
            throw new Error("Failed to upload ICS string");
        }
    
        const data = await response.json();
        console.log("Success:", data);
        return data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}
