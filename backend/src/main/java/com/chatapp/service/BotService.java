package com.chatapp.service;

import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class BotService {

    private final WebClient webClient;

    public BotService() {
        this.webClient = WebClient.builder()
                .baseUrl("http://localhost:11434") // Ollama default
                .build();
    }

    public String getBotReply(String personality, String userMessage) {
        String prompt = "You are " + personality + ". Reply to: " + userMessage;

        try {
            // Collect the streaming JSON into a single string
            String fullResponse = webClient.post()
                    .uri("/api/generate")
                    .bodyValue(new GenerateRequest("mistral", prompt))
                    .retrieve()
                    .bodyToFlux(String.class) // stream of JSON lines
                    .collect(Collectors.joining()) // merge all lines
                    .block();

            // Extract only the "response" fields
            StringBuilder result = new StringBuilder();
            if (fullResponse != null) {
                for (String part : fullResponse.split("\\{")) {
                    if (part.contains("\"response\"")) {
                        int start = part.indexOf("\"response\":\"") + 12;
                        int end = part.indexOf("\"", start);
                        if (start > 11 && end > start) {
                            result.append(part, start, end);
                        }
                    }
                }
            }
            return result.toString().trim();

        } catch (Exception e) {
            return "⚠️ Bot error: " + e.getMessage();
        }
    }

    record GenerateRequest(String model, String prompt) {}
}
