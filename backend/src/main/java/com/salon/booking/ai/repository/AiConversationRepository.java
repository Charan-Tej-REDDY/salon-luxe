package com.salon.booking.ai.repository;

import com.salon.booking.ai.model.AiConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AiConversationRepository extends JpaRepository<AiConversation, Long> {
    List<AiConversation> findByCustomerIdOrderByUpdatedAtDesc(Long customerId);
    Optional<AiConversation> findByIdAndCustomerId(Long id, Long customerId);
}
