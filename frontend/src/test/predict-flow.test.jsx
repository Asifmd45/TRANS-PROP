import { describe, it, expect } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Predict from "@/pages/Predict";

describe("predict flow smoke", () => {
  it("enables predict action and renders results", async () => {
    render(
      <MemoryRouter>
        <Predict />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/Describe the crystalline material/i);
    const predictButton = screen.getByRole("button", { name: /Predict Properties/i });

    expect(predictButton).toBeDisabled();

    fireEvent.change(input, { target: { value: "NaCl in rock salt structure" } });
    expect(predictButton).not.toBeDisabled();

    fireEvent.click(predictButton);
    expect(predictButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText(/Predicted Properties/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
