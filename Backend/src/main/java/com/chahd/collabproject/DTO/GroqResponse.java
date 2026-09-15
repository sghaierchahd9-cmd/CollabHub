package com.chahd.collabproject.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true) // Groq renvoie d'autres champs (usage, id...) qu'on ignore
public record GroqResponse(List<Choice> choices) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Choice(Message message) {}
    public record Message(String role, String content) {}
}
