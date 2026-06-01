import { query } from './config/db.js';
import 'dotenv/config';

async function check() {
    try {
        const rows = await query('SELECT * FROM transactions LIMIT 1');
        console.log('--- Transactions Columns ---');
        if (rows.length > 0) {
            console.log(Object.keys(rows[0]));
            console.log('Sample Row:', rows[0]);
        } else {
            console.log('No rows found in transactions table.');
        }
        
        const recent = await query('SELECT * FROM transactions ORDER BY tx_timestamp DESC LIMIT 5');
        console.log('--- Recent Transactions ---');
        console.log(recent);
    } catch (err) {
        console.error('❌ Check failed:', err);
    } finally {
        process.exit(0);
    }
}

check();
