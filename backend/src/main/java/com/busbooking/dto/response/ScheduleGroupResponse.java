package com.busbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleGroupResponse {
    private String fromLocation; // Điểm đi chung
    private List<DestinationInfo> destinations; // Danh sách các điểm đến
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DestinationInfo {
        private Integer routeId;
        private String toLocation;
        private String distanceKm;
        private String estimatedDuration;
        private String basePrice;
        private List<String> vehicleTypes; // Danh sách loại xe
    }
}
