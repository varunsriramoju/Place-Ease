package com.placeease.repository;

import com.placeease.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
        Optional<User> findByEmail(String email);

        List<User> findByRole(String role);

        boolean existsByEmail(String email);

        @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.role = 'STUDENT' " +
                        "AND (:branch IS NULL OR u.branch = :branch) " +
                        "AND (:minCgpa IS NULL OR u.cgpa >= :minCgpa) " +
                        "AND (:maxCgpa IS NULL OR u.cgpa <= :maxCgpa)")
        List<User> findStudentsWithFilters(
                        @org.springframework.data.repository.query.Param("branch") String branch,
                        @org.springframework.data.repository.query.Param("minCgpa") java.math.BigDecimal minCgpa,
                        @org.springframework.data.repository.query.Param("maxCgpa") java.math.BigDecimal maxCgpa);

        long countByRoleAndBranch(String role, String branch);
}
