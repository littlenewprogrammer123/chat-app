import React, { useState } from "react";
import bots from "../data/bots";

const Discussions = ({ setActiveBot, activeBot, activeTab }) => {
  const [search, setSearch] = useState("");

  // Filter bots based on search input
  const filteredBots = bots.filter((bot) =>
    bot.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      id="discussions"
      className={`tab-pane fade ${activeTab === "discussions" ? "active show" : ""}`}
    >
      {/* Search */}
      <div className="search">
        <form
          className="form-inline position-relative"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="search"
            className="form-control"
            placeholder="Search the contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" className="btn btn-link loop">
            <i className="material-icons">search</i>
          </button>
        </form>
      </div>

      {/* Contacts List */}
      <div className="discussions">
        <h1>Contacts</h1>
        <div className="list-group" id="chats" role="tablist">
          {filteredBots.length > 0 ? (
            filteredBots.map((bot) => (
              <button
                key={bot.id}
                className={`filterDiscussions all single btn text-left ${
                  activeBot?.id === bot.id ? "active" : ""
                }`}
                onClick={() => setActiveBot(bot)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                }}
              >
                <img className="avatar-md" src={bot.avatar} alt="avatar" />
                <div className="status">
                  <i className="material-icons online">fiber_manual_record</i>
                </div>
                <div className="data">
                  <h5>{bot.name}</h5>
                  {bot.personality && <p>{bot.personality}</p>}
                </div>
              </button>
            ))
          ) : (
            <p className="text-muted p-2">No contacts found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discussions;
