import { buildBillingApp } from './index.js';
import { createLogger } from '@kineticfit/observability';

const logger = createLogger('billing-server');
const port = Number(process.env.PORT || 3005);

async function start() {
  const app = buildBillingApp();
  try {
    await app.listen({ port, host: '0.0.0.0' });
    logger.info('Billing service listening', { port });
  } catch (err) {
    logger.error('Failed to start billing service', { error: String(err) });
    process.exit(1);
  }
}

start();
