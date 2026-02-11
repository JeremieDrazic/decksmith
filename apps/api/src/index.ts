import { config } from './config.js';
import { buildServer } from './server.js';

const app = await buildServer();

await app.listen({ port: config.port, host: config.host });

function shutdown(signal: string) {
  app.log.info(`Received ${signal}, shutting down…`);
  void app.close();
}

process.on('SIGINT', () => {
  shutdown('SIGINT');
});
process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});
