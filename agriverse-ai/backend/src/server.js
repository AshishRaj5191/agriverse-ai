const app = require('./app');
const env = require('./config/env');
const connectDatabase = require('./config/db');

async function bootstrap() {
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`[SERVER] Backend listening on port ${env.port}`);
  });
}

bootstrap();
