import { useEffect, useRef, useCallback } from 'react';
import { useDocumentStore } from '../stores/documentStore';

interface PinchState {
  active: boolean;
  initialDistance: number;
  initialZoom: number;
}

export function usePinchZoom(elementRef: React.RefObject<HTMLElement | null>) {
  const { zoom, setZoom } = useDocumentStore();
  const pinchStateRef = useRef<PinchState>({
    active: false,
    initialDistance: 0,
    initialZoom: 1.0,
  });

  const getDistance = useCallback((touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      pinchStateRef.current = {
        active: true,
        initialDistance: getDistance(e.touches),
        initialZoom: zoom,
      };
    }
  }, [zoom, getDistance]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!pinchStateRef.current.active || e.touches.length !== 2) return;

    e.preventDefault();

    const currentDistance = getDistance(e.touches);
    const scale = currentDistance / pinchStateRef.current.initialDistance;
    const newZoom = pinchStateRef.current.initialZoom * scale;

    setZoom(newZoom);
  }, [getDistance, setZoom]);

  const handleTouchEnd = useCallback(() => {
    pinchStateRef.current.active = false;
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.01;
      const newZoom = zoom * (1 + delta);
      setZoom(newZoom);
    }
  }, [zoom, setZoom]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('wheel', handleWheel);
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel]);
}
