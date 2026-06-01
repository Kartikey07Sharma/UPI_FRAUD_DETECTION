import fs from 'fs';
try {
    const data = fs.readFileSync('backend_debug.txt', 'utf8');
    console.log("--- FULL LOG START ---");
    console.log(data);
    console.log("--- FULL LOG END ---");
} catch (e) {
    console.error("Failed to read log:", e.message);
}
