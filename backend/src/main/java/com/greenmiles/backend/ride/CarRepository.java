package com.greenmiles.backend.ride;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarRepository extends JpaRepository<Car, Long> {
    Optional<Car> findFirstByDriverId(Long driverId);
}
