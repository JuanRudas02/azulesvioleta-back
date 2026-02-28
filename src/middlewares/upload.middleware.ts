import multer from 'multer';

// Use memory storage to keep the file buffer in memory, so we can upload it directly to Supabase
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});
