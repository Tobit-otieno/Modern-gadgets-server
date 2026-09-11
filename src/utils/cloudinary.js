import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

const requiredConfig = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  process.env.CLOUDINARY_API_SECRET ? 'CLOUDINARY_API_SECRET' : 'CLOUDINARY_SECRET_KEY'
].filter(Boolean);

for (const key of requiredConfig) {
  if (!process.env[key]) {
    throw new Error(`Missing Cloudinary config: ${key}`);
  }
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET_KEY,
  secure: true 
});


export default cloudinary;