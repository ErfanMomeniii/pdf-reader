import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

// Configure PDF.js worker for v3.x
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).href;

export interface PDFDocument {
  proxy: PDFDocumentProxy;
  numPages: number;
  filePath: string;
}

export interface PDFLoadError {
  type: 'corrupt' | 'invalid' | 'not-found' | 'unknown';
  message: string;
}

export type PDFLoadResult =
  | { success: true; document: PDFDocument }
  | { success: false; error: PDFLoadError };

export async function loadPDF(filePath: string): Promise<PDFLoadResult> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      return {
        success: false,
        error: {
          type: 'not-found',
          message: `File not found: ${filePath}`
        }
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });

    const proxy = await loadingTask.promise;

    return {
      success: true,
      document: {
        proxy,
        numPages: proxy.numPages,
        filePath
      }
    };
  } catch (err) {
    const error = err as Error;

    if (error.message?.includes('Invalid PDF')) {
      return {
        success: false,
        error: {
          type: 'invalid',
          message: 'The file is not a valid PDF document'
        }
      };
    }

    if (error.message?.includes('password')) {
      return {
        success: false,
        error: {
          type: 'corrupt',
          message: 'The PDF is password protected'
        }
      };
    }

    return {
      success: false,
      error: {
        type: 'corrupt',
        message: 'Unable to open PDF file. The file may be corrupted.'
      }
    };
  }
}

export async function loadPDFFromBytes(bytes: Uint8Array, filePath: string): Promise<PDFLoadResult> {
  try {
    // Verify we have actual data
    if (!bytes || bytes.length === 0) {
      return {
        success: false,
        error: {
          type: 'invalid',
          message: 'The file appears to be empty'
        }
      };
    }

    // Check PDF header
    const header = new TextDecoder().decode(bytes.slice(0, 8));
    if (!header.startsWith('%PDF')) {
      return {
        success: false,
        error: {
          type: 'invalid',
          message: 'The file is not a valid PDF document'
        }
      };
    }

    const loadingTask = pdfjsLib.getDocument({ data: bytes });
    const proxy = await loadingTask.promise;

    return {
      success: true,
      document: {
        proxy,
        numPages: proxy.numPages,
        filePath
      }
    };
  } catch (err) {
    const error = err as Error;
    console.error('PDF load error:', error);

    if (error.message?.includes('Invalid PDF')) {
      return {
        success: false,
        error: {
          type: 'invalid',
          message: 'The file is not a valid PDF document'
        }
      };
    }

    if (error.message?.includes('password')) {
      return {
        success: false,
        error: {
          type: 'corrupt',
          message: 'The PDF is password protected'
        }
      };
    }

    // Show actual error for debugging
    return {
      success: false,
      error: {
        type: 'corrupt',
        message: `Unable to open PDF: ${error.message || 'Unknown error'}`
      }
    };
  }
}

export async function getPage(document: PDFDocument, pageNumber: number): Promise<PDFPageProxy> {
  if (pageNumber < 1 || pageNumber > document.numPages) {
    throw new Error(`Page ${pageNumber} is out of range (1-${document.numPages})`);
  }
  return document.proxy.getPage(pageNumber);
}

export function closePDF(document: PDFDocument): void {
  document.proxy.destroy();
}
