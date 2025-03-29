import './Home.css';
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
  const [currentPage, setCurrentPage] = useState(window.location.pathname); // Track the current page

  useEffect(() => { // Only execute once when the page is opened
    getAllUsers()
      .then((users) => setAllUsers(users))
      .catch((error) => console.error("Error:", error));

    // Listen for changes in the browser history (back/forward buttons)
    const handleLocationChange = () => setCurrentPage(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
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

        window.history.pushState({}, '', '/home');
        setCurrentPage('/home');


        return;
      }
    }
    alert("User " + username + " not found.");
  }

  function logout() {
    
    window.history.pushState({}, '', '/');
    window.location.reload();
    setCurrentPage('/');
    console.log("Logging out of", username);

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
    <>
      <div className="App">
        {currentPage === '/' && (
          <>
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

              <nav>
                <button onClick={login}>Login</button>
                <button onClick={signUp}>Sign Up</button>
              </nav>
            </div>
          </>
        )}
      </div>
      <div className="Home">
        {currentPage === '/home' && (
          <div>
            <h1>Welcome, {username}!</h1>
            <p>This is the home page.</p>
            <button onClick={logout}>Logout</button>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
