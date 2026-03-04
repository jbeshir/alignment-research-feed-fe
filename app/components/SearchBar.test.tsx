import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "./SearchBar";

describe("SearchBar", () => {
  it("renders input with default placeholder", () => {
    render(<SearchBar value="" onChange={() => {}} onSearch={() => {}} />);
    expect(
      screen.getByPlaceholderText(/Search for alignment/)
    ).toBeInTheDocument();
  });

  it("renders custom placeholder", () => {
    render(
      <SearchBar
        value=""
        onChange={() => {}}
        onSearch={() => {}}
        placeholder="Custom placeholder"
      />
    );
    expect(
      screen.getByPlaceholderText("Custom placeholder")
    ).toBeInTheDocument();
  });

  it("Enter key fires onChange and onSearch", async () => {
    const onChange = vi.fn();
    const onSearch = vi.fn();
    render(<SearchBar value="" onChange={onChange} onSearch={onSearch} />);

    const input = screen.getByLabelText("Search articles");
    await userEvent.type(input, "test query{Enter}");

    expect(onChange).toHaveBeenCalledWith("test query");
    expect(onSearch).toHaveBeenCalledWith("test query");
  });

  it("search button click fires onChange and onSearch", async () => {
    const onChange = vi.fn();
    const onSearch = vi.fn();
    render(<SearchBar value="" onChange={onChange} onSearch={onSearch} />);

    const input = screen.getByLabelText("Search articles");
    await userEvent.type(input, "click test");

    const searchBtn = screen.getByLabelText("Submit search");
    await userEvent.click(searchBtn);

    expect(onChange).toHaveBeenCalledWith("click test");
    expect(onSearch).toHaveBeenCalledWith("click test");
  });
});
