-- Add image_url column to drivers table
USE bus_booking;

ALTER TABLE drivers 
ADD COLUMN image_url VARCHAR(500) NULL 
AFTER experience_years;

-- Check the result
DESCRIBE drivers;
