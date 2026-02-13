import type { PDFPageProxy } from 'pdfjs-dist';
import type { PDFDocument } from './pdfService';

interface CachedPage {
  page: PDFPageProxy;
  lastAccessed: number;
}

export class PageCache {
  private cache: Map<string, CachedPage> = new Map();
  private maxSize: number;
  private currentDocument: PDFDocument | null = null;

  constructor(maxSize: number = 10) {
    this.maxSize = maxSize;
  }

  private getCacheKey(pageNumber: number): string {
    return `page-${pageNumber}`;
  }

  setDocument(document: PDFDocument | null): void {
    if (this.currentDocument !== document) {
      this.clear();
      this.currentDocument = document;

      // Dynamically adjust cache size based on document size
      if (document) {
        // For larger documents, keep more pages cached
        this.maxSize = Math.min(20, Math.max(10, Math.ceil(document.numPages * 0.1)));
      }
    }
  }

  async getPage(pageNumber: number): Promise<PDFPageProxy | null> {
    if (!this.currentDocument) return null;

    const key = this.getCacheKey(pageNumber);
    const cached = this.cache.get(key);

    if (cached) {
      cached.lastAccessed = Date.now();
      return cached.page;
    }

    if (pageNumber < 1 || pageNumber > this.currentDocument.numPages) {
      return null;
    }

    const page = await this.currentDocument.proxy.getPage(pageNumber);
    this.set(pageNumber, page);
    return page;
  }

  private set(pageNumber: number, page: PDFPageProxy): void {
    const key = this.getCacheKey(pageNumber);

    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      page,
      lastAccessed: Date.now(),
    });
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, value] of this.cache.entries()) {
      if (value.lastAccessed < oldestTime) {
        oldestTime = value.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  prefetch(pageNumbers: number[]): void {
    for (const pageNum of pageNumbers) {
      const key = this.getCacheKey(pageNum);
      if (!this.cache.has(key)) {
        this.getPage(pageNum);
      }
    }
  }

  prefetchAround(currentPage: number, range: number = 3): void {
    if (!this.currentDocument) return;

    const pagesToPrefetch: number[] = [];
    // Prioritize pages ahead of current page (likely scroll direction)
    for (let i = 1; i <= range; i++) {
      if (currentPage + i <= this.currentDocument.numPages) {
        pagesToPrefetch.push(currentPage + i);
      }
    }
    // Then pages behind
    for (let i = 1; i <= range - 1; i++) {
      if (currentPage - i >= 1) {
        pagesToPrefetch.push(currentPage - i);
      }
    }
    this.prefetch(pagesToPrefetch);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

export const pageCache = new PageCache(10);
