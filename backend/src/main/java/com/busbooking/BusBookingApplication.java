package com.busbooking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BusBookingApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(BusBookingApplication.class, args);
        System.out.println("==============================================");
        System.out.println("Bus Booking System Backend is running!");
        System.out.println("API URL: http://localhost:8080/api");
        System.out.println("Auto-update trip status: ENABLED");
        System.out.println("==============================================");
    }
}
