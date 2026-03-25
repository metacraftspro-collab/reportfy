import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

async function renderElementCanvas(element: HTMLElement) {
  const sourceElement =
    element.classList.contains('print-area') && element.firstElementChild instanceof HTMLElement
      ? element.firstElementChild
      : element;

  const canvas = await html2canvas(sourceElement, {
    scale: 4,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  return canvas;
}

function buildPdfFromCanvas(canvas: HTMLCanvasElement) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const canvasPageHeight = Math.floor((canvas.width * pdfHeight) / pdfWidth);

  let renderedHeight = 0;
  let pageIndex = 0;

  while (renderedHeight < canvas.height) {
    const sliceHeight = Math.min(canvasPageHeight, canvas.height - renderedHeight);
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;

    const context = pageCanvas.getContext('2d');
    context?.drawImage(
      canvas,
      0,
      renderedHeight,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight,
    );

    const image = pageCanvas.toDataURL('image/png');
    const imageHeight = (sliceHeight * pdfWidth) / canvas.width;

    if (pageIndex > 0) {
      pdf.addPage();
    }

    pdf.addImage(image, 'PNG', 0, 0, pdfWidth, imageHeight, undefined, 'FAST');

    renderedHeight += sliceHeight;
    pageIndex += 1;
  }

  return pdf;
}

export async function exportToPDF(element: HTMLElement, filename: string) {
  const canvas = await renderElementCanvas(element);
  const pdf = buildPdfFromCanvas(canvas);
  pdf.save(`${filename}.pdf`);
}

export async function exportToJPG(element: HTMLElement, filename: string) {
  const canvas = await renderElementCanvas(element);

  const link = document.createElement('a');
  link.download = `${filename}.jpg`;
  link.href = canvas.toDataURL('image/jpeg', 1.0);
  link.click();
}

export async function printElement(element: HTMLElement) {
  const canvas = await renderElementCanvas(element);
  const pdf = buildPdfFromCanvas(canvas);
  const printablePdf = pdf as jsPDF & { autoPrint?: () => void };
  printablePdf.autoPrint?.();

  const blob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  const iframe = document.createElement('iframe');

  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.src = blobUrl;

  const cleanup = () => {
    iframe.remove();
    URL.revokeObjectURL(blobUrl);
  };

  iframe.onload = () => {
    window.setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        window.setTimeout(cleanup, 60000);
      }
    }, 300);
  };

  document.body.appendChild(iframe);
}
