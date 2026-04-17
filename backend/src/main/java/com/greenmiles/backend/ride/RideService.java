package com.greenmiles.backend.ride;

import com.greenmiles.backend.ride.dto.RideSearchResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RideService {

    private final RideRepository rideRepository;

    public RideService(RideRepository rideRepository) {
        this.rideRepository = rideRepository;
    }

    @Transactional(readOnly = true)
    public List<RideSearchResponse> search(Long startCityId, Long endCityId, LocalDate date) {
        LocalDateTime from = date.atStartOfDay();
        LocalDateTime to = date.plusDays(1).atStartOfDay().minusNanos(1);

        return rideRepository
                .searchRides(startCityId, endCityId, List.of(RideStatus.ACTIVE, RideStatus.FULL), from, to)
                .stream()
                .map(ride -> new RideSearchResponse(
                        ride.getRideId(),
                        ride.getStartCity().getCityName(),
                        ride.getEndCity().getCityName(),
                        ride.getStartTime(),
                        ride.getRideStatus(),
                        ride.getAvailableSeats()))
                .toList();
    }
}
