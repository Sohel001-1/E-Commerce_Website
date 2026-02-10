export const easings = {
  smooth: [0.25, 0.46, 0.45, 0.94],
  spring: [0.43, 0.13, 0.23, 0.96],
  bounce: [0.68, -0.55, 0.27, 1.55],
};

export const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easings.smooth } },
};

export const fadeDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easings.smooth } },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easings.smooth } },
};

export const slideLeft = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: easings.smooth } },
};

export const slideRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: easings.smooth } },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easings.smooth } },
};

export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easings.smooth },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.25, ease: easings.smooth },
  },
};

export const heroTextVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15 + 0.2,
      duration: 0.7,
      ease: easings.smooth,
    },
  }),
};

export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -4, transition: { duration: 0.3, ease: easings.smooth } },
};

export const buttonTap = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 400, damping: 17 },
};

export const shimmerKeyframes = {
  backgroundPosition: ["200% 0", "-200% 0"],
};

export const shimmerTransition = {
  duration: 3,
  repeat: Infinity,
  ease: "linear",
};
