import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Discussions from "./Discussions";
import ChatWindow from "./ChatWindow";

const MainLayout = () => {
  const [activeBot, setActiveBot] = useState(null);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Store chat history per bot
  const [chatHistories, setChatHistories] = useState({});

  // track mobile view state (contacts vs chat)
  const [isMobileChat, setIsMobileChat] = useState(false);

  // Track which sidebar tab is active: "discussions" or "members"
  const [activeTab, setActiveTab] = useState("discussions");

  const addMessage = (botId, message) => {
    setChatHistories((prev) => ({
      ...prev,
      [botId]: [...(prev[botId] || []), message],
    }));
  };

  // Called when user selects a bot from Discussions.
  // Also ensures on mobile we go to the chat view and switch tab state.
  const handleSelectBot = (bot) => {
    setActiveBot(bot);
    setActiveTab("discussions"); // ensure the discussions tab is active
    if (window.innerWidth < 992) {
      setIsMobileChat(true); // on mobile, go to chat view (hide contacts)
    }
  };

  const handleBackToContacts = () => {
    setIsMobileChat(false);
  };

  return (
    <div className={`layout ${isDarkMode ? "dark-mode" : ""}`}>
      {/* Sidebar (icons) - receives activeTab/setActiveTab */}
      <Sidebar
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // when switching to members on mobile, keep sidebar visible (don't open chat)
          if (tab === "members") {
            setIsMobileChat(false);
          }
        }}
      />

      {/* Contacts + Profile pane (left) */}
      <div className={`sidebar ${isMobileChat ? "hide" : ""}`} id="sidebar">
        <div className="container">
          <div className="col-md-12">
            <div className="tab-content">
              {/* Discussions tab (rendered by component) */}
              <Discussions
                setActiveBot={handleSelectBot}
                activeBot={activeBot}
                activeTab={activeTab}
              />

              {/* Members / Profile Tab */}
              <div
                id="members"
                className={`tab-pane fade ${
                  activeTab === "members" ? "active show" : ""
                }`}
              >
                <div className="profile text-center p-3">
                  <img
                    src={process.env.PUBLIC_URL + "/dist/img/avatars/vbn.jpg"}
                    alt="My Profile"
                    className="avatar-xl rounded-circle mb-3"
                  />
                  <h4>Vibin V</h4>
                  <p className="text-muted">
                    💻 Junior Software Engineer | React & Java Enthusiast
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat window (right). On mobile shows when isMobileChat === true */}
      <div className={`main ${isMobileChat ? "show-chat" : ""}`}>
        <div className="tab-content" id="nav-tabContent">
          {isMobileChat && (
            <button className="back-btn" onClick={handleBackToContacts}>
              ← Back
            </button>
          )}
          <ChatWindow
            activeBot={activeBot}
            chatHistories={chatHistories}
            addMessage={addMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
