import PDFDocument from 'pdfkit';

export interface MealGuideData {
  protocolTitle: string;
  category: string;
  tier: string;
  targetKcal: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  memberName?: string;
  meals: Array<{
    name: string;
    timeOffsetMinutes: number;
    clockTime: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    prepNotes?: string;
  }>;
}

export interface TimetableData {
  hubName: string;
  weekLabel: string;
  classes: Array<{
    day: string;
    time: string;
    title: string;
    trainer: string;
    room: string;
    capacity: number;
  }>;
}

export interface InvoicePdfData {
  invoiceNo: string;
  hubName: string;
  memberName: string;
  memberEmail: string;
  date: string;
  dueDate: string;
  status: 'PAID' | 'OPEN' | 'PAST_DUE' | 'VOID';
  items: Array<{
    description: string;
    amountCents: number;
  }>;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  transactionRef?: string;
}

function streamToBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));
  });
}

export async function generateMealGuidePdf(data: MealGuideData): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const bufferPromise = streamToBuffer(doc);

  // Background Dark Theme Header
  doc.rect(0, 0, 595.28, 120).fill('#111319');

  // Brand Header
  doc.fillColor('#c3f400').fontSize(22).font('Helvetica-Bold').text('KINETICFIT OS', 40, 30);
  doc.fillColor('#94a3b8').fontSize(10).font('Helvetica').text('PRECISION CHRONO-NUTRITION PROTOCOL', 40, 58);
  doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text(data.protocolTitle.toUpperCase(), 40, 78);

  // Status & Tier Badge
  doc.rect(450, 35, 105, 24).fill('#262f3e');
  doc.fillColor('#00eefc').fontSize(9).font('Helvetica-Bold').text(`${data.tier} TIER`, 458, 42);

  // Target Macros Summary Box
  doc.rect(40, 135, 515, 65).fill('#f8fafc').stroke('#e2e8f0');
  doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold').text('DAILY TARGET SPECIFICATIONS', 55, 145);

  doc.fontSize(12).font('Helvetica-Bold').fillColor('#0f172a');
  doc.text(`${data.targetKcal} kcal`, 55, 165);
  doc.fontSize(9).font('Helvetica').fillColor('#64748b').text('Energy Target', 55, 180);

  doc.fontSize(12).font('Helvetica-Bold').fillColor('#0284c7');
  doc.text(`${data.proteinGrams}g`, 180, 165);
  doc.fontSize(9).font('Helvetica').fillColor('#64748b').text('Protein (4 kcal/g)', 180, 180);

  doc.fontSize(12).font('Helvetica-Bold').fillColor('#16a34a');
  doc.text(`${data.carbGrams}g`, 305, 165);
  doc.fontSize(9).font('Helvetica').fillColor('#64748b').text('Carbohydrates', 305, 180);

  doc.fontSize(12).font('Helvetica-Bold').fillColor('#ea580c');
  doc.text(`${data.fatGrams}g`, 430, 165);
  doc.fontSize(9).font('Helvetica').fillColor('#64748b').text('Lipids / Fats', 430, 180);

  // Meal Timeline Section
  doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text('CIRCADIAN MEAL TIMELINE', 40, 220);

  let y = 245;
  for (const meal of data.meals) {
    if (y > 700) {
      doc.addPage();
      y = 40;
    }

    doc.rect(40, y, 515, 60).fill('#ffffff').stroke('#e2e8f0');
    // Time strip
    doc.rect(40, y, 70, 60).fill('#111319');
    doc.fillColor('#c3f400').fontSize(11).font('Helvetica-Bold').text(meal.clockTime, 48, y + 22);

    // Meal info
    doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text(meal.name, 125, y + 10);
    doc.fillColor('#64748b').fontSize(8).font('Helvetica').text(
      meal.prepNotes || 'Follow standard nutrient timing guidelines.',
      125,
      y + 26,
      { width: 280, height: 26 }
    );

    // Meal Macros
    doc.fillColor('#334155').fontSize(9).font('Helvetica-Bold').text(
      `${meal.calories} kcal  |  P: ${meal.protein}g  C: ${meal.carbs}g  F: ${meal.fat}g`,
      415,
      y + 22,
      { align: 'right', width: 130 }
    );

    y += 70;
  }

  // Footer
  doc.fillColor('#94a3b8').fontSize(8).font('Helvetica').text(
    'KINETICFIT High-Performance Telemetry & Nutrition System • Confidential Document',
    40,
    800,
    { align: 'center', width: 515 }
  );

  doc.end();
  return bufferPromise;
}

export async function generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const bufferPromise = streamToBuffer(doc);

  // Top Accent Bar
  doc.rect(0, 0, 595.28, 8).fill('#c3f400');

  // Header Details
  doc.fillColor('#111319').fontSize(22).font('Helvetica-Bold').text('INVOICE', 40, 35);
  doc.fontSize(10).font('Helvetica').fillColor('#64748b').text(`Invoice Reference: ${data.invoiceNo}`, 40, 62);
  doc.text(`Hub: ${data.hubName}`, 40, 76);

  // Status Badge
  const statusColor = data.status === 'PAID' ? '#16a34a' : data.status === 'PAST_DUE' ? '#dc2626' : '#f59e0b';
  doc.rect(460, 35, 95, 26).fill(statusColor);
  doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold').text(data.status, 460, 42, { align: 'center', width: 95 });

  // Bill To Box
  doc.rect(40, 110, 240, 70).fill('#f8fafc').stroke('#e2e8f0');
  doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text('BILLED TO', 50, 118);
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text(data.memberName, 50, 134);
  doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(data.memberEmail, 50, 150);

  // Invoice Dates Box
  doc.rect(315, 110, 240, 70).fill('#f8fafc').stroke('#e2e8f0');
  doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text('INVOICE DATES', 325, 118);
  doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(`Issued Date: ${data.date}`, 325, 134);
  doc.text(`Payment Due: ${data.dueDate}`, 325, 150);

  // Line Items Table Header
  doc.rect(40, 205, 515, 24).fill('#111319');
  doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold').text('DESCRIPTION', 55, 212);
  doc.text('AMOUNT', 480, 212, { align: 'right', width: 65 });

  // Line Items
  let y = 235;
  for (const item of data.items) {
    doc.fillColor('#0f172a').fontSize(10).font('Helvetica').text(item.description, 55, y);
    doc.font('Helvetica-Bold').text(`$${(item.amountCents / 100).toFixed(2)}`, 480, y, { align: 'right', width: 65 });
    doc.rect(40, y + 16, 515, 1).fill('#f1f5f9');
    y += 26;
  }

  // Summary Totals
  const summaryY = Math.max(y + 20, 360);
  doc.rect(340, summaryY, 215, 90).fill('#f8fafc').stroke('#e2e8f0');

  doc.fontSize(9).font('Helvetica').fillColor('#64748b').text('Subtotal:', 355, summaryY + 12);
  doc.font('Helvetica-Bold').fillColor('#0f172a').text(`$${(data.subtotalCents / 100).toFixed(2)}`, 470, summaryY + 12, { align: 'right', width: 75 });

  doc.fontSize(9).font('Helvetica').fillColor('#64748b').text('Tax (0.0%):', 355, summaryY + 32);
  doc.font('Helvetica-Bold').fillColor('#0f172a').text(`$${(data.taxCents / 100).toFixed(2)}`, 470, summaryY + 32, { align: 'right', width: 75 });

  doc.rect(340, summaryY + 52, 215, 1).fill('#e2e8f0');

  doc.fontSize(12).font('Helvetica-Bold').fillColor('#111319').text('Total Due:', 355, summaryY + 64);
  doc.fillColor('#16a34a').text(`$${(data.totalCents / 100).toFixed(2)}`, 460, summaryY + 64, { align: 'right', width: 85 });

  if (data.transactionRef) {
    doc.fontSize(8).font('Helvetica').fillColor('#94a3b8').text(`Settlement Ref: ${data.transactionRef}`, 40, summaryY + 70);
  }

  // Legal footer
  doc.fillColor('#94a3b8').fontSize(8).font('Helvetica').text(
    'KineticFit OS Technologies, Inc. • Automated Accounting & Billing Engine',
    40,
    800,
    { align: 'center', width: 515 }
  );

  doc.end();
  return bufferPromise;
}

export async function generateTimetablePdf(data: TimetableData): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
  const bufferPromise = streamToBuffer(doc);

  // Landscape dimensions: 841.89 x 595.28
  doc.rect(0, 0, 841.89, 70).fill('#111319');
  doc.fillColor('#c3f400').fontSize(20).font('Helvetica-Bold').text('KINETICFIT SCHEDULE', 40, 20);
  doc.fillColor('#94a3b8').fontSize(10).font('Helvetica').text(`${data.hubName.toUpperCase()} • ${data.weekLabel}`, 40, 44);

  // Class table
  doc.rect(40, 85, 761.89, 22).fill('#262f3e');
  doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
  doc.text('DAY', 50, 91, { width: 80 });
  doc.text('TIME', 140, 91, { width: 90 });
  doc.text('SESSION TITLE', 240, 91, { width: 220 });
  doc.text('COACH', 470, 91, { width: 120 });
  doc.text('STUDIO / ROOM', 600, 91, { width: 110 });
  doc.text('CAPACITY', 720, 91, { width: 70, align: 'right' });

  let y = 115;
  for (const c of data.classes) {
    if (y > 540) {
      doc.addPage({ layout: 'landscape' });
      y = 40;
    }

    doc.fillColor('#0f172a').fontSize(9).font('Helvetica');
    doc.text(c.day, 50, y, { width: 80 });
    doc.font('Helvetica-Bold').text(c.time, 140, y, { width: 90 });
    doc.font('Helvetica-Bold').fillColor('#0284c7').text(c.title, 240, y, { width: 220 });
    doc.fillColor('#334155').font('Helvetica').text(c.trainer, 470, y, { width: 120 });
    doc.text(c.room, 600, y, { width: 110 });
    doc.font('Helvetica-Bold').fillColor('#16a34a').text(`${c.capacity} spots`, 720, y, { width: 70, align: 'right' });

    doc.rect(40, y + 14, 761.89, 1).fill('#f1f5f9');
    y += 22;
  }

  doc.end();
  return bufferPromise;
}

export function generateCsvExport(headers: string[], rows: (string | number)[][]): string {
  const sanitize = (val: string | number) => {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const headerLine = headers.map(sanitize).join(',');
  const rowLines = rows.map((row) => row.map(sanitize).join(','));
  return [headerLine, ...rowLines].join('\n');
}

