package com.greenmiles.backend.admin;

import com.greenmiles.backend.admin.dto.AdminAuditLogPageResponse;
import com.greenmiles.backend.admin.dto.AdminDashboardResponse;
import com.greenmiles.backend.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok("Admin dashboard fetched", adminService.getDashboard()));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<AdminAuditLogPageResponse>> deniedAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String entity) {
        return ResponseEntity.ok(
                ApiResponse.ok("Denied access audit logs fetched", adminService.getDeniedAuditLogs(page, size, entity)));
    }
}
