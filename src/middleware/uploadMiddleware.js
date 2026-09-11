import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Accept all image types including HEIF/HEIC (Apple format) and RAW
const fileFilter = (req, file, cb) => {
  const allowedMimetypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
    'image/avif',
    'image/tiff',
    'application/octet-stream', // some HEIC files come through as this
  ];

  const allowedExtensions = [
    '.jpg', '.jpeg', '.png', '.webp',
    '.gif', '.heic', '.heif', '.avif', '.tiff'
  ];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimetypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype} (${ext})`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB to handle high res and RAW images
  }
});

export default upload;