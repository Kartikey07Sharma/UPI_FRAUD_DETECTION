import app from "./app.js";

// ================================
// SERVER CONFIG
// ================================
const PORT = process.env.PORT || 5000;

// ================================
// START SERVER
// ================================
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
