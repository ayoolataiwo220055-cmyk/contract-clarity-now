import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook that scrolls to the top of the page on route change
 */
export const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [pathname]);
};

export default useScrollToTop;
