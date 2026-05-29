import { useState } from 'react';

export function useCarouselTransition(delay = 200) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transition = (fn: () => void) => {
    setIsTransitioning(true);
    setTimeout(() => {
      fn();
      setTimeout(() => setIsTransitioning(false), 50);
    }, delay);
  };

  return { isTransitioning, transition };
}
