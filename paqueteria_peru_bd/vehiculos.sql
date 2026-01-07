-- Inserción de Vehículos (Flota inicial)
INSERT INTO vehiculos (placa, marca, modelo, capacidad_kg, tipo, estado) VALUES 
('A1B-100', 'Toyota', 'Hiace', 1500, 'furgoneta', 'activo'),
('A2C-200', 'Hyundai', 'H1', 1200, 'furgoneta', 'activo'),
('B3D-300', 'Volvo', 'FH16', 25000, 'camion', 'activo'),
('C4E-400', 'Scania', 'R450', 28000, 'camion', 'activo'),
('D5F-500', 'Mitsubishi', 'Canter', 5000, 'camioneta', 'activo'),
('E6G-600', 'Honda', 'GL150', 50, 'moto', 'activo'),
('F7H-700', 'Yamaha', 'FZN', 60, 'moto', 'activo'),
('G8I-800', 'Mercedes', 'Sprinter', 2000, 'furgoneta', 'mantenimiento'),
('H9J-900', 'Hino', 'Dutro', 4000, 'camion', 'activo'),
('I0K-000', 'Isuzu', 'NPR', 4500, 'camion', 'activo')
ON DUPLICATE KEY UPDATE estado = VALUES(estado);
