package com.alibou.security.news;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/news")
@RequiredArgsConstructor
@CrossOrigin
public class NewsController {
    private final NewsService newsService;

    @GetMapping
    public Page<News> getAllNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return newsService.getAllNews(PageRequest.of(page, size));
    }


    @GetMapping("/{id}")
    public ResponseEntity<News> getNewsById(@PathVariable Long id) {
        return newsService.getNewsById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public News createNews(@RequestBody News news) {
        return newsService.createNews(news);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNews(@PathVariable Long id) {
        newsService.deleteNews(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<News> updateNews(@PathVariable Long id, @RequestBody News news) {
        return newsService.updateNews(id, news)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}
