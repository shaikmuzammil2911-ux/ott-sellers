import { useEffect } from 'react';

export const useScrollReveal = () => {
  useEffect(() => {
    const handleScrollReveal = () => {
      const reveals = document.querySelectorAll('.reveal-on-scroll');
      const windowHeight = window.innerHeight;

      reveals.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const revealPoint = 120;

        if (elementTop < windowHeight - revealPoint) {
          element.classList.add('is-revealed');
        }
      });
    };

    window.addEventListener('scroll', handleScrollReveal);
    // Trigger on load
    handleScrollReveal();

    return () => window.removeEventListener('scroll', handleScrollReveal);
  }, []);
};
