import { useState, useEffect, useMemo } from 'react';

type BreakpointKey = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface Breakpoints {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const defaultBreakpoints: Breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

export function useResponsiveLayout(customBreakpoints?: Partial<Breakpoints>) {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };
  const [windowWidth, setWindowWidth] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 150); // debounce
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const currentBreakpoint = useMemo((): BreakpointKey => {
    if (windowWidth >= breakpoints['2xl']) return '2xl';
    if (windowWidth >= breakpoints.xl) return 'xl';
    if (windowWidth >= breakpoints.lg) return 'lg';
    if (windowWidth >= breakpoints.md) return 'md';
    return 'sm';
  }, [windowWidth, breakpoints]);

  const isMobile = useMemo(() => windowWidth < breakpoints.md, [windowWidth, breakpoints.md]);
  const isTablet = useMemo(() => 
    windowWidth >= breakpoints.md && windowWidth < breakpoints.lg, 
    [windowWidth, breakpoints.md, breakpoints.lg]
  );
  const isDesktop = useMemo(() => windowWidth >= breakpoints.lg, [windowWidth, breakpoints.lg]);

  const getGridColumns = useMemo(() => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return windowWidth >= breakpoints.xl ? 3 : 2;
  }, [isMobile, isTablet, windowWidth, breakpoints.xl]);

  const getCardSize = useMemo(() => {
    if (isMobile) return 'full';
    if (isTablet) return 'medium';
    return 'compact';
  }, [isMobile, isTablet]);

  const shouldUseModal = useMemo(() => isMobile, [isMobile]);
  const shouldUseDrawer = useMemo(() => isTablet, [isTablet]);

  return {
    windowWidth,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    getGridColumns,
    getCardSize,
    shouldUseModal,
    shouldUseDrawer,
    breakpoints
  };
}