package com.busbooking.mapper;

import com.busbooking.dto.request.VehicleRequest;
import com.busbooking.dto.response.VehicleResponse;
import com.busbooking.model.Vehicle;
import org.springframework.stereotype.Component;

@Component
public class VehicleMapper {

    public Vehicle toEntity(VehicleRequest request) {
        Vehicle v = new Vehicle();
        v.setLicensePlate(request.getLicensePlate());
        v.setModel(request.getModel());
        v.setTotalSeats(request.getTotalSeats());
        v.setSeatsLayout(request.getSeatsLayout());
        v.setVehicleType(Vehicle.VehicleType.valueOf(request.getVehicleType()));
        return v;
    }

    public VehicleResponse toResponse(Vehicle v) {
        return new VehicleResponse(
                v.getId(),
                v.getLicensePlate(),
                v.getModel(),
                v.getTotalSeats(),
                v.getSeatsLayout(),
                v.getVehicleType().name(),
                v.getCreatedAt()
        );
    }

    public void updateEntity(Vehicle v, VehicleRequest request) {
        v.setLicensePlate(request.getLicensePlate());
        v.setModel(request.getModel());
        v.setTotalSeats(request.getTotalSeats());
        v.setSeatsLayout(request.getSeatsLayout());
        v.setVehicleType(Vehicle.VehicleType.valueOf(request.getVehicleType()));
    }
}
