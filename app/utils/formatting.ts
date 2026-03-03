/**
 * Format a date string for display.
 * @param dateString - ISO date string, parseable date format, or null
 * @returns Formatted date like "Jan 15, 2024", or null if input is null
 */
export function formatPublishedDate(dateString: string | null): string | null {
  if (dateString === null) {
    return null;
  }
  try {
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}
