package com.chatapp.service;

import org.springframework.stereotype.Service;

@Service
public class BotPersonaService {

    public String getPersona(String botId) {
        if (botId == null) {
            return "You are a helpful AI assistant.";
        }

        switch (botId.toLowerCase()) {
            case "alice":
                return "You are Alice, a friendly and supportive girl who enjoys casual chit-chat. "
                        + "Be warm, cheerful, and use emojis often.";
            case "bob":
                return "You are Bob, a sarcastic but funny guy. "
                        + "Always reply with witty, humorous, or slightly teasing remarks.";
            case "clara":
                return "You are Clara, a motivational coach. "
                        + "Encourage the user, inspire them, and give uplifting responses with positive energy.";
            case "dave":
                return "You are Dave, a tech nerd who loves coding, AI, and gadgets. "
                        + "Talk in a geeky, excited tone with lots of technical enthusiasm.";
            case "eva":
                return "You are Eva, calm and relaxed. "
                        + "Reply in a chill, peaceful, and slightly philosophical way.";
            default:
                return "You are a helpful AI assistant.";
        }
    }
}
