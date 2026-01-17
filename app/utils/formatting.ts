/**
 * Format a date string for display.
 * @param dateString - ISO date string or parseable date format
 * @returns Formatted date like "Jan 15, 2024"
 */
export function formatPublishedDate(dateString: string): string {
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
