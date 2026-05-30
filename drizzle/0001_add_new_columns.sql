-- Safe migration: add new columns to guests table
-- Data existing tetap utuh (nullable columns, no default)

ALTER TABLE guests ADD COLUMN kategori text;
ALTER TABLE guests ADD COLUMN pekerjaan text;
ALTER TABLE guests ADD COLUMN jenis_organisasi text;
