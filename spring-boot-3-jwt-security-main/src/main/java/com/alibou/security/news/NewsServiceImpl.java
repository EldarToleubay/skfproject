package com.alibou.security.news;


import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


import java.util.Optional;


@Service
@RequiredArgsConstructor
public class NewsServiceImpl implements NewsService {
    private final NewsRepository newsRepository;

    @Override
    public Page<News> getAllNews(Pageable pageable) {
        return newsRepository.findAll(pageable);
    }

    @Override
    public Optional<News> getNewsById(Long id) {
        return newsRepository.findById(id);
    }

    @Override
    public News createNews(News news) {
        return newsRepository.save(news);
    }

    @Override
    public void deleteNews(Long id) {
        newsRepository.deleteById(id);
    }

    @Override
    public Optional<News> updateNews(Long id, News updatedNews) {
        return newsRepository.findById(id)
                .map(existingNews -> {
                    existingNews.setTitle(updatedNews.getTitle());
                    existingNews.setContent(updatedNews.getContent());
                    return newsRepository.save(existingNews);
                });
    }

}
