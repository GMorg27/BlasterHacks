import './styles.css';

import { ReactComponent as StarIcon } from './assets/star.svg';
import data from './assets/Dizzy.png';
import { useEffect, useState } from "react";

import { createNewUser, getAllUsers, getUserFriends, addFriendship, getUserNotifications, sendNotification, getStarCount, giveStar, updateNotifications } from './accessors/userAccessor.js';
import { User } from "./models/user.ts";
import { getUserAssignments, uploadICSString, updateAssignments } from './accessors/assignmentAccessor.js';
import { Activity } from './models/notification.ts';

function App() {
  const [currentPage, setCurrentPage] = useState(window.location.pathname); // Track the current page
  const [username, setUsername] = useState("");
  const [friendname, setFriendname] = useState("");
  const [allFriends, setAllFriends] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allNotifs, setAllNotifs] = useState([]);
  const [assignments, setAllAssignments] = useState([]);
  const [stars, setStars] = useState(0);
  const [starDisplay, setStarDisplay] = useState([]);
  const [progress, setProgress] = useState(0);
  
  const boxWidth = 150;
  const boxHeight = 125;
  const starSize = 25;


  const handleSend = () => {
    if (!("Notification" in window)) {
      alert("Not Supported")
      return
    }

    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        const notification = new Notification("BlasterHacks 2025", {
          body: "Hackathon Notification!!",
          icon: data // Replace with your icon URL
        });
        notification.onclick = () => {
          window.open("https://blasterhacks.com", "_blank")
        }

      }
    })

  }




  // Handle navigation with arrows
  useEffect(() => {
    const handlePopState = () => setCurrentPage(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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

        getUserNotifications(loggedInUsername)
          .then((allNotifs) => setAllNotifs(allNotifs))
          .catch((error) => console.error("Error:", error));

        getStarCount(loggedInUsername)
          .then((count) => setStars(count))
          .catch((error) => console.error("Error:", error));
      }
      else {
        window.history.pushState({}, '', '/');
        setCurrentPage('/');
      }
    }
  }, [currentPage]);

  // Update star locations
  useEffect(() => {
    setStarDisplay(Array.from({ length: stars }, (_, i) => ({
      id: i,
      x: Math.random() * (boxWidth - starSize), // Prevent overflow
      y: Math.random() * (boxHeight - starSize),
    })));
  }, [stars]);

  // Update progress bar
  useEffect(() => {
    let completedCount = 0
    for (let assignment of assignments) {
      if (assignment.isCompleted)
        completedCount++;
    }
    const newProgress = assignments.length === 0 ? 100 : Math.round(100.0 * completedCount / assignments.length);
    setProgress(newProgress);
  }, [assignments]);

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
    setAllFriends([]);
    setAllNotifs([]);
    setUsername("");
    setFriendname("");
    setStars(0);
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
    reader.onload = function (event) {
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
        const updatedFriends = [...allFriends, user];
        setAllFriends(updatedFriends);
        addFriendship(localStorage.getItem("username"), friendname)
        .catch((error) => console.error("Error:", error));
        return;
      }
    }

    alert("User " + friendname + " not found!");
  }

  function completeAssignment(index) {
    let updatedAssignments = [...assignments];
    updatedAssignments[index] = { ...updatedAssignments[index], isCompleted: true };
    setAllAssignments(updatedAssignments);

    updateAssignments(localStorage.getItem("username"), updatedAssignments)
      .then((data) => {
        const notif = new Activity(localStorage.getItem("username"), assignments[index].title);
        for (let friend of allFriends) {
          sendNotification(friend.name, notif)
            .catch((error) => console.error("Error:", error));
        }
      })
      .catch((error) => console.error("Error:", error));
  }

  function giveStarPressed(notifIndex) {
    let updatedNotifs = [...allNotifs];
    const notif = updatedNotifs[notifIndex];

    // Clear the notification
    updatedNotifs.splice(notifIndex, 1);
    setAllNotifs(updatedNotifs);
    updateNotifications(localStorage.getItem("username"), updatedNotifs)
      .catch((error) => console.error("Error:", error));

    giveStar(notif.friendName)
      .catch((error) => console.error("Error:", error));
  }

  return (
    <div>
      {currentPage === '/' && (
        <div className="module">
          <h1 id="splash-title">StarBox</h1>
          <div id="splash-box">
            <StarIcon width={100} height={100}/>
            <h3 id="splash-overlay">A social motivational tool</h3>
          </div>

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
        <div className="column-container">
          <div className="module">

            <h1>Welcome, {localStorage.getItem("username")}!</h1>

            <div className="margin-lg">

              <button onClick={handleSend}>Send Notification</button>
              <button onClick={Settings} style={{ marginRight: "10px" }}>Settings</button>
              <button onClick={logout}>Logout</button>
            </div>
            <input className="file-upload" type="file" onChange={(e) => uploadICSFile(e)} />

            <div style={{ textAlign: "left" }}><h2>Tasks</h2></div>
            <div className="progress-outer">
              <div class="progress-inner" style={{ width: `${progress}%` }}></div>
              <p class="text-overlay">{progress}%</p>
            </div>
            <div className="scrollable" id="assignment-list">
              <ul>
                {assignments.length === 0 ? (
                  <li>No assignments; upload a calendar file</li>) : (
                  assignments.map((assignment, index) => (
                    <li className={assignment.isCompleted ? 'card overlay' : 'card'} key={index}>
                      <div className="column-container">
                        <div className="column">
                          <p id="title">{assignment.title}</p>
                          <p id="date">Due: {assignment.dueDate}</p>
                          <p id="desc">{assignment.description}</p>
                        </div>
                        {assignment.isCompleted ? null :
                          <button
                            onClick={() => completeAssignment(index)}
                            style={{ marginLeft: "5px" }}
                          >
                            Done
                          </button>}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          <div className="column" id="friends-column">
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
              <div style={{ marginTop: "5px", marginBottom: "25px" }}>
                <button onClick={addFriendPressed}>Add Friend</button>
              </div>
              <div className="scrollable" id="friends-list">
                <ul style={{ width: "100%" }}>
                  {allFriends.map((friend, index) => (
                    <div key={index} style={index % 2 === 0 ? { backgroundColor: "white" } : { backgroundColor: "#F7EEDE" }}>
                      <p style={{ margin: "2px" }}>{friend.name}</p>
                    </div>
                  ))}
                </ul>
              </div>

              <div style={{ textAlign: "left", marginTop: "10px" }}><h3>Friend Activity</h3></div>
              <div className="scrollable" id="notifs-list">
                <ul>
                  {allNotifs.length === 0 ? (
                    <li>Check back later</li>) : (
                    allNotifs.map((notif, index) => (
                      <li className="card-sm" key={index}>
                        <div className="column-container">
                          <div className="column">
                            <p>{notif.friendName} completed {notif.title}</p>
                          </div>
                          <div className="column">
                            <button style={{ padding: "2px" }} onClick={() => giveStarPressed(index)}>
                              <StarIcon width={25} height={25} />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            <div class="column-container" style={ {alignItems: "center"} }>
              <div
                style={{
                  width: boxWidth,
                  height: boxHeight,
                  position: "relative",
                  border: "3px solid black",
                  borderRadius: "5px",
                  backgroundColor: "white"
                }}
              >
                {starDisplay.map((star) => (
                  <StarIcon
                    key={star.id}
                    width={starSize}
                    height={starSize}
                    style={{
                      position: "absolute",
                      left: `${star.x}px`,
                      top: `${star.y}px`,
                    }}
                  />
                ))}
                <h1 class="text-overlay">{stars}</h1>
              </div>
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
          <input className="file-upload" type="file" onChange={(e) => uploadICSFile(e)} />
        </div>
      )}
    </div>
  );
}

export default App;
