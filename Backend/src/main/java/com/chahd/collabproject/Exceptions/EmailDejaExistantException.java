package com.chahd.collabproject.Exceptions;

public class EmailDejaExistantException extends RuntimeException {
    public EmailDejaExistantException(String message) {
        super(message);
    }
}
