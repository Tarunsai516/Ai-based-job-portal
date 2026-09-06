package com.jobportal.backend.repository;

import com.jobportal.backend.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {

    @Query("SELECT DISTINCT j FROM Job j LEFT JOIN j.skills s WHERE " +
           "(:recruiterId IS NULL OR j.recruiterId = :recruiterId OR j.recruiterEmail = :recruiterEmail) AND " +
           "(:recruiterEmailOnly IS NULL OR j.recruiterEmail = :recruiterEmailOnly) AND " +
           "(:q IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(j.companyName) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(s) LIKE LOWER(CONCAT('%', :q, '%'))) AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:type IS NULL OR LOWER(j.type) = LOWER(:type))")
    List<Job> filterJobs(
            @Param("recruiterId") String recruiterId,
            @Param("recruiterEmail") String recruiterEmail,
            @Param("recruiterEmailOnly") String recruiterEmailOnly,
            @Param("q") String q,
            @Param("location") String location,
            @Param("type") String type
    );
}
