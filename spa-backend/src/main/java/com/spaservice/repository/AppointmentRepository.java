package com.spaservice.repository;

import com.spaservice.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByClientIdOrderByAppointmentDateDescStartTimeDesc(UUID clientId);
    List<Appointment> findByBranchIdAndAppointmentDate(UUID branchId, LocalDate appointmentDate);
    List<Appointment> findByStaffIdAndAppointmentDate(UUID staffId, LocalDate appointmentDate);

    @Query("SELECT a FROM Appointment a WHERE a.staff.id = :staffId AND a.appointmentDate = :date AND a.status != 'CANCELLED'")
    List<Appointment> findActiveBookingsForStaffOnDate(@Param("staffId") UUID staffId, @Param("date") LocalDate date);

    List<Appointment> findAllByOrderByAppointmentDateDescStartTimeDesc();
}
