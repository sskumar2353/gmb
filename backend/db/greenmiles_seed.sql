-- Green Miles backend seed data (MySQL 8+)
-- Database: greenmilesbooking
-- Note: Admin login is env-config based (ADMIN_USERNAME/ADMIN_PASSWORD), not table-based.
-- Prerequisite: execute db/courier_schema.sql once before seeding.

USE `greenmilesbooking`;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `notifications`;
TRUNCATE TABLE `cancellations`;
TRUNCATE TABLE `bookings`;
TRUNCATE TABLE `gps_tracking`;
SET @db = DATABASE();
SET @truncateCourier = (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'courier_orders'
    ),
    'TRUNCATE TABLE `courier_orders`',
    'SELECT 1'
  )
);
PREPARE truncCourier FROM @truncateCourier;
EXECUTE truncCourier;
DEALLOCATE PREPARE truncCourier;
TRUNCATE TABLE `car_trip_logs`;
TRUNCATE TABLE `rides`;
TRUNCATE TABLE `cars`;
TRUNCATE TABLE `drivers`;
TRUNCATE TABLE `boarding_points`;
TRUNCATE TABLE `cities`;
TRUNCATE TABLE `sessions`;
TRUNCATE TABLE `wallet_transactions`;
TRUNCATE TABLE `wallets`;
TRUNCATE TABLE `users`;
TRUNCATE TABLE `logs`;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO `cities` (`city_id`, `city_name`) VALUES
  (1, 'Hyderabad'),
  (2, 'Macherla');

INSERT INTO `boarding_points`
(`point_id`, `city_id`, `point_name`, `full_address`, `latitude`, `longitude`) VALUES
  (1, 1, 'Gachibowli', 'Gachibowli Circle, Hyderabad', 17.4435000, 78.3772000),
  (2, 1, 'Miyapur', 'Miyapur X Roads, Hyderabad', 17.4967000, 78.3563000),
  (3, 1, 'Kukatpally', 'Kukatpally Metro Station, Hyderabad', 17.4948000, 78.3996000),
  (4, 1, 'Ameerpet', 'Ameerpet Metro Interchange, Hyderabad', 17.4375000, 78.4482000),
  (5, 1, 'Dilsukhnagar', 'Dilsukhnagar Bus Depot, Hyderabad', 17.3688000, 78.5247000),
  (6, 1, 'LB Nagar', 'L B Nagar Ring Road, Hyderabad', 17.3457000, 78.5522000),
  (7, 2, 'Macherla Bus Stand', 'Main Bus Stand, Macherla', 16.4829000, 79.4353000);

INSERT INTO `drivers`
(`driver_id`, `full_name`, `phone`, `license_number`, `status`, `rating`) VALUES
  (1, 'Ravi Teja', '9001001001', 'TS-DL-RT-1023', 'ACTIVE', 4.80),
  (2, 'Suresh Reddy', '9001001002', 'TS-DL-SR-2741', 'ACTIVE', 4.70),
  (3, 'Anil Kumar', '9001001003', 'TS-DL-AK-3892', 'ACTIVE', 4.90),
  (4, 'Mahesh Yadav', '9001001004', 'TS-DL-MY-4417', 'ACTIVE', 4.60);

INSERT INTO `cars`
(`car_id`, `driver_id`, `vehicle_number`, `rc_number`, `vehicle_type`, `total_seats`, `status`) VALUES
  (1, 1, 'TS09AB1001', 'RC-TS09-1001', 'KIA_CARENS_7_SEATER', 7, 'ACTIVE'),
  (2, 2, 'TS09AB1002', 'RC-TS09-1002', 'KIA_CARENS_7_SEATER', 7, 'ACTIVE'),
  (3, 3, 'TS09AB1003', 'RC-TS09-1003', 'KIA_CARENS_7_SEATER', 7, 'ACTIVE'),
  (4, 4, 'TS09AB1004', 'RC-TS09-1004', 'KIA_CARENS_7_SEATER', 7, 'ACTIVE');

-- Demo user password for both rows below is: password
-- Driver login uses driver_id + phone (not user password auth).
INSERT INTO `users`
(`user_id`, `full_name`, `phone`, `email`, `password_hash`, `account_status`) VALUES
  (1, 'Demo User', '9100000001', 'demo@greenmiles.in', 'password', 'ACTIVE'),
  (2, 'Test User', '9100000002', 'test@greenmiles.in', 'password', 'ACTIVE');

INSERT INTO `wallets` (`wallet_id`, `user_id`, `balance`) VALUES
  (1, 1, 1000.00),
  (2, 2, 1200.00);

INSERT INTO `rides`
(`ride_id`, `driver_id`, `car_id`, `start_city_id`, `end_city_id`, `start_time`, `ride_status`, `available_seats`) VALUES
  (1, 1, 1, 1, 2, DATE_ADD(NOW(), INTERVAL 2 HOUR), 'ACTIVE', 6),
  (2, 2, 2, 1, 2, DATE_ADD(NOW(), INTERVAL 5 HOUR), 'ACTIVE', 4),
  (3, 3, 3, 1, 2, DATE_ADD(NOW(), INTERVAL 8 HOUR), 'ACTIVE', 3),
  (4, 4, 4, 1, 2, DATE_ADD(NOW(), INTERVAL 1 DAY), 'ACTIVE', 7);

INSERT INTO `bookings`
(`booking_id`, `user_id`, `ride_id`, `pickup_point_id`, `drop_point_id`, `seat_number`, `booking_status`) VALUES
  (1, 1, 1, 1, 7, 1, 'CONFIRMED'),
  (2, 2, 2, 2, 7, 2, 'PENDING');

INSERT INTO `notifications`
(`notification_id`, `user_id`, `title`, `message`, `type`, `is_read`) VALUES
  (1, 1, 'Booking Confirmed', 'Your booking #1 is confirmed.', 'RIDE_UPDATE', 0),
  (2, 2, 'Action Needed', 'Please complete payment for booking #2.', 'ALERT', 0);

-- Helpful checks after import:
-- SELECT COUNT(*) FROM rides;
-- SELECT COUNT(*) FROM users;
-- SELECT COUNT(*) FROM bookings;
-- Driver login examples:
-- driverId=1 phone=9001001001
-- driverId=2 phone=9001001002
