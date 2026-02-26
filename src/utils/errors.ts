export class CloudinarySnapshotError extends Error {
    constructor(message: string, public readonly code: string, public readonly status?: number) {
        super(message);
        this.name = 'CloudinarySnapshotError';
        Object.setPrototypeOf(this, CloudinarySnapshotError.prototype);
    }
}

export class ValidationError extends CloudinarySnapshotError {
    constructor(message: string) {
        super(message, 'VALIDATION_ERROR', 400);
    }
}

export class CloudinaryApiError extends CloudinarySnapshotError {
    constructor(message: string, status?: number) {
        super(message, 'CLOUDINARY_API_ERROR', status);
    }
}
