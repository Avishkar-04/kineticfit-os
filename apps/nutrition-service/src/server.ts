import { buildNutritionApp } from './index.js';
import { createLogger } from '@kineticfit/observability';

const logger = createLogger('nutrition-server');
const port = Number(process.env.PORT || 3004);

async function start() {
  const app = buildNutritionApp();
  try {
    await app.listen({ port, host: '0.0.0.0' });
    logger.info('Nutrition service listening', { port });
  } catch (err) {
    logger.error('Failed to start nutrition service', { error: String(err) });
    process.exit(1);
  }
}

start();
