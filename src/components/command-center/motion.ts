export const COMMAND_EASE = [0.16, 1, 0.3, 1] as const;

export const panelReveal = {
  initial: { opacity: 0, y: 14, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.55, ease: COMMAND_EASE },
};
