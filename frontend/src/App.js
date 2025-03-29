import './styles.css';

import { useEffect, useState } from "react";
import { createNewUser, getAllUsers } from './accessors/userAccessor.js';
import { User } from "./models/user.ts";
import { uploadICSString } from './accessors/assignmentAccessor.js';

function App() {
  const [username, setUsername] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  // const [ics, setIcs] = useState([]);
  const [currentPage, setCurrentPage] = useState(window.location.pathname); // Track the current page

  useEffect(() => { // Only execute once when the page is opened
    getAllUsers()
    .then((users) => setAllUsers(users))
    .catch((error) => console.error("Error:", error));

    const handleLocationChange = () => setCurrentPage(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);
  // useEffect(() => { 
  //   uploadICSFile()
  //     .then((ics) => setIcs(ics))
  //     .catch((error) => console.error("Error:", error));
  // }, []);

  function login() {
    if (username.trim() === "") {
      alert("Please enter a username to log in.");
      return;
    }

    for (let user of allUsers) {
      console.log(user.name);
      if (user.name === username) {
        console.log("Logging in as:", username);
        localStorage.setItem("username", username); // Store the username in local storage

        window.history.pushState({}, '', '/home');
        setCurrentPage('/home');

        return;
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
    createNewUser(user)
    .catch((error) => console.error("Error:", error));

    //TODO: Navigate user to log in or prompt the user to log in with new account
    //TODO: If new user, navigate to a new user page 
  }

  function logout() {
    window.history.pushState({}, '', '/');
    window.location.reload();
    setCurrentPage('/');
    console.log("Logging out of", username);
    localStorage.removeItem("username");
  }

  function Settings() {
    window.history.pushState({}, '', '/settings');
    setCurrentPage('/settings');
  }

  function goHome() {
    window.history.pushState({}, '', '/home');
    window.location.reload();

    setCurrentPage('/home');
  }
  
  function uploadICSFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
      uploadICSString(event.target.result, localStorage.getItem("username"))
      .catch((error) => console.error("Error:", error));
    };

    reader.readAsText(file);
  }


  return (
    <div>
      {currentPage === '/' && (
        <div className="module">
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
      )}

      {currentPage === '/home' && (
        <div className="module">
          <div>
            <h1>Welcome, {localStorage.getItem("username")}!</h1>
            <p>This is the home page.</p>
            <button onClick={Settings}>Settings and Preferences</button>
            <button onClick={logout}>Logout</button>
          </div>
          <input type="file" onChange={(e) => uploadICSFile(e)}/>
        </div>
      )}

      {currentPage === '/settings' && (
        <div className="module">
          <div>
            <h1>Settings</h1>
            <p>This is the settings page.</p>
            <button onClick={goHome}>Home</button>
          </div>
          <p>Re-upload Calendar</p>
          {/* TODO: Update Database and Replace Calendar Entry */}
          <input type="file" onChange={(e) => uploadICSFile(e)}/>
        </div>
      )}
    </div>
  );
}

export default App;
