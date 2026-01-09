'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.runSql(`
    -- Add employee review specific fields
    ALTER TABLE reviews 
      ADD COLUMN IF NOT EXISTS review_type VARCHAR(50) DEFAULT 'customer',
      ADD COLUMN IF NOT EXISTS employment_status VARCHAR(50),
      ADD COLUMN IF NOT EXISTS job_title VARCHAR(255),
      ADD COLUMN IF NOT EXISTS pros TEXT,
      ADD COLUMN IF NOT EXISTS cons TEXT,
      ADD COLUMN IF NOT EXISTS work_life_balance_rating INTEGER,
      ADD COLUMN IF NOT EXISTS compensation_rating INTEGER,
      ADD COLUMN IF NOT EXISTS culture_rating INTEGER,
      ADD COLUMN IF NOT EXISTS management_rating INTEGER,
      ADD COLUMN IF NOT EXISTS career_opportunities_rating INTEGER;

    -- Add check constraint for review_type
    ALTER TABLE reviews 
      DROP CONSTRAINT IF EXISTS check_review_type;
    
    ALTER TABLE reviews 
      ADD CONSTRAINT check_review_type 
      CHECK (review_type IN ('customer', 'employee', 'business'));

    -- Add check constraint for employment_status
    ALTER TABLE reviews 
      DROP CONSTRAINT IF EXISTS check_employment_status;
    
    ALTER TABLE reviews 
      ADD CONSTRAINT check_employment_status 
      CHECK (employment_status IS NULL OR employment_status IN ('current', 'former', 'contract', 'intern'));

    -- Add check constraints for rating fields (1-5 scale)
    ALTER TABLE reviews 
      DROP CONSTRAINT IF EXISTS check_work_life_balance_rating;
    
    ALTER TABLE reviews 
      ADD CONSTRAINT check_work_life_balance_rating 
      CHECK (work_life_balance_rating IS NULL OR (work_life_balance_rating >= 1 AND work_life_balance_rating <= 5));

    ALTER TABLE reviews 
      DROP CONSTRAINT IF EXISTS check_compensation_rating;
    
    ALTER TABLE reviews 
      ADD CONSTRAINT check_compensation_rating 
      CHECK (compensation_rating IS NULL OR (compensation_rating >= 1 AND compensation_rating <= 5));

    ALTER TABLE reviews 
      DROP CONSTRAINT IF EXISTS check_culture_rating;
    
    ALTER TABLE reviews 
      ADD CONSTRAINT check_culture_rating 
      CHECK (culture_rating IS NULL OR (culture_rating >= 1 AND culture_rating <= 5));

    ALTER TABLE reviews 
      DROP CONSTRAINT IF EXISTS check_management_rating;
    
    ALTER TABLE reviews 
      ADD CONSTRAINT check_management_rating 
      CHECK (management_rating IS NULL OR (management_rating >= 1 AND management_rating <= 5));

    ALTER TABLE reviews 
      DROP CONSTRAINT IF EXISTS check_career_opportunities_rating;
    
    ALTER TABLE reviews 
      ADD CONSTRAINT check_career_opportunities_rating 
      CHECK (career_opportunities_rating IS NULL OR (career_opportunities_rating >= 1 AND career_opportunities_rating <= 5));

    -- Create index on review_type for faster filtering
    CREATE INDEX IF NOT EXISTS idx_reviews_review_type ON reviews(review_type);
    
    -- Create index on employment_status for employee review filtering
    CREATE INDEX IF NOT EXISTS idx_reviews_employment_status ON reviews(employment_status);

    COMMENT ON COLUMN reviews.review_type IS 'Type of review: customer, employee, or business';
    COMMENT ON COLUMN reviews.employment_status IS 'Employment status for employee reviews: current, former, contract, intern';
    COMMENT ON COLUMN reviews.job_title IS 'Job title for employee reviews';
    COMMENT ON COLUMN reviews.pros IS 'Positive aspects highlighted in the review';
    COMMENT ON COLUMN reviews.cons IS 'Negative aspects or areas for improvement';
    COMMENT ON COLUMN reviews.work_life_balance_rating IS 'Work-life balance rating (1-5) for employee reviews';
    COMMENT ON COLUMN reviews.compensation_rating IS 'Compensation and benefits rating (1-5) for employee reviews';
    COMMENT ON COLUMN reviews.culture_rating IS 'Company culture rating (1-5) for employee reviews';
    COMMENT ON COLUMN reviews.management_rating IS 'Management quality rating (1-5) for employee reviews';
    COMMENT ON COLUMN reviews.career_opportunities_rating IS 'Career growth opportunities rating (1-5) for employee reviews';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    -- Drop indexes
    DROP INDEX IF EXISTS idx_reviews_review_type;
    DROP INDEX IF EXISTS idx_reviews_employment_status;

    -- Drop constraints
    ALTER TABLE reviews DROP CONSTRAINT IF EXISTS check_review_type;
    ALTER TABLE reviews DROP CONSTRAINT IF EXISTS check_employment_status;
    ALTER TABLE reviews DROP CONSTRAINT IF EXISTS check_work_life_balance_rating;
    ALTER TABLE reviews DROP CONSTRAINT IF EXISTS check_compensation_rating;
    ALTER TABLE reviews DROP CONSTRAINT IF EXISTS check_culture_rating;
    ALTER TABLE reviews DROP CONSTRAINT IF EXISTS check_management_rating;
    ALTER TABLE reviews DROP CONSTRAINT IF EXISTS check_career_opportunities_rating;

    -- Drop columns
    ALTER TABLE reviews 
      DROP COLUMN IF EXISTS review_type,
      DROP COLUMN IF EXISTS employment_status,
      DROP COLUMN IF EXISTS job_title,
      DROP COLUMN IF EXISTS pros,
      DROP COLUMN IF EXISTS cons,
      DROP COLUMN IF EXISTS work_life_balance_rating,
      DROP COLUMN IF EXISTS compensation_rating,
      DROP COLUMN IF EXISTS culture_rating,
      DROP COLUMN IF EXISTS management_rating,
      DROP COLUMN IF EXISTS career_opportunities_rating;
  `);
};

exports._meta = {
  "version": 1
};
