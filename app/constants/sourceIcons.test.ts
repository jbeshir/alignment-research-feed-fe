import { describe, it, expect } from "vitest";
import {
  isVideoSource,
  getSourcePlaceholderIcon,
} from "./sourceIcons";
import {
  PlayIcon,
  ChatBubbleIcon,
  AcademicCapIcon,
  MicrophoneIcon,
  DocumentIcon,
} from "~/components/layout/Icons";

describe("isVideoSource", () => {
  it("returns true for youtube", () => {
    expect(isVideoSource("youtube")).toBe(true);
  });

  it("returns false for non-video sources", () => {
    expect(isVideoSource("arxiv")).toBe(false);
    expect(isVideoSource("lesswrong")).toBe(false);
    expect(isVideoSource("axrp")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(isVideoSource("YouTube")).toBe(true);
    expect(isVideoSource("YOUTUBE")).toBe(true);
  });
});

describe("getSourcePlaceholderIcon", () => {
  it("returns PlayIcon for video sources", () => {
    expect(getSourcePlaceholderIcon("youtube")).toBe(PlayIcon);
  });

  it("returns ChatBubbleIcon for forum sources", () => {
    expect(getSourcePlaceholderIcon("lesswrong")).toBe(ChatBubbleIcon);
    expect(getSourcePlaceholderIcon("alignmentforum")).toBe(ChatBubbleIcon);
    expect(getSourcePlaceholderIcon("eaforum")).toBe(ChatBubbleIcon);
  });

  it("returns AcademicCapIcon for academic sources", () => {
    expect(getSourcePlaceholderIcon("arxiv")).toBe(AcademicCapIcon);
    expect(getSourcePlaceholderIcon("distill")).toBe(AcademicCapIcon);
  });

  it("returns MicrophoneIcon for podcast sources", () => {
    expect(getSourcePlaceholderIcon("axrp")).toBe(MicrophoneIcon);
  });

  it("returns DocumentIcon for unknown sources", () => {
    expect(getSourcePlaceholderIcon("unknown")).toBe(DocumentIcon);
    expect(getSourcePlaceholderIcon("")).toBe(DocumentIcon);
  });
});
