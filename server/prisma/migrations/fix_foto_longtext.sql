-- Migración: Cambiar campo 'foto' a LONGTEXT en tabla team_members
-- Razón: Las imágenes en base64 son demasiado grandes para TEXT estándar

ALTER TABLE `team_members` MODIFY COLUMN `foto` LONGTEXT;
ALTER TABLE `team_members` MODIFY COLUMN `descripcion` LONGTEXT;
