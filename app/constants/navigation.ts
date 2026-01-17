import { type Tab } from "~/components/ui/Tabs";

export const MAIN_TABS: Tab[] = [
  { id: "all", label: "All", to: "/" },
  { id: "recommended", label: "Recommended For Me", to: "/recommended" },
];

export const SORT_OPTIONS = [{ value: "date", label: "Date" }];
