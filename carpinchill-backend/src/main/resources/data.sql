-- =============================================
-- CARPINCHILL - Datos iniciales
-- =============================================
-- Contraseña de admin y agente: admin123

INSERT INTO usuario (nombre, apellidos, email, password_hash, rol, fecha_registro, activo)
SELECT 'Admin', 'CarpinChill', 'admin@carpinchill.com',
       '$2a$10$pLfmJgAJofdrpALj2jWvvOCg0/./gkCF/f166zIJvo7p06VmXInIm',
       'ADMIN', NOW(), true
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE email = 'admin@carpinchill.com');

INSERT INTO usuario (nombre, apellidos, email, password_hash, rol, fecha_registro, activo)
SELECT 'Agente', 'CarpinChill', 'agente@carpinchill.com',
       '$2a$10$pLfmJgAJofdrpALj2jWvvOCg0/./gkCF/f166zIJvo7p06VmXInIm',
       'AGENTE', NOW(), true
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE email = 'agente@carpinchill.com');

-- Viajes de prueba (fechas 2026-2027)
INSERT INTO viaje (titulo, descripcion, destino, pais, latitud, longitud, precio, fecha_inicio, fecha_fin, plazas_totales, plazas_disponibles, imagen_url, activo)
SELECT 'Escapada a París', 'Visita la ciudad del amor con guía incluido y visita a la Torre Eiffel.', 'París', 'Francia', 48.8566, 2.3522, 899.99, '2026-06-15', '2026-06-22', 20, 15, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400', true
WHERE NOT EXISTS (SELECT 1 FROM viaje WHERE titulo = 'Escapada a París');

INSERT INTO viaje (titulo, descripcion, destino, pais, latitud, longitud, precio, fecha_inicio, fecha_fin, plazas_totales, plazas_disponibles, imagen_url, activo)
SELECT 'Costa Amalfi & Capri', 'Recorre los pueblos de colores de la Costa Amalfi y la isla de Capri.', 'Amalfi', 'Italia', 40.6333, 14.6029, 1250.00, '2026-07-01', '2026-07-10', 16, 8, 'https://images.unsplash.com/photo-1612698093158-e07ac200d44e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', true
WHERE NOT EXISTS (SELECT 1 FROM viaje WHERE titulo = 'Costa Amalfi & Capri');

INSERT INTO viaje (titulo, descripcion, destino, pais, latitud, longitud, precio, fecha_inicio, fecha_fin, plazas_totales, plazas_disponibles, imagen_url, activo)
SELECT 'Marruecos Mágico', 'Zoco de Marrakech, desierto del Sahara y palacio Bahía incluidos.', 'Marrakech', 'Marruecos', 31.6295, -7.9811, 650.00, '2026-08-10', '2026-08-17', 24, 24, 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=400', true
WHERE NOT EXISTS (SELECT 1 FROM viaje WHERE titulo = 'Marruecos Mágico');

INSERT INTO viaje (titulo, descripcion, destino, pais, latitud, longitud, precio, fecha_inicio, fecha_fin, plazas_totales, plazas_disponibles, imagen_url, activo)
SELECT 'Fiordos Noruegos', 'Crucero por los fiordos de Geiranger y Bergen. Naturaleza espectacular.', 'Bergen', 'Noruega', 60.3913, 5.3221, 1899.00, '2026-09-05', '2026-09-14', 30, 22, 'https://images.unsplash.com/photo-1601439678777-b2b3c56fa627?w=400', true
WHERE NOT EXISTS (SELECT 1 FROM viaje WHERE titulo = 'Fiordos Noruegos');

INSERT INTO viaje (titulo, descripcion, destino, pais, latitud, longitud, precio, fecha_inicio, fecha_fin, plazas_totales, plazas_disponibles, imagen_url, activo)
SELECT 'Tokio & Kioto Express', 'Cultura japonesa, templos milenarios, gastronomía y tecnología.', 'Tokio', 'Japón', 35.6762, 139.6503, 2400.00, '2026-10-01', '2026-10-12', 18, 5, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', true
WHERE NOT EXISTS (SELECT 1 FROM viaje WHERE titulo = 'Tokio & Kioto Express');

INSERT INTO viaje (titulo, descripcion, destino, pais, latitud, longitud, precio, fecha_inicio, fecha_fin, plazas_totales, plazas_disponibles, imagen_url, activo)
SELECT 'Lisboa & Sintra', 'Fado, pasteles de nata, palacios de cuento y el Atlántico.', 'Lisboa', 'Portugal', 38.7223, -9.1393, 549.00, '2026-06-01', '2026-06-07', 25, 20, 'https://images.unsplash.com/photo-1753112982199-d2a448263224?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', true
WHERE NOT EXISTS (SELECT 1 FROM viaje WHERE titulo = 'Lisboa & Sintra');
