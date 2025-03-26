package com.alibou.security.documents;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("api/v1/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentEntity> uploadDocument(@RequestParam String title, @RequestParam DocumentType documentType, @RequestParam MultipartFile file) throws IOException {
        return ResponseEntity.ok(documentService.saveDocument(title, documentType, file));
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getDocument(@PathVariable Long id) {
        DocumentEntity document = documentService.getDocument(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getFileName() + "\"")
                .body(document.getFileData());
    }

    @GetMapping("/all")
    public List<DocumentEntity> getDocuments(@RequestParam(required = false) DocumentType documentType) {
        if (documentType == null) {
            return documentService.getDocuments();
        }
        return documentService.getDocumentsByType(documentType);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentEntity> updateDocument(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam DocumentType documentType,
            @RequestParam(required = false) MultipartFile file) throws IOException {
        return ResponseEntity.ok(documentService.updateDocument(id, title, documentType, file));
    }
}
