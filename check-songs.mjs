const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdWxjZWpkZ3d5em12anlzcWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgzMjMzNywiZXhwIjoyMDg3NDA4MzM3fQ.UzUIQvVqjNSm12mRFdNRgskYAWLZQ4oD-TDGlnB5w14';
const base = 'https://poulcejdgwyzmvjysqew.supabase.co';

async function cleanup() {
    const res = await fetch(base + '/rest/v1/worship_songs?select=id,title,lyrics&order=created_at.asc', {
        headers: { 'apikey': serviceKey, 'Authorization': 'Bearer ' + serviceKey }
    });
    const songs = await res.json();

    // Keep only the last 5 (the ones with correct encoding)
    const toDelete = songs.slice(0, 5);
    console.log('Deleting', toDelete.length, 'songs with bad encoding...');

    for (const s of toDelete) {
        const delRes = await fetch(base + `/rest/v1/worship_songs?id=eq.${s.id}`, {
            method: 'DELETE',
            headers: { 'apikey': serviceKey, 'Authorization': 'Bearer ' + serviceKey }
        });
        console.log('  Deleted:', delRes.status);
    }

    // Verify
    const finalRes = await fetch(base + '/rest/v1/worship_songs?select=id,title,category,lyrics&order=created_at.asc', {
        headers: { 'apikey': serviceKey, 'Authorization': 'Bearer ' + serviceKey }
    });
    const final = await finalRes.json();
    console.log('\n📊 Final:', final.length, 'songs');
    final.forEach(s => console.log(`  🎵 [${s.category}] ${s.title} ${s.lyrics ? '📝 үгтэй' : ''}`));
    console.log('\n🎉 Done!');
}

cleanup().catch(e => console.error(e));
