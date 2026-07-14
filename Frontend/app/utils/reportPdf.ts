import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export { autoTable };

let cachedLogoDataUrl: string | null | undefined;

// Fetches /logo.png and converts it to a base64 data URL, since jsPDF's addImage
// needs raw image data rather than a URL. Cached after the first successful load.
export async function getLogoDataUrl(): Promise<string | null> {
  if (cachedLogoDataUrl !== undefined) return cachedLogoDataUrl;
  try {
    const response = await fetch('/logo.png');
    const blob = await response.blob();
    cachedLogoDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    cachedLogoDataUrl = null;
  }
  return cachedLogoDataUrl;
}

export async function drawReportHeader(
  doc: jsPDF,
  { title, subtitle }: { title: string; subtitle?: string }
): Promise<number> {
  const logo = await getLogoDataUrl();
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', 14, 10, 18, 18);
    } catch {
      // Corrupt/unsupported image data — skip the logo rather than fail the report.
    }
  }

  const textX = logo ? 36 : 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('RSBS — Rwanda School Bridge System', textX, 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(`Generated on ${new Date().toLocaleString()}`, textX, 23);
  doc.setTextColor(0, 0, 0);

  doc.setDrawColor(200, 200, 200);
  doc.line(14, 31, 196, 31);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, 14, 41);

  let y = 41;
  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(subtitle, 14, 47);
    doc.setTextColor(0, 0, 0);
    y = 47;
  }

  return y + 8;
}

function generateReportId(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RSBS-${stamp}-${random}`;
}

// A visual "digital signature" block: the signer's name rendered in a
// signature-like italic font, plus a generated authentication stamp.
// This is not cryptographic — it mirrors the letterhead-style authenticity
// mark already used on the payment receipt, applied consistently to reports.
export function drawSignatureBlock(
  doc: jsPDF,
  { name, role }: { name: string; role: string }
): void {
  const pageHeight = doc.internal.pageSize.getHeight();
  const y = pageHeight - 38;

  doc.setDrawColor(200, 200, 200);
  doc.line(14, y - 12, 90, y - 12);

  doc.setFont('times', 'italic');
  doc.setFontSize(20);
  doc.text(name, 14, y - 2);

  doc.setDrawColor(0, 0, 0);
  doc.line(14, y + 2, 90, y + 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(role, 14, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Digitally generated & authenticated by RSBS · Report ID: ${generateReportId()}`,
    14,
    y + 14
  );
  doc.setTextColor(0, 0, 0);
}
