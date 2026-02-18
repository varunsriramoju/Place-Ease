package com.placeease.repository;

import com.placeease.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudentId(Long studentId);

    List<Application> findByJobId(Long jobId);

    Optional<Application> findByStudentIdAndJobId(Long studentId, Long jobId);

    @Query("SELECT COUNT(DISTINCT a.studentId) FROM Application a WHERE a.status IN ('OFFERED', 'JOINED') AND a.student.branch = :branch")
    long countPlacedStudentsByBranch(@Param("branch") String branch);

    @Query("SELECT MONTH(a.updatedDate) as month, YEAR(a.updatedDate) as year, COUNT(a) as count FROM Application a WHERE a.status = 'OFFERED' AND a.updatedDate >= :startDate GROUP BY MONTH(a.updatedDate), YEAR(a.updatedDate)")
    List<Object[]> getMonthlyPlacements(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT a.job.companyName, COUNT(a) FROM Application a WHERE a.status IN ('OFFERED', 'JOINED') GROUP BY a.job.companyName ORDER BY COUNT(a) DESC")
    List<Object[]> getTopRecruiters();

    @Query("SELECT COUNT(a) FROM Application a WHERE a.status IN ('OFFERED', 'JOINED')")
    long countTotalPlacedStudents();

    @Query("SELECT AVG(a.job.ctcMax) FROM Application a WHERE a.status IN ('OFFERED', 'JOINED')")
    Double getAverageCtc();

    boolean existsByStudentIdAndJobId(Long studentId, Long jobId);

    @Query("SELECT a.job.ctcMax FROM Application a WHERE a.status IN ('OFFERED', 'JOINED') AND a.job.ctcMax IS NOT NULL")
    List<java.math.BigDecimal> getPlacedCtcValues();
}
