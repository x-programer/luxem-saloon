
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { validatePublicId } from '@/lib/security';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Rate Limiter: 20 requests per minute per user/IP for deletion
const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { publicId, userId } = body;

        // 1. Auth Check (Basic)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized: Missing User ID' }, { status: 401 });
        }

        // 2. Rate Limit Check
        try {
            await limiter.check(20, userId);
        } catch {
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }

        // 3. Ownership Validation
        if (!publicId || !validatePublicId(publicId, userId)) {
            console.error(`Invalid deletion attempt. Public ID: ${publicId}, User ID: ${userId}`);
            return NextResponse.json({ error: 'Invalid public ID or unauthorized access' }, { status: 403 });
        }

        // 4. Delete from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result !== 'ok') {
            console.error("Cloudinary deletion failed:", result);
            return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error in delete-image:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
