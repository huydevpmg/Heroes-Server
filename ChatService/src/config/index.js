import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export default {
   AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:4000',
}