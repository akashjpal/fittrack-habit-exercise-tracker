import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StreakCard from "./StreakCard";

describe("StreakCard", () => {
    it("renders the current streak number", () => {
        render(<StreakCard currentStreak={5} />);
        expect(screen.getByText("5")).toBeInTheDocument();
    });

    it.each([
        [0, "Start your journey today!"],
        [1, "Keep going!"],
        [6, "Keep going!"],
        [7, "Great momentum!"],
        [29, "Great momentum!"],
        [30, "You're unstoppable!"],
        [99, "You're unstoppable!"],
        [100, "Legendary streak!"],
        [365, "Legendary streak!"],
    ])("shows the right message at the boundary for a streak of %i", (streak, message) => {
        render(<StreakCard currentStreak={streak} />);
        expect(screen.getByText(message)).toBeInTheDocument();
    });
});
