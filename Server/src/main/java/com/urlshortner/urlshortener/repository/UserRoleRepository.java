package com.urlshortner.urlshortener.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.urlshortner.urlshortener.entity.UserRole;

import io.lettuce.core.dynamic.annotation.Param;


public interface UserRoleRepository extends JpaRepository<UserRole,Integer> {
    Optional<UserRole> findByRole(@Param("name") String name);
}
