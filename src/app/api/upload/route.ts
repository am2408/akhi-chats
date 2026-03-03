import { NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req) {
  const form = new formidable.IncomingForm();
  
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return NextResponse.json({ error: 'Error parsing the files' }, { status: 500 });
    }

    const file = files.file[0];
    const uploadPath = path.join(process.cwd(), 'public/uploads', file.originalFilename);

    try {
      await fs.promises.rename(file.filepath, uploadPath);
      return NextResponse.json({ message: 'File uploaded successfully', filePath: `/uploads/${file.originalFilename}` });
    } catch (error) {
      return NextResponse.json({ error: 'Error saving the file' }, { status: 500 });
    }
  });
}