// src/scripts/test-db.ts
// Run with: npx ts-node src/scripts/test-db.ts
// Or if inside Next.js environment context is tricky, you can make this a temporal API route or just rely on server action triggering.

// Since we cannot easily run 'ts-node' in some Next.js environments without setup, 
// we will structure this as a standalone script that imports the admin config.
// NOTE: This requires ts-node and tsconfig-paths if imports use aliases like @/

require('dotenv').config({ path: '.env.local' });

const { adminDb } = require('../lib/firebase/admin');

async function testConnection() {
    console.log("🔥 Testing Firebase Admin Connection...");

    try {
        const collections = await adminDb.listCollections();
        console.log("✅ Connection Successful!");
        console.log(`Found ${collections.length} root collections.`);

        if (collections.length > 0) {
            console.log("Collections:", collections.map((c: any) => c.id).join(', '));
        }

    } catch (error: any) {
        console.error("❌ Connection Failed:", error);

        if (error.code === '1E08010C' || error.message?.includes('DECODER')) {
            console.error("\n💡 HINT: This is likely a Private Key formatting issue.");
            console.error("   Ensure your .env.local file has the key in quotes if it contains newlines,");
            console.error("   and that the admin.ts fix (replace \\n with real newlines) is active.");
        }
    }
}

testConnection();
