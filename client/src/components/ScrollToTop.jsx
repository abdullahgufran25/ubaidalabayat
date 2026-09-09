import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures every page navigation smoothly scrolls the viewport to the top (0, 0),
 * matching luxury eCommerce standards (Farfetch, Zara, Net-a-Porter).
 */
const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // Disable native jumpy browser scroll restoration so React Router controls it
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // If an anchor hash was targeted (e.g. #reviews, #specifications)
    if (hash) {
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Perform smooth animated scroll to top
    const scrollToTop = () => {
      try {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      } catch (e) {
        window.scrollTo(0, 0);
      }
    };

    // Immediate smooth scroll execution
    scrollToTop();

    // Short delayed check to ensure dynamic route content/images don't push scroll position down
    const timeoutId = setTimeout(scrollToTop, 50);

    return () => clearTimeout(timeoutId);
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;
