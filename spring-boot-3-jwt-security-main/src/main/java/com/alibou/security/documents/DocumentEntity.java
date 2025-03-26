package com.alibou.security.documents;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Data
public class DocumentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String fileName;


    @Column(nullable = false)
    private LocalDateTime uploadDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentType documentType;

    @Lob
    @Column(nullable = false)
    private byte[] fileData;

}

