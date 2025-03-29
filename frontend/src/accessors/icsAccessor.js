// POST request to send ICS file to the backend
export async function uploadICSFile(icsString) {
  try {
    const response = await fetch("http://localhost:8000/icsFiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(icsString)
    });
    
    if (!response.ok) {
      throw new Error("Failed to upload ICS file");
    }

    const data = await response.json();
    console.log("Success:", data);
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
