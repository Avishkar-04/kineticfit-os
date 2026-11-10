import { buildPdfExportApp } from './index.js';
import { createLogger } from '@kineticfit/observability';

const logger = createLogger('fn-pdf-server');
const port = Number(process.env.PORT || 3008);

async function start() {
  const app = buildPdfExportApp();
  try {
    await app.listen({ port, host: '0.0.0.0' });
    logger.info('PDF export function container listening', { port });
  } catch (err) {
    logger.error('Failed to start PDF export function service', { error: String(err) });
    process.exit(1);
  }
}

start();
