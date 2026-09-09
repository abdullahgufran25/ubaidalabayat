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

  // Handle same-page link clicks (e.g. clicking brand logo or 'Home' when already at '/')
  useEffect(() => {
    const handleSamePageClick = (e) => {
      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Skip external or non-http links
      if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
      if (href.startsWith('http') && !href.startsWith(window.location.origin)) return;

      try {
        const targetUrl = new URL(anchor.href, window.location.origin);
        // If clicking a link pointing to the same pathname and search (and no hash)
        if (
          targetUrl.pathname === window.location.pathname &&
          (targetUrl.search === window.location.search || !targetUrl.search) &&
          !targetUrl.hash
        ) {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
          });
        }
      } catch (err) {
        // Ignore URL parse failures
      }
    };

    document.addEventListener('click', handleSamePageClick, { capture: true });
    return () => document.removeEventListener('click', handleSamePageClick, { capture: true });
  }, []);

  return null;
};

export default ScrollToTop;
