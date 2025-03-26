package com.alibou.security.news;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "news")
@Data
public class News {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now(); // Автоматически устанавливается

    @Column(nullable = false)
    private String title; // Заголовок

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description; // Описание

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content; // Основной текст
}
