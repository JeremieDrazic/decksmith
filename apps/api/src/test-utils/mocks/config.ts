export const config = {
  nodeEnv: 'test' as const,
  port: 3000,
  host: '0.0.0.0',
  databaseUrl: 'postgresql://test',
  cookieSecret: 'x'.repeat(64),
  corsOrigin: 'http://localhost:5173',
};
