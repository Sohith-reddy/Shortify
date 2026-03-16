package com.urlshortner.urlshortener.models;

import java.time.LocalDateTime;

public class UrlShortenerRequest {
    private String longUrl;
    private LocalDateTime expirationTime;
    private String customAlias;
    private Boolean isActive;
    private Long userId;
    public String getLongUrl() {
        return longUrl;
    }
    public void setLongUrl(String longUrl) {
        this.longUrl = longUrl;
    }
    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    public LocalDateTime getExpirationTime() {
        return expirationTime;
    }
    public void setExpirationTime(LocalDateTime expirationTime) {
        this.expirationTime = expirationTime;
    }
    public String getCustomAlias() {
        return customAlias;
    }
    public void setCustomAlias(String customAlias) {
        this.customAlias = customAlias;
    }
    public Boolean getIsActive() {
        return isActive;
    }
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
