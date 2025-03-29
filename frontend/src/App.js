import './styles.css';

import { useEffect, useState } from "react";
import { createNewUser, getAllUsers } from './accessors/userAccessor.js';
import { User } from "./models/user.ts";
import { getUserAssignments, uploadICSString } from './accessors/assignmentAccessor.js';

function App() {
  const [currentPage, setCurrentPage] = useState(window.location.pathname); // Track the current page
  const [username, setUsername] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  // const [ics, setIcs] = useState([]);
  const [assignments, setAllAssignments] = useState([]);

  // Fetch the user list when the page loads
  useEffect(() => {
    getAllUsers()
      .then((users) => setAllUsers(users))
      .catch((error) => console.error("Error:", error));
  }, []); // Empty dependency array means this will run only once, when the page first loads.

  // Fetch assignments whenever currentPage changes to '/home'
  useEffect(() => {
    if (currentPage === '/home') {
      const loggedInUsername = localStorage.getItem("username");
      if (loggedInUsername) {
        getUserAssignments(loggedInUsername)
          .then((assignments) => setAllAssignments(assignments))
          .catch((error) => console.error("Error:", error));
      }
    }
  }, [currentPage]); // This will run every time currentPage change

  function login() {
    if (username.trim() === "") {
      alert("Please enter a username to log in.");
      return;
    }

    for (let user of allUsers) {
      if (user.name === username) {
        console.log("Logging in as:", username);
        localStorage.setItem("username", username); // Store the username in local storage

        // Redirect to home page
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
    setCurrentPage('/home');
  }
  
  function uploadICSFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
      uploadICSString(event.target.result, localStorage.getItem("username"))
      .then((data) => {
        getUserAssignments(username)
        .then((assignments) => setAllAssignments(assignments))
        .catch((error) => console.error("Error:", error));
      })
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
            <button onClick={Settings}>Settings and Preferences</button>
            <button onClick={logout}>Logout</button>
          </div>
          <input type="file" onChange={(e) => uploadICSFile(e)}/>

          <div className="scrollable" id="assignment-list">
            <ul>
              {assignments.map((assignment, index) => (
                <div className="card" key={index}>
                  <p id="title">{assignment.title}</p>
                  <p id="date">Due: {assignment.dueDate}</p>
                  <p id="desc">{assignment.description}</p>
                </div>
              ))}
            </ul>
          </div>
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
