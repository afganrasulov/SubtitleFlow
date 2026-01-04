import { setupWorkers } from '../lib/workers';
import * as dotenv from 'dotenv';
dotenv.config();

console.log('Starting workers...');
setupWorkers();

// Keep process alive
process.on('SIGTERM', () => {
    console.log('Workers shutting down...');
    process.exit();
});
