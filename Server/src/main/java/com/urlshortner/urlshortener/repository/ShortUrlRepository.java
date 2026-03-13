package com.urlshortner.urlshortener.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.urlshortner.urlshortener.entity.ShortUrl;

public interface ShortUrlRepository extends JpaRepository<ShortUrl, Long> {

    Optional<ShortUrl> findByShortCode(String shortCode);

    Optional<ShortUrl> findByShortCodeAndIsActiveTrue(String shortCode);

    boolean existsByShortCode(String shortCode);

    List<ShortUrl> findByUserUserId(Long userId);

}