import React from "react";

const Sidebar = ({ isDarkMode, setIsDarkMode, activeTab, setActiveTab }) => {
  const avatarSrc = process.env.PUBLIC_URL + "/dist/img/avatars/vbn.jpg";

  return (
    <div className="navigation">
      <div className="container">
        <div className="inside">
          <div className="nav nav-tab menu">
            {/* Desktop avatar */}
            <button
              className="btn mb-3 desktop-avatar"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("members");
              }}
            >
              <img className="avatar-xl" src={avatarSrc} alt="avatar" />
            </button>

            {/* Profile Tab */}
            <a
              href="#members"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("members");
              }}
              className={`mb-3 ${activeTab === "members" ? "active" : ""}`}
            >
              <i className="material-icons">account_circle</i>
            </a>

            {/* Discussions (chat) */}
            <a
              href="#discussions"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("discussions");
              }}
              className={`mb-3 ${activeTab === "discussions" ? "active" : ""}`}
            >
              <i className="material-icons">chat_bubble_outline</i>
            </a>

            {/* 🌙 Dark mode toggle (now always visible) */}
            <a
              href="#darkmode"
              onClick={(e) => {
                e.preventDefault();
                setIsDarkMode((prev) => !prev);
              }}
              className="mb-3"
            >
              <i className="material-icons">
                {isDarkMode ? "wb_sunny" : "brightness_2"}
              </i>
            </a>

            {/* 🚪 Logout */}
            <a
  href="#logout"
  onClick={(e) => {
    e.preventDefault();

    // 1️⃣ Clear any saved user session/token
    localStorage.removeItem("authToken"); 
    sessionStorage.clear();

    // 2️⃣ Reset app state if needed
    setActiveTab("discussions"); // go back to chat page
    // optional: clear chats, reset theme, etc.

    // 3️⃣ Redirect to login (if you have login page)
    window.location.href = "/login";  
  }}
  className="mb-3"
>
  <i className="material-icons">logout</i>
</a>

          </div>
        </div>
      </div>

      {/* Floating profile avatar for mobile */}
      <button
        className="profile-btn-mobile"
        onClick={(e) => {
          e.preventDefault();
          setActiveTab("members");
        }}
      >
        <img src={avatarSrc} alt="avatar" />
      </button>
    </div>
  );
};

export default Sidebar;
