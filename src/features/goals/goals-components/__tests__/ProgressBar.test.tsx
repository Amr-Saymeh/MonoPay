import { describe, expect, it } from "@jest/globals";
import { render } from "@testing-library/react-native";
import { View } from "react-native";

import { ProgressBar } from "../ProgressBar";

describe("ProgressBar", () => {
  it("shows the progress percentage", () => {
    const { getByText } = render(<ProgressBar progress={0.42} />);

    expect(getByText("42%")).toBeTruthy();
  });

  it("clamps progress below 0 to 0%", () => {
    const { getByText } = render(<ProgressBar progress={-0.2} />);

    expect(getByText("0%")).toBeTruthy();
  });

  it("clamps progress above 1 to 100%", () => {
    const { getByText } = render(<ProgressBar progress={1.7} />);

    expect(getByText("100%")).toBeTruthy();
  });

  it("uses the clamped width and custom color for the fill", () => {
    const { UNSAFE_getAllByType } = render(
      <ProgressBar progress={0.75} color="#22C55E" />,
    );
    const fill = UNSAFE_getAllByType(View).find((view) => {
      const style = view.props.style;
      return (
        Array.isArray(style) &&
        style.some((entry) => entry?.width === "75%")
      );
    });

    expect(fill).toBeTruthy();
    expect(fill?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: "75%",
          backgroundColor: "#22C55E",
        }),
      ]),
    );
  });
});
