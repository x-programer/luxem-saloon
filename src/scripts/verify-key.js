// src/scripts/verify-key.js
// Run with: node src/scripts/verify-key.js

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
    console.error("❌ .env.local file not found at:", envPath);
    process.exit(1);
}

const envConfig = dotenv.parse(fs.readFileSync(envPath));
let rawKey = envConfig.FIREBASE_PRIVATE_KEY;

console.log("🔍 Checking FIREBASE_PRIVATE_KEY...");

if (!rawKey) {
    console.error("❌ FIREBASE_PRIVATE_KEY is missing in .env.local");
    process.exit(1);
}

console.log(`Original Length: ${rawKey.length} characters`);

// Basic Format Check
if (rawKey.startsWith('"') && rawKey.endsWith('"')) {
    console.log("ℹ️  Key is wrapped in double quotes. Removing them...");
    rawKey = rawKey.slice(1, -1);
}

// Newline Replacement
const formattedKey = rawKey.replace(/\\n/g, '\n');

console.log(`Formatted Length: ${formattedKey.length} characters`);
console.log(`First 30 chars: ${formattedKey.substring(0, 30)}...`);
console.log(`Last 30 chars: ...${formattedKey.substring(formattedKey.length - 30)}`);

// Header Check
const EXPECTED_HEADER = "-----BEGIN PRIVATE KEY-----";
if (!formattedKey.includes(EXPECTED_HEADER)) {
    console.error(`❌ CRITICAL: Unknown Header. Expected "${EXPECTED_HEADER}"`);
} else {
    console.log("✅ Header Found");
}

// Crypto Check (The Ultimate Test)
try {
    crypto.createPrivateKey(formattedKey);
    console.log("✅ SUCCESS: Node.js 'crypto' module successfully parsed the key!");
    console.log("   The key format is valid.");
} catch (error) {
    console.error("❌ PARSE FAILED: Node.js could not parse this key.");
    console.error("   Error Details:", error.message);

    if (error.message.includes('asn1') || error.message.includes('base64')) {
        console.error("   💡 HINT: Copy-paste error? Make sure you didn't miss characters.");
    }
}
