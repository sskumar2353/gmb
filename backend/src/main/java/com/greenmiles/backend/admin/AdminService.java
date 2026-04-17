package com.greenmiles.backend.admin;

import com.greenmiles.backend.admin.dto.AdminAuditLogPageResponse;
import com.greenmiles.backend.admin.dto.AdminAuditLogResponse;
import com.greenmiles.backend.admin.dto.AdminDashboardResponse;
import com.greenmiles.backend.audit.AuditLog;
import com.greenmiles.backend.audit.AuditLogRepository;
import com.greenmiles.backend.booking.BookingRepository;
import com.greenmiles.backend.booking.BookingStatus;
import com.greenmiles.backend.driver.DriverRepository;
import com.greenmiles.backend.notification.NotificationRepository;
import com.greenmiles.backend.ride.RideEntityRepository;
import com.greenmiles.backend.ride.RideStatus;
import com.greenmiles.backend.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final RideEntityRepository rideRepository;
    private final BookingRepository bookingRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminService(
            UserRepository userRepository,
            DriverRepository driverRepository,
            RideEntityRepository rideRepository,
            BookingRepository bookingRepository,
            NotificationRepository notificationRepository,
            AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
        this.rideRepository = rideRepository;
        this.bookingRepository = bookingRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        long totalRides = rideRepository.count();
        long activeRides = rideRepository.countByRideStatus(RideStatus.ACTIVE);
        long totalBookings = bookingRepository.count();
        long pendingBookings = bookingRepository.countByBookingStatus(BookingStatus.PENDING);
        long unreadNotifications = notificationRepository.countByReadFalse();
        return new AdminDashboardResponse(
                userRepository.count(),
                driverRepository.count(),
                totalRides,
                activeRides,
                totalBookings,
                pendingBookings,
                unreadNotifications);
    }

    @Transactional(readOnly = true)
    public AdminAuditLogPageResponse getDeniedAuditLogs(int page, int size, String entity) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<AuditLog> resultPage;
        if (entity == null || entity.isBlank()) {
            resultPage = auditLogRepository.findByActionOrderByCreatedAtDesc("ACCESS_DENIED", pageRequest);
        } else {
            resultPage = auditLogRepository.findByActionAndEntityOrderByCreatedAtDesc(
                    "ACCESS_DENIED", entity.trim().toUpperCase(), pageRequest);
        }
        return new AdminAuditLogPageResponse(
                resultPage.getContent().stream().map(this::toAuditResponse).toList(),
                resultPage.getNumber(),
                resultPage.getSize(),
                resultPage.getTotalElements(),
                resultPage.getTotalPages());
    }

    private AdminAuditLogResponse toAuditResponse(AuditLog log) {
        return new AdminAuditLogResponse(
                log.getLogId(),
                log.getUserId(),
                log.getAction(),
                log.getEntity(),
                log.getEntityId(),
                log.getDetails(),
                log.getCreatedAt());
    }
}
