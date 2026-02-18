package com.placeease.repository;

import com.placeease.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByRoomIdOrderByTimestampAsc(String roomId);

    @Query("SELECT DISTINCT c.roomId FROM ChatMessage c ORDER BY c.roomId")
    List<String> findDistinctRoomIds();

    @Query("SELECT c FROM ChatMessage c WHERE c.roomId = :roomId ORDER BY c.timestamp DESC LIMIT 1")
    ChatMessage findLatestByRoomId(String roomId);
}
