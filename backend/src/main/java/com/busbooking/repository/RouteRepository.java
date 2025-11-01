package com.busbooking.repository;

import com.busbooking.model.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RouteRepository extends JpaRepository<Route, Integer> {
    List<Route> findByFromLocationAndToLocation(String fromLocation, String toLocation);
    List<Route> findByFromLocation(String fromLocation);
    List<Route> findByToLocation(String toLocation);
}
