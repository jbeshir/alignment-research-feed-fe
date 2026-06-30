import React from "react";
import {
  type IconProps,
  IconSearch,
  IconThumbUp,
  IconThumbUpFilled,
  IconThumbDown,
  IconThumbDownFilled,
  IconCircleCheck,
  IconPlayerPlay,
  IconExternalLink,
  IconSettings,
  IconTrash,
  IconClipboard,
  IconDownload,
  IconArrowRight,
  IconRss,
  IconFileText,
  IconList,
  IconLayoutGrid,
  IconMessage,
  IconSchool,
  IconMicrophone,
  IconCode,
  IconInbox,
  IconAlertTriangle,
  IconLock,
  IconSparkles,
} from "@tabler/icons-react";

export type { IconProps };

function icon(Inner: React.ComponentType<IconProps>) {
  return function Wrapped({ className, ...props }: IconProps) {
    return (
      <Inner
        className={["shrink-0", className].filter(Boolean).join(" ")}
        {...props}
      />
    );
  };
}

export const SearchIcon = icon(IconSearch);
export const ThumbsUpIcon = icon(IconThumbUp);
export const ThumbsUpFilledIcon = icon(IconThumbUpFilled);
export const ThumbsDownIcon = icon(IconThumbDown);
export const ThumbsDownFilledIcon = icon(IconThumbDownFilled);
export const CheckCircleIcon = icon(IconCircleCheck);
export const PlayIcon = icon(IconPlayerPlay);
export const ExternalLinkIcon = icon(IconExternalLink);
export const SettingsIcon = icon(IconSettings);
export const TrashIcon = icon(IconTrash);
export const ClipboardIcon = icon(IconClipboard);
export const DownloadIcon = icon(IconDownload);
export const ArrowRightIcon = icon(IconArrowRight);
export const RssIcon = icon(IconRss);
export const DocumentIcon = icon(IconFileText);
export const ListIcon = icon(IconList);
export const GridIcon = icon(IconLayoutGrid);
export const ChatBubbleIcon = icon(IconMessage);
export const AcademicCapIcon = icon(IconSchool);
export const MicrophoneIcon = icon(IconMicrophone);
export const CodeBracketIcon = icon(IconCode);
export const InboxIcon = icon(IconInbox);
export const ExclamationTriangleIcon = icon(IconAlertTriangle);
export const LockClosedIcon = icon(IconLock);
export const SparklesIcon = icon(IconSparkles);
