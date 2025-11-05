package com.busbooking.repository;

import com.busbooking.model.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RouteRepository extends JpaRepository<Route, Integer> {
    List<Route> findByFromLocationAndToLocation(String fromLocation, String toLocation);
    List<Route> findByFromLocation(String fromLocation);
    List<Route> findByToLocation(String toLocation);
    
    // Kiểm tra tuyến đường đã tồn tại
    boolean existsByFromLocationAndToLocation(String fromLocation, String toLocation);
    
    // Tìm tuyến đường (trừ id cụ thể - dùng cho update)
    Optional<Route> findByFromLocationAndToLocationAndIdNot(String fromLocation, String toLocation, Integer id);
}
