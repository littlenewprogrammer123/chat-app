import React from "react";

const bots = [
  {
    id: "ironman",
    name: "Iron Man",
    avatar: "/img/avatars/ironman.jpg",
  },
  {
    id: "luffy",
    name: "Monkey D. Luffy",
    avatar: "/img/avatars/luffy.jpg",
  },
  {
    id: "harry",
    name: "Harry Potter",
    avatar: "/img/avatars/harry.jpg",
  },
  {
    id: "doctor",
    name: "Dr. Johnny",
    avatar: "/img/avatars/doctor.jpg",
  },
  {
    id: "nurse",
    name: "Nurse Dani",
    avatar: "/img/avatars/nurse.jpg",
  },
  {
    id: "batman",
    name: "Batman",
    avatar: "/img/avatars/batman.jpg",
  },
];

const BotList = ({ activeBot, setActiveBot }) => {
  return (
    <div className="discussions">
      <h5 className="title">Bots</h5>
      <div className="list-group">
        {bots.map((bot) => (
          <button
            key={bot.id}
            className={`list-group-item list-group-item-action d-flex align-items-center ${
              activeBot?.id === bot.id ? "active" : ""
            }`}
            onClick={() => setActiveBot(bot)}
          >
            <img
              src={bot.avatar}
              alt={bot.name}
              className="avatar-sm rounded-circle mr-2"
            />
            <span>{bot.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BotList;
