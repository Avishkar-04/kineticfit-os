import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { createLogger } from '@kineticfit/observability';
import {
  MealGuideData,
  InvoicePdfData,
  TimetableData,
  generateMealGuidePdf,
  generateInvoicePdf,
  generateTimetablePdf,
  generateCsvExport
} from './pdf-generator.js';

const logger = createLogger('fn-pdf-export');

export function buildPdfExportApp(): FastifyInstance {
  const app = Fastify({ logger: false });
  app.register(cors, { origin: true });

  // Health
  app.get('/health', async () => ({
    status: 'UP',
    service: 'fn-pdf-export',
    stateless: true,
    capabilities: ['pdf:meal-guide', 'pdf:invoice', 'pdf:timetable', 'csv:table']
  }));

  // Meal Guide PDF
  app.post<{ Body: MealGuideData }>('/export/meal-guide', async (req, reply) => {
    const startTime = Date.now();
    try {
      const pdfBuffer = await generateMealGuidePdf(req.body);
      const durationMs = Date.now() - startTime;
      logger.info('Meal guide PDF generated', {
        title: req.body.protocolTitle,
        sizeBytes: pdfBuffer.length,
        durationMs
      });

      if (req.headers.accept === 'application/pdf') {
        return reply
          .header('Content-Type', 'application/pdf')
          .header('Content-Disposition', `attachment; filename="meal-guide-${encodeURIComponent(req.body.protocolTitle)}.pdf"`)
          .send(pdfBuffer);
      }

      return reply.code(200).send({
        success: true,
        protocolTitle: req.body.protocolTitle,
        mimeType: 'application/pdf',
        sizeBytes: pdfBuffer.length,
        base64: pdfBuffer.toString('base64'),
        durationMs
      });
    } catch (err: any) {
      logger.error('Meal guide PDF generation failed', { error: err.message });
      return reply.code(500).send({ error: 'PDF generation failed', message: err.message });
    }
  });

  // Invoice PDF
  app.post<{ Body: InvoicePdfData }>('/export/invoice', async (req, reply) => {
    const startTime = Date.now();
    try {
      const pdfBuffer = await generateInvoicePdf(req.body);
      const durationMs = Date.now() - startTime;
      logger.info('Invoice PDF generated', {
        invoiceNo: req.body.invoiceNo,
        sizeBytes: pdfBuffer.length,
        durationMs
      });

      if (req.headers.accept === 'application/pdf') {
        return reply
          .header('Content-Type', 'application/pdf')
          .header('Content-Disposition', `attachment; filename="invoice-${req.body.invoiceNo}.pdf"`)
          .send(pdfBuffer);
      }

      return reply.code(200).send({
        success: true,
        invoiceNo: req.body.invoiceNo,
        mimeType: 'application/pdf',
        sizeBytes: pdfBuffer.length,
        base64: pdfBuffer.toString('base64'),
        durationMs
      });
    } catch (err: any) {
      logger.error('Invoice PDF generation failed', { error: err.message });
      return reply.code(500).send({ error: 'Invoice generation failed', message: err.message });
    }
  });

  // Timetable PDF
  app.post<{ Body: TimetableData }>('/export/timetable', async (req, reply) => {
    const startTime = Date.now();
    try {
      const pdfBuffer = await generateTimetablePdf(req.body);
      const durationMs = Date.now() - startTime;
      logger.info('Timetable PDF generated', {
        hubName: req.body.hubName,
        sizeBytes: pdfBuffer.length,
        durationMs
      });

      if (req.headers.accept === 'application/pdf') {
        return reply
          .header('Content-Type', 'application/pdf')
          .header('Content-Disposition', `attachment; filename="timetable-${encodeURIComponent(req.body.hubName)}.pdf"`)
          .send(pdfBuffer);
      }

      return reply.code(200).send({
        success: true,
        hubName: req.body.hubName,
        mimeType: 'application/pdf',
        sizeBytes: pdfBuffer.length,
        base64: pdfBuffer.toString('base64'),
        durationMs
      });
    } catch (err: any) {
      logger.error('Timetable PDF generation failed', { error: err.message });
      return reply.code(500).send({ error: 'Timetable PDF generation failed', message: err.message });
    }
  });

  // CSV Export
  app.post<{ Body: { headers: string[]; rows: (string | number)[][] } }>('/export/csv', async (req, reply) => {
    try {
      const csv = generateCsvExport(req.body.headers, req.body.rows);
      if (req.headers.accept === 'text/csv') {
        return reply
          .header('Content-Type', 'text/csv')
          .header('Content-Disposition', 'attachment; filename="export.csv"')
          .send(csv);
      }
      return { success: true, mimeType: 'text/csv', csv, rowCount: req.body.rows.length };
    } catch (err: any) {
      return reply.code(500).send({ error: 'CSV export failed', message: err.message });
    }
  });

  return app;
}
