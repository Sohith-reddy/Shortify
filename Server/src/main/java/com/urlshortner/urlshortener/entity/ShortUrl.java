    package com.urlshortner.urlshortener.entity;

    import java.time.LocalDateTime;

    import jakarta.persistence.Column;
    import jakarta.persistence.Entity;
    import jakarta.persistence.FetchType;
    import jakarta.persistence.ForeignKey;
    import jakarta.persistence.GeneratedValue;
    import jakarta.persistence.GenerationType;
    import jakarta.persistence.Id;
    import jakarta.persistence.JoinColumn;
    import jakarta.persistence.ManyToOne;
    import jakarta.persistence.Table;

    @Entity
    @Table(name="short_urls")
    public class ShortUrl {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
        @Column(unique = true, nullable = false)
        private String shortUrl;
        @Column(nullable = false)
        private String originalUrl;
        @Column
        private LocalDateTime createdAt;
        @Column
        private LocalDateTime expirationTime;
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id", referencedColumnName = "id", foreignKey = @ForeignKey(name = "fk_short_urls_user_id"))
        private User user;      
        @Column
        private Integer isActive;
        @Column
        private Long clickCount;                

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getShortUrl() {
            return shortUrl;
        }

        public void setShortUrl(String shortUrl) {
            this.shortUrl = shortUrl;
        }

        public String getOriginalUrl() {
            return originalUrl;
        }

        public void setOriginalUrl(String originalUrl) {
            this.originalUrl = originalUrl;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }

        public LocalDateTime getExpirationTime() {
            return expirationTime;
        }

        public void setExpirationTime(LocalDateTime expirationTime) {
            this.expirationTime = expirationTime;
        }

        public User getUser() {
            return user;
        }

        public void setUser(User user) {
            this.user = user;
        }

        public Integer getIsActive() {
            return isActive;
        }

        public void setIsActive(Integer isActive) {
            this.isActive = isActive;
        }

        public Long getClickCount() {
            return clickCount;
        }

        public void setClickCount(Long clickCount) {
            this.clickCount = clickCount;
        }
    }
