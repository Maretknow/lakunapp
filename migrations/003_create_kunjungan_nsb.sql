CREATE TABLE IF NOT EXISTS kunjungan_nsb  (
    id_kunjungan BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ao_user_id BIGINT NULL REFERENCES users(id_user) ON DELETE SET NULL,
    ao_username TEXT NOT NULL,
    ao_nama_lengkap TEXT NOT NULL,
    ao_bagian TEXT NOT NULL,
    kode_kantor TEXT NOT NULL,
    tgl_kunjungan TIMESTAMPTZ,
    tipe_nasabah TEXT NOT NULL,
    nama_nasabah TEXT NOT NULL,
    no_rekening TEXT,
    kol_nsb INT,
    alamat_nsb TEXT NOT NULL,
    ket_hasil TEXT NOT NULL,
    url_foto TEXT NOT NULL,
    create_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    update_at TIMESTAMPTZ NOT NULL DEFAULT now()   
);

CREATE INDEX IF NOT EXISTS idx_kunjungan_ao_user_id ON kunjungan_nsb(ao_user_id); 
CREATE INDEX IF NOT EXISTS idx_kunjungan_ao_username ON kunjungan_nsb(ao_username); 
CREATE INDEX IF NOT EXISTS idx_kunjungan_nama_nasabah ON kunjungan_nsb(nama_nasabah); 
CREATE INDEX IF NOT EXISTS idx_kunjungan_no_rekening ON kunjungan_nsb(no_rekening); 


CREATE OR REPLACE FUNCTION trg_set_kunj_update_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_kunj_update_at ON kunjungan_nsb;

CREATE TRIGGER set_kunj_update_at
BEFORE UPDATE ON kunjungan_nsb
FOR EACH ROW
EXECUTE FUNCTION trg_set_kunj_update_at();
