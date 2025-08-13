import { useState, useEffect } from 'react';

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    
    // Add the event listener
    media.addEventListener('change', listener);
    
    // Cleanup function to remove the listener
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};