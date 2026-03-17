-- ========================================================
-- ADMIN DELETE POLICY MIGRATION
-- Уг скриптийг Supabase Dashboard -> SQL Editor дээр уншуулна уу
-- ========================================================

-- `worship_songs` (Магтаал дуу) хүснэгтийн устгах эрхийг хүн бүрт нээх
-- (UI дээр зөвхөн админ устгах товч харна)
DROP POLICY IF EXISTS "Users can delete own songs" ON worship_songs;
CREATE POLICY "Anyone can delete songs" 
    ON worship_songs FOR DELETE 
    USING (true);

-- `audiobooks` (Сонсдог ном) хүснэгтийн устгах эрхийг хүн бүрт нээх
DROP POLICY IF EXISTS "Users can delete own audiobooks" ON audiobooks;
CREATE POLICY "Anyone can delete audiobooks" 
    ON audiobooks FOR DELETE 
    USING (true);
