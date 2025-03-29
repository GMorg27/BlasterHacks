import './styles.css';

import { useEffect, useState } from "react";
import { createNewUser, getAllUsers, getUserFriends, addFriendship } from './accessors/userAccessor.js';
import { User } from "./models/user.ts";
import { getUserAssignments, uploadICSString } from './accessors/assignmentAccessor.js';

function App() {
  const [currentPage, setCurrentPage] = useState(window.location.pathname); // Track the current page
  const [username, setUsername] = useState("");
  const [friendname, setFriendname] = useState("");
  const [allFriends, setAllFriends] = useState([]);
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
      setAllAssignments([]);
      const loggedInUsername = localStorage.getItem("username");
      if (loggedInUsername) {
        getUserAssignments(loggedInUsername)
        .then((assignments) => setAllAssignments(assignments))
        .catch((error) => console.error("Error:", error));

        getUserFriends(loggedInUsername)
        .then((allFriends) => setAllFriends(allFriends))
        .catch((error) => console.error("Error:", error));
      }
    }
  }, [currentPage]); // This will run every time currentPage change

  function loginPressed() {
    if (username.trim() === "") {
      alert("Please enter a username to log in.");
      return;
    }

    for (let user of allUsers) {
      if (user.name === username) {
        login(username);
        return;
      }
    }
    alert("User " + username + " not found.");
  }

  function signUpPressed() {
    if (username.trim() === "") {
      alert("Please enter a username to sign up.");
      return;
    }

    for (let user of allUsers) {
      if (user.name === username) {
        alert("Username " + username + " already taken.")
        return;
      }
    }

    const user = new User(username);
    createNewUser(user)
    .then((data) => {
      getAllUsers()
      .then((users) => setAllUsers(users))
      .catch((error) => console.error("Error:", error));
      login(username)
    })
    .catch((error) => console.error("Error:", error));
    
  }

  function login(username) {
    console.log("Logging in as:", username);
    localStorage.setItem("username", username); // Store the username in local storage

    // Redirect to home page
    window.history.pushState({}, '', '/home');
    setCurrentPage('/home');
  }

  function logout() {
    window.history.pushState({}, '', '/');
    setCurrentPage('/');
    console.log("Logging out of", username);
    localStorage.removeItem("username");
    setAllAssignments([]);
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
      const name = localStorage.getItem("username")
      uploadICSString(event.target.result, name)
      .then((data) => {
        getUserAssignments(name)
        .then((assignments) => setAllAssignments(assignments))
        .catch((error) => console.error("Error:", error));
      })
      .catch((error) => console.error("Error:", error));
    };

    reader.readAsText(file);
  }

  function addFriendPressed() {
    if (friendname === "") return;

    if (friendname === localStorage.getItem("username")) {
      alert("That's you, silly.");
      return;
    }

    for (let friend of allFriends) {
      if (friend.name === friendname) {
        alert(friendname + " is already your friend!");
        return;
      }
    }

    for (let user of allUsers) {
      if (user.name === friendname) {
        addFriendship(localStorage.getItem("username"), friendname)
        .then((data) => {
          setAllFriends((prevFriends) => {
            const updatedFriends = [...prevFriends, user];
            return updatedFriends;
          });
        })
        .catch((error) => console.error("Error:", error));
        return;
      }
    }

    alert("User " + friendname + " not found!");
  }


  return (
    <div>
      {currentPage === '/' && (
        <div className="module">
          <h1>BlasterHacks 2025</h1>

          <div className="margin-lg">
            <div>
              <label style={{ marginRight: "5px" }} htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="margin-lg">
              <button style={{ marginRight: "10px" }} onClick={loginPressed}>Login</button>
              <button onClick={signUpPressed}>Sign Up</button>
            </div>
          </div>
        </div>
      )}

      {currentPage === '/home' && (
        <div className="container">
          <div className="module">
            <h1>Welcome, {localStorage.getItem("username")}!</h1>
            
            <div className="margin-lg">
              <button onClick={Settings} style={{ marginRight: "10px" }}>Settings</button>
              <button onClick={logout}>Logout</button>
            </div>
            <input className="file-upload" type="file" onChange={(e) => uploadICSFile(e)}/>

            <div style={{ textAlign: "left" }}><h2>Tasks</h2></div>
            <div className="scrollable" id="assignment-list">
              <ul>
                {assignments.length === 0 ? 
                <p>No assignments left! Good job :)</p>
                : assignments.map((assignment, index) => (
                  <div className="card" key={index}>
                    <p id="title">{assignment.title}</p>
                    <p id="date">Due: {assignment.dueDate}</p>
                    <p id="desc">{assignment.description}</p>
                  </div>
                ))}
              </ul>
            </div>
          </div>

          <div className="module">
            <h2>Friends</h2>
            <div>
              <input
                type="text"
                id="friendname"
                name="friendname"
                value={friendname}
                onChange={(e) => setFriendname(e.target.value)}
              />
            </div>
            <div style={{marginTop: "5px", marginBottom: "25px"}}>
              <button onClick={addFriendPressed}>Add Friend</button>
            </div>
            <div className="scrollable" id="friends-list">
              <ul style={{width: "100%"}}>
                {allFriends.map((friend, index) => (
                  <div key={index} style={index % 2 === 0 ? {backgroundColor: "white"} : {backgroundColor : "#F7EEDE"}}>
                    <p>{friend.name}</p>
                  </div>
                ))}
              </ul>
            </div>
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
          <input className="file-upload" type="file" onChange={(e) => uploadICSFile(e)}/>
        </div>
      )}
    </div>
  );
}

export default App;
