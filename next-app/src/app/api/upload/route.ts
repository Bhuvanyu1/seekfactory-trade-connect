import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';
import { promises as fs } from 'fs';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming form data
    const form = formidable({ multiples: false });
    const data = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(req as any, (err: any, fields: formidable.Fields, files: formidable.Files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });
    // Handle both single and multiple file uploads
    let fileObj = data.files.file;
    if (Array.isArray(fileObj)) fileObj = fileObj[0];
    if (!fileObj || Array.isArray(fileObj)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    // Read file and upload to Cloudinary
    const fileData = await fs.readFile((fileObj as any).filepath);
    const uploadRes = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream({ resource_type: 'image' }, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result);
      }).end(fileData);
    });
    return NextResponse.json({ url: uploadRes.secure_url }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
  }
} 