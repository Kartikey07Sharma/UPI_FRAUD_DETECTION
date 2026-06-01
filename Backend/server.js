import "dotenv/config";
import app from "./app.js";

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
});


// ================================
// SERVER CONFIG
// ================================
const PORT = process.env.PORT || 5000;

// ================================
// START SERVER
// ================================
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
    console.error('Server failed to start:', err);
});

