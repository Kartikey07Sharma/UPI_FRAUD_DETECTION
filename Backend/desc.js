import { query } from './config/db.js';
(async () => {
    try {
        const rows = await query('DESCRIBE transactions');
        console.log(rows);
    } catch (e) { console.error(e); }
    process.exit(0);
})();
