import React, { useState, useEffect } from 'react';

export default function useTruncateCheck(elementRef: React.RefObject<HTMLElement>) {
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const checkTruncation = () => {
      requestAnimationFrame(() => {
        if (!element) return;
        const isOverflowing =
          element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
        setIsTruncated(isOverflowing);
      });
    };

    checkTruncation();

    const resizeObserver = new ResizeObserver(checkTruncation);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [elementRef]);

  return isTruncated;
}
