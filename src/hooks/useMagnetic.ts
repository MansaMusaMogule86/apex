"use client";

import { useRef } from "react";

export function useMagnetic(strength = 18) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const bounds = node.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;

    node.style.transform = `translate3d(${(x / bounds.width) * strength}px, ${(y / bounds.height) * strength}px, 0)`;
  };

  const onMouseLeave = () => {
    const node = ref.current;
    if (!node) {
      return;
    }

    node.style.transform = "translate3d(0px, 0px, 0px)";
  };

  return {
    ref,
    onMouseMove,
    onMouseLeave,
  };
}
