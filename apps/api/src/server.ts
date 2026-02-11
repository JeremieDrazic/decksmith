import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import { config } from './config.js';
import errorHandler from './plugins/error-handler.js';
import health from './plugins/health.js';
import v1Routes from './plugins/v1-routes.js';

/** Create a configured Fastify instance without starting it. */
export async function buildServer() {
  const app = Fastify({
    logger: {
      level: config.nodeEnv === 'production' ? 'info' : 'debug',
      ...(config.nodeEnv !== 'production' && {
        transport: { target: 'pino-pretty' },
      }),
    },
    trustProxy: true,
  });

  // Zod validation & serialization (replaces Ajv)
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Plugins
  await app.register(cors);
  await app.register(sensible);
  await app.register(errorHandler);

  // Routes
  await app.register(health);
  await app.register(v1Routes);

  return app;
}
