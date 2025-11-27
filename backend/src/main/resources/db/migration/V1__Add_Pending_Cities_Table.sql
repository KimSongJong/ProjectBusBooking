-- ============================================
-- PHASE 1: Add Pending Cities System
-- ============================================
-- Purpose: Allow admin to approve new cities from user-added stations
-- Date: 2025-11-27
-- ============================================

-- Step 1: Create pending_cities table
CREATE TABLE IF NOT EXISTS `pending_cities` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `city_name` VARCHAR(100) NOT NULL UNIQUE,
  `normalized_name` VARCHAR(100) NOT NULL,
  `latitude` DECIMAL(10,8) NOT NULL COMMENT 'City center latitude',
  `longitude` DECIMAL(11,8) NOT NULL COMMENT 'City center longitude',
  `suggested_by_station_id` INT COMMENT 'Station that triggered this city addition',
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `approved_at` DATETIME NULL,
  `approved_by` INT NULL COMMENT 'Admin user ID',
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2: Add is_approved column to stations
ALTER TABLE `stations`
ADD COLUMN `is_approved` BOOLEAN DEFAULT TRUE COMMENT 'False if station uses unapproved city',
ADD INDEX `idx_is_approved` (`is_approved`);

-- Step 3: Add priority to cities (for sorting)
-- Popular cities get priority 1, others get 2
-- (Will be managed in backend code via VIETNAM_PROVINCES constant)

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check pending_cities table
SELECT * FROM pending_cities ORDER BY created_at DESC LIMIT 5;

-- Check stations with approval status
SELECT id, name, city, is_approved FROM stations ORDER BY created_at DESC LIMIT 10;

