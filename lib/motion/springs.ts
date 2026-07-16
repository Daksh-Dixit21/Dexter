export const springSubtle = { type: "spring" as const, stiffness: 400, damping: 30, mass: 0.8 };
export const springStandard = { type: "spring" as const, stiffness: 300, damping: 25, mass: 1 };
export const springPlayful = { type: "spring" as const, stiffness: 260, damping: 20, mass: 1 };
export const springCalm = { type: "spring" as const, stiffness: 100, damping: 15, mass: 2 };

export const easeOut = [0.23, 1, 0.32, 1];
export const easeIn = [0.55, 0, 0.68, 0.53];
export const easeInOut = [0.45, 0, 0.55, 1];
export const easeBounce = [0.34, 1.56, 0.64, 1];
export const easeBreath = [0.37, 0, 0.63, 1];
