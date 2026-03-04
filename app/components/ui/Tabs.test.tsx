import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRemixStub } from "@remix-run/testing";
import { Tabs, type Tab } from "./Tabs";

const testTabs: Tab[] = [
  { id: "all", label: "All", to: "/" },
  { id: "liked", label: "Liked", to: "/liked" },
  { id: "disliked", label: "Disliked", to: "/disliked" },
];

function renderTabs(
  activeTab: string,
  onBeforeNavigate?: (id: string) => boolean
) {
  const props = onBeforeNavigate
    ? { tabs: testTabs, activeTab, onBeforeNavigate }
    : { tabs: testTabs, activeTab };
  const Stub = createRemixStub([
    {
      path: "/",
      Component: () => <Tabs {...props} />,
    },
  ]);
  return render(<Stub />);
}

describe("Tabs", () => {
  it("renders all tab labels", async () => {
    renderTabs("all");
    for (const tab of testTabs) {
      expect(await screen.findByText(tab.label)).toBeInTheDocument();
    }
  });

  it('active tab has aria-current="page"', async () => {
    renderTabs("liked");
    const likedLink = await screen.findByText("Liked");
    expect(likedLink).toHaveAttribute("aria-current", "page");
  });

  it("inactive tabs do not have aria-current", async () => {
    renderTabs("liked");
    const allLink = await screen.findByText("All");
    expect(allLink).not.toHaveAttribute("aria-current");
  });

  it("onBeforeNavigate returning false prevents default", async () => {
    const onBeforeNavigate = vi.fn().mockReturnValue(false);
    renderTabs("all", onBeforeNavigate);

    const likedLink = await screen.findByText("Liked");
    await userEvent.click(likedLink);

    expect(onBeforeNavigate).toHaveBeenCalledWith("liked");
  });
});
