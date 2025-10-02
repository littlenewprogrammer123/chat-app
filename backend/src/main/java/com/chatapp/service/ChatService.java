package com.chatapp.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.chatapp.model.Message;
import com.chatapp.repository.MessageRepository;

@Service
public class ChatService {

    private final MessageRepository messageRepository;

    public ChatService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public Message saveMessage(Message message) {
        return messageRepository.save(message);
    }

    public List<Message> getMessages(String chatRoomId) {
        return messageRepository.findByChatRoomId(chatRoomId);
    }
}
