const app = require('./app');
const runMigration = require('./config/configMigration');

const PORT = process.env.PORT || 3000;


(async () => {
    try {
        await runMigration();
        app.listen(PORT, ()=>console.log(`Aplikasi berjalan pada port ${PORT}`)); 
        } catch(err) {
            console.error('Gagal memulai', err);
            process.exit(1);
        }
 }
)();
