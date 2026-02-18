package com.placeease.controller;

import com.placeease.model.ChatMessage;
import com.placeease.model.User;
import com.placeease.repository.ChatMessageRepository;
import com.placeease.repository.UserRepository;
import com.placeease.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ChatbotService chatbotService;
    private final SimpMessagingTemplate messagingTemplate;

    // REST endpoint to get chat history for a room
    @GetMapping("/api/chat/history/{roomId}")
    public ResponseEntity<?> getChatHistory(@PathVariable("roomId") String roomId) {
        try {
            List<ChatMessage> messages = chatMessageRepository.findByRoomIdOrderByTimestampAsc(roomId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // REST endpoint to send a chat message (for users who can't use WebSocket)
    @PostMapping("/api/chat/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String content = request.get("content");
            String roomId = request.getOrDefault("roomId", "student_" + user.getId());

            // Save user message
            ChatMessage userMsg = new ChatMessage();
            userMsg.setSenderId(user.getId());
            userMsg.setSenderRole(user.getRole());
            userMsg.setSenderName(user.getName());
            userMsg.setContent(content);
            userMsg.setRoomId(roomId);
            ChatMessage savedMsg = chatMessageRepository.save(userMsg);

            // Broadcast via WebSocket
            messagingTemplate.convertAndSend("/topic/chat/" + roomId, savedMsg);

            List<ChatMessage> result = new ArrayList<>();
            result.add(savedMsg);

            // If student sent the message, generate bot response
            if ("STUDENT".equals(user.getRole())) {
                String botResponse = chatbotService.getResponse(content);
                ChatMessage botMsg = new ChatMessage();
                botMsg.setSenderId(0L);
                botMsg.setSenderRole("BOT");
                botMsg.setSenderName("PlaceEase Bot");
                botMsg.setContent(botResponse);
                botMsg.setRoomId(roomId);
                ChatMessage savedBotMsg = chatMessageRepository.save(botMsg);

                // Broadcast bot response
                messagingTemplate.convertAndSend("/topic/chat/" + roomId, savedBotMsg);
                result.add(savedBotMsg);
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // WebSocket message handler
    @MessageMapping("/chat.send")
    public void handleWebSocketMessage(@Payload Map<String, String> payload) {
        String email = payload.get("senderEmail");
        String content = payload.get("content");
        String roomId = payload.get("roomId");

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null)
            return;

        ChatMessage userMsg = new ChatMessage();
        userMsg.setSenderId(user.getId());
        userMsg.setSenderRole(user.getRole());
        userMsg.setSenderName(user.getName());
        userMsg.setContent(content);
        userMsg.setRoomId(roomId != null ? roomId : "student_" + user.getId());
        ChatMessage savedMsg = chatMessageRepository.save(userMsg);

        messagingTemplate.convertAndSend("/topic/chat/" + savedMsg.getRoomId(), savedMsg);

        // Bot auto-response for students
        if ("STUDENT".equals(user.getRole())) {
            String botResponse = chatbotService.getResponse(content);
            ChatMessage botMsg = new ChatMessage();
            botMsg.setSenderId(0L);
            botMsg.setSenderRole("BOT");
            botMsg.setSenderName("PlaceEase Bot");
            botMsg.setContent(botResponse);
            botMsg.setRoomId(savedMsg.getRoomId());
            ChatMessage savedBotMsg = chatMessageRepository.save(botMsg);

            messagingTemplate.convertAndSend("/topic/chat/" + savedBotMsg.getRoomId(), savedBotMsg);
        }
    }

    // Admin: Get list of all chat rooms
    @GetMapping("/api/admin/chat/rooms")
    public ResponseEntity<?> getChatRooms() {
        try {
            List<String> roomIds = chatMessageRepository.findDistinctRoomIds();
            List<Map<String, Object>> rooms = new ArrayList<>();

            for (String roomId : roomIds) {
                ChatMessage latestMsg = chatMessageRepository.findLatestByRoomId(roomId);
                Map<String, Object> room = new LinkedHashMap<>();
                room.put("roomId", roomId);
                room.put("lastMessage", latestMsg != null ? latestMsg.getContent() : "");
                room.put("lastSender", latestMsg != null ? latestMsg.getSenderName() : "");
                room.put("lastTimestamp", latestMsg != null && latestMsg.getTimestamp() != null
                        ? latestMsg.getTimestamp().toString()
                        : "");

                // Extract student name from room
                if (roomId.startsWith("student_")) {
                    try {
                        Long studentId = Long.parseLong(roomId.replace("student_", ""));
                        userRepository.findById(studentId)
                                .ifPresent(student -> room.put("studentName", student.getName()));
                    } catch (NumberFormatException ignored) {
                    }
                }
                rooms.add(room);
            }

            return ResponseEntity.ok(rooms);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
