import axios from "axios";

const BASE_URL = process.env.VITE_API_BASE_URL || "http://localhost:5000";

async function verifyAuth() {
    try {
        console.log("Starting Auth Verification (Cookie Mode)...");

        // 1. Register
        const username = `testuser_${Date.now()}`;
        const password = "password123";
        console.log(`\n1. Registering user: ${username}`);

        let cookie = "";

        try {
            const registerRes = await axios.post(`${BASE_URL}/api/auth/register`, {
                username,
                password,
                firstName: "Test",
                lastName: "User"
            });
            console.log("   Registration successful:", registerRes.status);

            // Extract cookie
            const setCookie = registerRes.headers["set-cookie"];
            if (setCookie) {
                cookie = setCookie.map(c => c.split(";")[0]).join("; ");
                console.log("   Cookies received:", true);
            } else {
                console.error("   No cookies received!");
            }

        } catch (e: any) {
            console.error("   Registration failed:");
            console.error("   Status:", e.response?.status);
            console.error("   Message:", e.message);
            process.exit(1);
        }

        // 2. Login
        console.log(`\n2. Logging in user: ${username}`);
        try {
            const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
                username,
                password
            });
            console.log("   Login successful:", loginRes.status);

            const setCookie = loginRes.headers["set-cookie"];
            if (setCookie) {
                cookie = setCookie.map(c => c.split(";")[0]).join("; ");
                console.log("   Cookies received:", true);
            }
        } catch (e: any) {
            console.error("   Login failed:");
            console.error("   Message:", e.message);
            process.exit(1);
        }

        // 3. Access Protected Route (e.g., /api/sections)
        console.log("\n3. Accessing protected route (/api/sections) WITH cookie");
        try {
            const protectedRes = await axios.get(`${BASE_URL}/api/sections`, {
                headers: { Cookie: cookie }
            });
            console.log("   Access successful:", protectedRes.status);
            console.log("   Data received:", Array.isArray(protectedRes.data) ? "Yes (Array)" : "No");
        } catch (e: any) {
            console.error("   Access failed:");
            console.error("   Status:", e.response?.status);
            console.error("   Message:", e.message);
            process.exit(1);
        }

        // 4. Access Protected Route WITHOUT cookie
        console.log("\n4. Accessing protected route (/api/sections) WITHOUT cookie");
        try {
            await axios.get(`${BASE_URL}/api/sections`);
            console.error("   Access succeeded (SHOULD FAIL)");
            process.exit(1);
        } catch (e: any) {
            if (e.response?.status === 401) {
                console.log("   Access failed as expected:", e.response.status);
            } else {
                console.error("   Unexpected error (Expected 401):", e.response?.status || e.message);
                process.exit(1);
            }
        }

        console.log("\nVerification Complete: All checks passed!");

    } catch (err: any) {
        console.error("Verification script error:", err.message);
        process.exit(1);
    }
}

verifyAuth();
