package com.mmt.eventwedding;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class EventWeddingApplication {
    public static void main(String[] args) {
        SpringApplication.run(EventWeddingApplication.class, args);
    }
}
