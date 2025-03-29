import './App.css';

import { useEffect, useState } from "react";

import { createNewUser, getAllUsers } from './accessors/userAccessor.js';
import { User } from "./models/user.ts";

/**
 * The starting page for the app, prompting the user to log in or sign up.
 */
function App() {
  const [username, setUsername] = useState("");
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => { // Only execute once when the page is opened
    getAllUsers()
    .then((users) => setAllUsers(users))
    .catch((error) => console.error("Error:", error));
  }, []);

  function login() {
    if (username.trim() === "") {
      alert("Please enter a username to log in.");
      return;
    }

    for (let user of allUsers) {
      console.log(user.name);
      if (user.name === username) {
        console.log("Logging in as:", username);
        return
      }
    }
    alert("User " + username + " not found.");
  }

  function signUp() {
    if (username.trim() === "") {
      alert("Please enter a username to sign up.");
      return;
    }

    const user = new User(username);
    createNewUser(user);
  }

  return (
    <div className="App">
      <h1>BlasterHacks 2025</h1>

      <div id="sign-in">
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <button onClick={login}>Login</button>
          <button onClick={signUp}>Sign Up</button>
        </div>
      </div>
    </div>
  );
}

export default App;
