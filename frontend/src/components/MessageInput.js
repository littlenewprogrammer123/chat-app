import React, { useState } from "react";

function MessageInput({ onSend }) {
  const [input, setInput] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <form className="bottom" onSubmit={handleSend}>
      <textarea
        className="form-control"
        rows="1"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Start typing for reply..."
      />
      <button type="submit" className="btn send">
        <i className="material-icons">send</i>
      </button>
    </form>
  );
}

export default MessageInput;
