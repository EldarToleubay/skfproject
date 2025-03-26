package com.alibou.security.news;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


public interface NewsService {

    Page<News> getAllNews(Pageable pageable);

    Optional<News> getNewsById(Long id);

    News createNews(News news);

    void deleteNews(Long id);

    Optional<News> updateNews(Long id, News updatedNews);
}
