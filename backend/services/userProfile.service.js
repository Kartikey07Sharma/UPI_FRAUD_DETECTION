import { exec } from "child_process";
import path from "path";

/**
 * Trigger Python script to update user_profiles table
 * This runs asynchronously (non-blocking)
 */
export function triggerUserProfileUpdate() {
    const scriptPath = path.resolve(
        "python",
        "update_user_profile.py"
    );

    exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error("❌ Profile update failed:", error.message);
            return;
        }

        if (stderr) {
            console.error("⚠️ Profile update warning:", stderr);
            return;
        }

        console.log("✅ User profiles updated successfully");
        console.log(stdout);
    });
}
