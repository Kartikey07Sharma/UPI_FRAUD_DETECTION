import { exec } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Trigger Python script to update user_profiles table
 * Returns a Promise that resolves when the update is complete.
 * @param {string[]} upiIds Optional array of UPI IDs to update specifically
 */
export function triggerUserProfileUpdate(upiIds = []) {
    return new Promise((resolve, reject) => {
        // Correct path relative to this file
        const scriptPath = path.join(__dirname, "../../Database/update_user_profile.py");

        let command = `python "${scriptPath}"`;
        if (upiIds && upiIds.length > 0) {
            const idsString = upiIds.join(',');
            command += ` "${idsString}"`;
            console.log(` Starting User Profile Update for ${upiIds.length} users...`);
        } else {
            console.log(" Starting User Profile Update for all users...");
        }
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(" Profile update failed:", error.message);
                return reject(error);
            }

            if (stderr) {
                console.warn(" Profile update warning:", stderr);
            }

            console.log(" User profiles updated successfully");
            console.log(stdout);
            resolve(stdout);
        });
    });
}
