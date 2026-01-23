
export function sanitizeFileName(name: string): string {
    // 1. Remove file extension (it will be added locally or by Cloudinary)
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.')) || name;

    // 2. Allow only alphanumeric, dashes, and underscores
    const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '');

    // 3. Limit length to 100 chars
    return sanitized.substring(0, 100);
}

export function validateFolder(folder: string): boolean {
    // Pattern: users/{uid}/{gallery|logo|banner}
    // uid is typically alphanumeric (28 chars for Firebase)
    const pattern = /^luxe-salon\/users\/[a-zA-Z0-9]+\/(gallery|logo|banner|staff|products)$/;
    return pattern.test(folder);
}

export function validatePublicId(publicId: string, userId: string): boolean {
    // Ensure the publicId starts with the user's specific path
    // publicId example: luxe-salon/users/{uid}/gallery/filename
    const expectedPrefix = `luxe-salon/users/${userId}/`;
    return publicId.startsWith(expectedPrefix);
}
