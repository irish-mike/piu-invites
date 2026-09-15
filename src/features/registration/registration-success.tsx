"use client";

import { motion, type TargetAndTransition } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactElement } from "react";
import { createPortal } from "react-dom";

import styles from "./registration-success.module.css";

const duration = 2.6;
const imageLoadTimeoutMs = 5_000;
const blackoutAnimation = {
  opacity: [1, 1, 0],
  transition: {
    duration,
    times: [0, 0.8, 1],
    ease: "linear",
  },
} satisfies TargetAndTransition;

const scareAnimation = {
  opacity: [0, 0, 0.96, 0.96, 0.96, 0, 0, 0.96, 0.96, 0, 0],
  x: [-8, -8, 4, 0, 0, -5, -5, 3, 3, 0, 0],
  scale: [1.12, 1.12, 1.04, 1, 1.06, 1.06, 1.06, 1.1, 1.1, 1.1, 1.1],
  filter: [
    "sepia(0) saturate(1) hue-rotate(0deg)",
    "sepia(0) saturate(1) hue-rotate(0deg)",
    "sepia(1) saturate(9) hue-rotate(-45deg)",
    "sepia(1) saturate(9) hue-rotate(-45deg)",
  ],
  transition: {
    duration,
    times: [0, 0.06, 0.065, 0.15, 0.59, 0.595, 0.66, 0.665, 0.7, 0.705, 1],
    ease: "linear",
    filter: { duration, times: [0, 0.4, 0.52, 1], ease: "linear" },
  },
} satisfies TargetAndTransition;

const flashAnimation = {
  opacity: [0, 0.85, 0.85, 0, 0, 0.85, 0.85, 0, 0],
  transition: { duration, times: [0, 0.002, 0.02, 0.022, 0.6, 0.602, 0.62, 0.622, 1], ease: "linear" },
} satisfies TargetAndTransition;

const headingAnimation = {
  opacity: [0, 0, 1],
  transition: { duration, times: [0, 0.8, 1], ease: "linear" },
} satisfies TargetAndTransition;

type RegistrationSuccessProps = {
  isAnimating: boolean;
  contentHeight: number;
  onAnimationComplete: () => void;
};

export function RegistrationSuccess({ isAnimating, contentHeight, onAnimationComplete }: RegistrationSuccessProps): ReactElement {
  const successRef = useRef<HTMLElement>(null);
  const [isImageReady, setIsImageReady] = useState(false);
  const shouldPlay = isAnimating && isImageReady;
  const textOpacity = { opacity: isAnimating ? 0 : 1 };

  useEffect(() => {
    if (!isAnimating) successRef.current?.focus({ preventScroll: true });
  }, [isAnimating]);

  useEffect(() => {
    if (!isAnimating) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const skipAnimation = (): void => {
      if (preference.matches) onAnimationComplete();
    };
    preference.addEventListener("change", skipAnimation);
    skipAnimation();
    return () => preference.removeEventListener("change", skipAnimation);
  }, [isAnimating, onAnimationComplete]);

  useEffect(() => {
    if (!isAnimating || isImageReady) return;
    const timeout = window.setTimeout(onAnimationComplete, imageLoadTimeoutMs);
    return () => window.clearTimeout(timeout);
  }, [isAnimating, isImageReady, onAnimationComplete]);

  return (
    <>
      <section
        ref={successRef}
        aria-labelledby="registration-success-heading"
        aria-hidden={isAnimating}
        inert={isAnimating}
        tabIndex={isAnimating ? undefined : -1}
        className={styles.success}
        style={{ minHeight: contentHeight }}
      >
        <motion.h2
          id="registration-success-heading"
          className={`font-display ${styles.heading}`}
          initial={isAnimating ? { opacity: 0 } : false}
          animate={shouldPlay ? headingAnimation : textOpacity}
        >
          YOU’RE ON THE LIST
        </motion.h2>
      </section>
      {isAnimating && createPortal(
        <motion.div
          aria-hidden="true"
          className={styles.blackout}
          initial={{ opacity: 0 }}
          animate={isImageReady ? blackoutAnimation : { opacity: 0.95 }}
          onAnimationComplete={isImageReady ? onAnimationComplete : undefined}
        >
          <motion.div
            className={styles.scare}
            initial={{ opacity: 0 }}
            animate={isImageReady ? scareAnimation : { opacity: 0 }}
          >
            <Image
              src="/images/jump-scare.webp"
              alt=""
              fill
              sizes="100vw"
              unoptimized
              loading="eager"
              className={styles.scareImage}
              onLoad={() => setIsImageReady(true)}
              onError={onAnimationComplete}
            />
          </motion.div>
          <motion.div
            className={styles.flash}
            initial={{ opacity: 0 }}
            animate={isImageReady ? flashAnimation : { opacity: 0 }}
          />
        </motion.div>,
        document.body,
      )}
    </>
  );
}
