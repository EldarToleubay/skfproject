package com.alibou.security.documents;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;

    public DocumentService(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    public DocumentEntity saveDocument(String title, DocumentType documentType, MultipartFile file) throws IOException {
        if (!"application/pdf".equals(file.getContentType())) {
            throw new IllegalArgumentException("Только PDF файлы разрешены.");
        }

        DocumentEntity document = new DocumentEntity();
        document.setTitle(title);
        document.setFileName(file.getOriginalFilename());
        document.setDocumentType(documentType);
        document.setFileData(file.getBytes());

        return documentRepository.save(document);
    }


    public List<DocumentEntity> getDocuments() {
        return documentRepository.findAll();
    }


    public DocumentEntity getDocument(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Документ не найден"));
    }

    public void deleteDocument(Long id) {
        documentRepository.deleteById(id);
    }

    public DocumentEntity updateDocument(Long id, String title, DocumentType documentType, MultipartFile file) throws IOException {
        DocumentEntity document = getDocument(id);
        document.setTitle(title);
        document.setDocumentType(documentType);

        if (file != null) {
            if (!"application/pdf".equals(file.getContentType())) {
                throw new IllegalArgumentException("Только PDF файлы разрешены.");
            }
            document.setFileName(file.getOriginalFilename());
            document.setFileData(file.getBytes());
        }

        return documentRepository.save(document);
    }

    public List<DocumentEntity> getDocumentsByType(DocumentType documentType) {
        return documentRepository.findByDocumentType(documentType);
    }
}
