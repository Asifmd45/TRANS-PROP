import { describe, it, expect } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

function Probe() {
  const { ref, className } = useScrollReveal({ direction: "up", once: false });
  return <div ref={ref} data-testid="probe" className={className} />;
}

describe("scroll reveal smoke", () => {
  it("toggles visibility classes when intersection changes", () => {
    render(<Probe />);

    const node = screen.getByTestId("probe");
    expect(node.className).toContain("opacity-0");

    act(() => {
      globalThis.triggerAllIntersections(true);
    });
    expect(node.className).toContain("opacity-100");

    act(() => {
      globalThis.triggerAllIntersections(false);
    });
    expect(node.className).toContain("opacity-0");
  });
});
