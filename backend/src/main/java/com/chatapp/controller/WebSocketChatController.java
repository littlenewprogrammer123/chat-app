package com.chatapp.controller;

import com.chatapp.model.Message;
import com.chatapp.service.BotService;
import com.chatapp.service.ChatService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketChatController {

    private final ChatService chatService;
    private final BotService botService;

    public WebSocketChatController(ChatService chatService, BotService botService) {
        this.chatService = chatService;
        this.botService = botService;
    }

    @MessageMapping("/chat")
    @SendTo("/topic/messages")
    public Message handleChat(Message message) {
        message.setTimestamp(System.currentTimeMillis());
        chatService.saveMessage(message);

        // If user message, generate bot reply
        if (!message.getSender().startsWith("Bot")) {
            String reply = botService.getBotReply("Alice (friendly)", message.getContent());

            Message botMsg = new Message(
                    null,
                    "Bot Alice",
                    reply,
                    message.getChatRoomId(),
                    System.currentTimeMillis()
            );
            chatService.saveMessage(botMsg);

            return botMsg; // send bot reply to chatroom
        }

        return message;
    }
}
