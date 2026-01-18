import { type Tab } from "~/components/ui/Tabs";

export const MAIN_TABS: Tab[] = [
  { id: "all", label: "All", to: "/" },
  { id: "recommended", label: "Recommended For Me", to: "/recommended" },
  { id: "unreviewed", label: "Unreviewed", to: "/unreviewed" },
  { id: "liked", label: "Liked", to: "/liked" },
  { id: "disliked", label: "Disliked", to: "/disliked" },
];
