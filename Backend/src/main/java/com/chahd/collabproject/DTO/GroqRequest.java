package com.chahd.collabproject.DTO;

import jakarta.mail.Message;

import java.util.List;

public record GroqRequest(String model , List<Message> messages, double temperature , int max_tokens) {
    public record Message(String role , String content) {}
}
