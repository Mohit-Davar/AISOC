CREATE TABLE camera_feeds (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL
);

INSERT INTO camera_feeds (location, status) VALUES
('Main Entrance', 'active'),
('Warehouse Exit', 'inactive'),
('Front Gate', 'active'),
('Rear Loading Zone', 'active');
