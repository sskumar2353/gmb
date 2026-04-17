package com.greenmiles.backend.ride;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RideEntityRepository extends JpaRepository<Ride, Long> {
    List<Ride> findByDriverIdOrderByStartTimeDesc(Long driverId);

    long countByRideStatus(RideStatus rideStatus);
}
