package com.salon.booking.controller;

import com.salon.booking.dto.AdminStatsDto;
import com.salon.booking.dto.BookingDetailDto;
import com.salon.booking.dto.MessageResponse;
import com.salon.booking.model.Role;
import com.salon.booking.model.Shop;
import com.salon.booking.model.Transaction;
import com.salon.booking.model.User;
import com.salon.booking.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> getDashboardStats() {
        AdminStatsDto stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<User> updateUserRole(@PathVariable Long userId, @RequestParam Role role) {
        User updated = adminService.updateUserRole(userId, role);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
    }

    @GetMapping("/shops")
    public ResponseEntity<List<Shop>> getAllShops() {
        List<Shop> shops = adminService.getAllShops();
        return ResponseEntity.ok(shops);
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDetailDto>> getAllBookings() {
        List<BookingDetailDto> bookings = adminService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        List<Transaction> transactions = adminService.getAllTransactions();
        return ResponseEntity.ok(transactions);
    }
}
