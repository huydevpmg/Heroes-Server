import { Storage } from '@google-cloud/storage';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const storage = new Storage({
  keyFilename: join(process.cwd(), process.env.KEY_FILENAME),
  projectId: process.env.PROJECT_ID,
});

const bucketName = process.env.BUCKET_NAME;

export async function uploadFileToGCS(filePath, destFileName) {
  await storage.bucket(bucketName).upload(filePath, {
    destination: destFileName,
    resumable: false,
  });
  return `https://storage.googleapis.com/${bucketName}/${destFileName}`;
}