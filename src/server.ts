import { initDatabase } from './database/init';
import { createApp } from './app';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize database
    const db = await initDatabase();
    console.log('Database initialized successfully');

    // Create Express app
    const app = createApp(db);

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();