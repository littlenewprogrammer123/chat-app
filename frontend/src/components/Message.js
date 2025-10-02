import React from "react";

function Message({ message }) {
  const isMe = message.sender === "You";
  return (
    <div className={`message ${isMe ? "me" : ""}`}>
      {!isMe && <img className="avatar-md" src="dist/img/avatars/avatar-female-5.jpg" alt="avatar" />}
      <div className="text-main">
        <div className={`text-group ${isMe ? "me" : ""}`}>
          <div className={`text ${isMe ? "me" : ""}`}>
            <p>{message.content}</p>
          </div>
        </div>
        <span>{new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
}

export default Message;
