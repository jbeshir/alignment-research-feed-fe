import type React from "react";
import {
  PlayIcon,
  ChatBubbleIcon,
  AcademicCapIcon,
  MicrophoneIcon,
  DocumentIcon,
} from "~/components/Icons";

type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

const VIDEO_SOURCES = new Set(["youtube"]);

const FORUM_SOURCES = new Set(["lesswrong", "alignmentforum", "eaforum"]);

const ACADEMIC_SOURCES = new Set(["arxiv", "distill"]);

const PODCAST_SOURCES = new Set(["axrp"]);

export function isVideoSource(source: string): boolean {
  return VIDEO_SOURCES.has(source.toLowerCase());
}

export function getSourcePlaceholderIcon(source: string): IconComponent {
  const s = source.toLowerCase();
  if (VIDEO_SOURCES.has(s)) return PlayIcon;
  if (FORUM_SOURCES.has(s)) return ChatBubbleIcon;
  if (ACADEMIC_SOURCES.has(s)) return AcademicCapIcon;
  if (PODCAST_SOURCES.has(s)) return MicrophoneIcon;
  return DocumentIcon;
}
