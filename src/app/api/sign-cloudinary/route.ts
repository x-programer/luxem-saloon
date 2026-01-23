
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { validateFolder } from '@/lib/security';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Rate Limiter: 10 requests per minute per user/IP
const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});

export async function POST(request: Request) {
    try {
        if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_KEY) {
            console.error("Missing Cloudinary Configuration");
            return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
        }

        const body = await request.json();
        const { folder, userId } = body;

        // 1. Auth Check (Basic)
        if (!userId) {
            console.error("Unauthorized: No userId provided");
            return NextResponse.json({ error: 'Unauthorized: Missing User ID' }, { status: 401 });
        }

        // 2. Rate Limit Check
        try {
            await limiter.check(10, userId); // Max 10 uploads per min per user
        } catch {
            console.error(`Rate limit exceeded for user ${userId}`);
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }

        // 3. Input Validation
        if (!folder || !validateFolder(folder)) {
            console.error(`Invalid folder requested: "${folder}"`);
            return NextResponse.json({ error: 'Invalid upload directory' }, { status: 400 });
        }

        const timestamp = Math.round(new Date().getTime() / 1000);

        const signature = cloudinary.utils.api_sign_request({
            timestamp: timestamp,
            folder: folder,
        }, process.env.CLOUDINARY_API_SECRET as string);

        return NextResponse.json({
            timestamp,
            signature,
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY
        });

    } catch (error) {
        console.error('Error in sign-cloudinary:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
    }
}
