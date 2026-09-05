package com.chahd.collabproject;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CollabProjectApplication {

    public static void main(String[] args) {
        SpringApplication.run(CollabProjectApplication.class, args);
    }

}
