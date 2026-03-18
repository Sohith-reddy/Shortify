package com.urlshortner.urlshortener.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.urlshortner.urlshortener.entity.ShortUrl;
import com.urlshortner.urlshortener.enums.Roles;
import com.urlshortner.urlshortener.entity.User;

public interface ShortUrlRepository extends JpaRepository<ShortUrl, Long> {

    Optional<ShortUrl> findByShortCode(String shortCode);

    Optional<ShortUrl> findByShortCodeAndIsActiveTrue(String shortCode);

    boolean existsByShortCode(String shortCode);

    List<ShortUrl> findByRole(Roles role);

    Optional<ShortUrl> findByShortUrlAndRole(String shortUrl, Roles role);

    Optional<ShortUrl> findByShortUrl(String shortUrl);

    List<ShortUrl> findByUser(User user);
    List<ShortUrl> findByUser_UserId(Long userId);

}