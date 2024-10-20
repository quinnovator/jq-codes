'use client';

import { useEffect, useState } from 'react';
import Particles from '@/components/ui/particles';

export function BackgroundParticles() {
  const [color, setColor] = useState('#ffffff');

  useEffect(() => {
    function updateColor() {
      const isDark = document.documentElement.classList.contains('dark');
      setColor(isDark ? '#ffffff' : '#000000');
    }

    updateColor();

    const observer = new MutationObserver(updateColor);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Particles
      className="fixed inset-0 -z-10"
      quantity={100}
      ease={80}
      color={color}
      refresh
    />
  );
}
