package com.chatapp.controller;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter;

import com.chatapp.service.BotPersonaService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private BotPersonaService botPersonaService;

    private final ObjectMapper mapper = new ObjectMapper();

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseBodyEmitter chatStream(@RequestBody Map<String, String> payload) {
        ResponseBodyEmitter emitter = new ResponseBodyEmitter();

        new Thread(() -> {
            try {
                String botId = payload.get("botId");
                String userMessage = payload.get("message");

                String persona = botPersonaService.getPersona(botId);
                String fullPrompt = persona + "\nUser: " + userMessage + "\n" + botId + ":";

                Map<String, Object> requestMap = new HashMap<>();
                requestMap.put("model", "mistral");
                requestMap.put("prompt", fullPrompt);
                requestMap.put("stream", true);

                String requestBody = mapper.writeValueAsString(requestMap);

                HttpURLConnection conn = (HttpURLConnection) new URI("http://localhost:11434/api/generate")
                        .toURL().openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);

                try (OutputStream os = conn.getOutputStream()) {
                    os.write(requestBody.getBytes());
                }

                BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                String line;
                while ((line = reader.readLine()) != null) {
                    try {
                        JsonNode node = mapper.readTree(line);
                        if (node.has("response")) {
                            String chunk = node.get("response").asText();
                            emitter.send(chunk); // send partial text
                        }
                    } catch (Exception ignored) {}
                }
                reader.close();
                emitter.complete();

            } catch (Exception e) {
                try {
                    emitter.send("⚠️ Error: " + e.getMessage());
                } catch (IOException ignored) {}
                emitter.completeWithError(e);
            }
        }).start();

        return emitter;
    }
}
