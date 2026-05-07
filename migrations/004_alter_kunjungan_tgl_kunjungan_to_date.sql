DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'kunjungan_nsb'
        AND column_name = 'tgl_kunjungan'
        AND data_type <> 'date'
    ) THEN
    ALTER TABLE kunjungan_nsb
        ALTER COLUMN tgl_kunjungan TYPE DATE
        USING tgl_kunjungan::date;
END IF;
END $$;