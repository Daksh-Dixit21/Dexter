"use client";

import { useMotionValue, useSpring, useTransform } from "framer-motion";
import { type RefObject, useEffect, useState } from "react";

export function useMascotAnimations(
  containerRef?: RefObject<HTMLDivElement | null>,
) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [blinkState, setBlinkState] = useState(false);

  const eyeX = useSpring(useTransform(mouseX, [-300, 300], [-3, 3]), {
    stiffness: 150,
    damping: 15,
  });
  const eyeY = useSpring(useTransform(mouseY, [-300, 300], [-2, 2]), {
    stiffness: 150,
    damping: 15,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mascotX = rect.left + rect.width / 2;
        const mascotY = rect.top + rect.height / 2;
        mouseX.set(e.clientX - mascotX);
        mouseY.set(e.clientY - mascotY);
      } else {
        mouseX.set(e.clientX - window.innerWidth / 2);
        mouseY.set(e.clientY - window.innerHeight / 2);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, containerRef]);

  useEffect(() => {
    const blink = () => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 150);
    };

    const scheduleNextBlink = () => {
      const delay = 3000 + Math.random() * 3000;
      return setTimeout(blink, delay);
    };

    let timeout = scheduleNextBlink();
    const interval = setInterval(() => {
      clearTimeout(timeout);
      timeout = scheduleNextBlink();
    }, 6000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return { eyeX, eyeY, blinkState };
}
