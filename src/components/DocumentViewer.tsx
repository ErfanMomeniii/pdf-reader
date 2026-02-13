import { useEffect, useRef, useState, useCallback } from 'react';
import type { PDFPageProxy } from 'pdfjs-dist';
import { useDocumentStore } from '../stores/documentStore';
import { pageCache } from '../services/pageCache';
import { PageRenderer } from './PageRenderer';

const PAGE_GAP = 16;
const RENDER_BUFFER = 2;

interface PageInfo {
  pageNumber: number;
  top: number;
  height: number;
}

export function DocumentViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { document, currentPage, zoom, zoomMode, setCurrentPage, setScrollPosition } = useDocumentStore();

  const [pages, setPages] = useState<Map<number, PDFPageProxy>>(new Map());
  const [pageInfos, setPageInfos] = useState<PageInfo[]>([]);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const [containerWidth, setContainerWidth] = useState(0);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);
  const pageInfosRef = useRef<PageInfo[]>([]);
  const currentPageRef = useRef(currentPage);
  const isUserScrollingRef = useRef(false);

  useEffect(() => {
    if (!document) {
      setPages(new Map());
      setPageInfos([]);
      return;
    }

    pageCache.setDocument(document);

    const loadInitialPages = async () => {
      const infos: PageInfo[] = [];
      let currentTop = 0;

      for (let i = 1; i <= document.numPages; i++) {
        const page = await pageCache.getPage(i);
        if (page) {
          const viewport = page.getViewport({ scale: 1.0 });
          const scaledHeight = viewport.height * zoom;
          infos.push({
            pageNumber: i,
            top: currentTop,
            height: scaledHeight,
          });
          currentTop += scaledHeight + PAGE_GAP;
        }
      }

      setPageInfos(infos);
      pageInfosRef.current = infos;
    };

    loadInitialPages();
  }, [document, zoom]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const updateVisibleRange = useCallback(() => {
    const container = containerRef.current;
    if (!container || pageInfos.length === 0) return;

    const scrollTop = container.scrollTop;
    const viewportHeight = container.clientHeight;

    let startIdx = 0;
    let endIdx = pageInfos.length - 1;

    for (let i = 0; i < pageInfos.length; i++) {
      if (pageInfos[i].top + pageInfos[i].height >= scrollTop) {
        startIdx = Math.max(0, i - RENDER_BUFFER);
        break;
      }
    }

    for (let i = startIdx; i < pageInfos.length; i++) {
      if (pageInfos[i].top > scrollTop + viewportHeight) {
        endIdx = Math.min(pageInfos.length - 1, i + RENDER_BUFFER);
        break;
      }
    }

    setVisibleRange({ start: startIdx, end: endIdx });

    // Only update currentPage from scroll if not programmatically scrolling
    if (!isScrollingRef.current) {
      // Find the page with the most visibility in the viewport
      let maxVisiblePage = 1;
      let maxVisibleArea = 0;

      for (let i = 0; i < pageInfos.length; i++) {
        const info = pageInfos[i];
        const pageTop = info.top;
        const pageBottom = info.top + info.height;

        // Calculate how much of this page is visible
        const visibleTop = Math.max(pageTop, scrollTop);
        const visibleBottom = Math.min(pageBottom, scrollTop + viewportHeight);
        const visibleArea = Math.max(0, visibleBottom - visibleTop);

        if (visibleArea > maxVisibleArea) {
          maxVisibleArea = visibleArea;
          maxVisiblePage = info.pageNumber;
        }
      }

      if (currentPageRef.current !== maxVisiblePage) {
        // Mark as user scrolling so we don't auto-scroll to the page
        isUserScrollingRef.current = true;
        currentPageRef.current = maxVisiblePage;
        setCurrentPage(maxVisiblePage);
      }
    }

    setScrollPosition({ x: container.scrollLeft, y: scrollTop });
  }, [pageInfos, setCurrentPage, setScrollPosition]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      updateVisibleRange();
    };

    container.addEventListener('scroll', handleScroll);

    // Only call on initial mount, not on every updateVisibleRange change
    return () => container.removeEventListener('scroll', handleScroll);
  }, [updateVisibleRange]);

  // Initialize visible range once when pageInfos are ready
  useEffect(() => {
    if (pageInfos.length > 0) {
      updateVisibleRange();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageInfos.length]);

  useEffect(() => {
    const loadVisiblePages = async () => {
      if (!document) return;

      const newPages = new Map(pages);
      let hasChanges = false;

      for (let i = visibleRange.start; i <= visibleRange.end; i++) {
        const pageNumber = pageInfos[i]?.pageNumber;
        if (pageNumber && !newPages.has(pageNumber)) {
          const page = await pageCache.getPage(pageNumber);
          if (page) {
            newPages.set(pageNumber, page);
            hasChanges = true;
          }
        }
      }

      if (hasChanges) {
        setPages(newPages);
      }

      if (pageInfos[visibleRange.start]) {
        pageCache.prefetchAround(pageInfos[visibleRange.start].pageNumber);
      }
    };

    loadVisiblePages();
  }, [document, visibleRange, pageInfos, pages]);

  const scrollToPage = useCallback((pageNumber: number) => {
    const container = containerRef.current;
    const pageInfo = pageInfosRef.current.find((p) => p.pageNumber === pageNumber);

    if (!container || !pageInfo) return;

    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Prevent scroll handler from resetting currentPage
    isScrollingRef.current = true;

    // Scroll to show the page at the top with a small margin
    container.scrollTop = pageInfo.top;

    // Reset the flag after a short delay
    scrollTimeoutRef.current = window.setTimeout(() => {
      isScrollingRef.current = false;
      scrollTimeoutRef.current = null;
    }, 100);
  }, []);

  // Scroll to page when currentPage changes (only from button clicks, not from scrolling)
  useEffect(() => {
    currentPageRef.current = currentPage;

    // Don't scroll if the page change came from user scrolling
    if (isUserScrollingRef.current) {
      isUserScrollingRef.current = false;
      return;
    }

    scrollToPage(currentPage);
  }, [currentPage, scrollToPage]);

  const effectiveScale = useCallback(() => {
    if (zoomMode === 'fit-width' && containerWidth > 0 && pageInfos.length > 0) {
      return (containerWidth - 40) / (pageInfos[0]?.height / zoom || 1);
    }
    return zoom;
  }, [zoom, zoomMode, containerWidth, pageInfos]);

  if (!document) {
    return null;
  }

  const totalHeight = pageInfos.length > 0
    ? pageInfos[pageInfos.length - 1].top + pageInfos[pageInfos.length - 1].height + PAGE_GAP
    : 0;

  return (
    <div
      ref={containerRef}
      className="document-viewer"
      style={{
        overflow: 'auto',
        height: '100%',
        position: 'relative',
      }}
    >
      <div
        className="document-content"
        style={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        {pageInfos.slice(visibleRange.start, visibleRange.end + 1).map((info) => {
          const page = pages.get(info.pageNumber);
          return (
            <div
              key={info.pageNumber}
              className="page-wrapper"
              style={{
                position: 'absolute',
                top: info.top,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <PageRenderer page={page || null} scale={effectiveScale()} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
