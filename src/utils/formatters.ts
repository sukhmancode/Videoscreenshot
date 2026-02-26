/**
 * Generates a Cloudinary snapshot URL from a video URL and a timestamp.
 * 
 * @param videoUrl The original Cloudinary video URL.
 * @param timeStamp The second at which to take the snapshot.
 * @param transformation Additional image transformations (optional).
 * @returns The formatted snapshot URL.
 */
export function generateSnapshotUrl(
    videoUrl: string,
    timeStamp: number,
    transformation: string = 'f_auto,q_auto'
): string {
    // Replace the extension with .jpg (or .png/webp if preferred)
    // Cloudinary handles format conversion automatically
    let baseUrl = videoUrl.replace(/\.[^/.]+$/, '.jpg');

    // We need to insert the 'so_X' transformation.
    // Standard Cloudinary URLs look like: .../video/upload/[transformations]/v12345/public_id

    const uploadMarker = '/video/upload/';
    if (!baseUrl.includes(uploadMarker)) {
        // If it's not a standard upload URL, we might need to be more careful.
        // For now, let's assume it's a standard one or at least contains /video/
        baseUrl = baseUrl.replace('/video/', '/video/upload/');
    }

    const parts = baseUrl.split(uploadMarker);
    if (parts.length !== 2) {
        // Fallback: Just return as is if we can't parse it reliably
        return baseUrl;
    }

    const [prefix, suffix] = parts;

    // Format the start offset (so_) and any other transformations
    const snapshotTransform = `so_${timeStamp}${transformation ? `,${transformation}` : ''}`;

    return `${prefix}${uploadMarker}${snapshotTransform}/${suffix}`;
}
