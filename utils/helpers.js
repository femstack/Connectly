/**
 * Convert a full name into initials.
 * Example: "John Doe" -> "JD"
 */
function getInitials(name) {
  if (!name || typeof name !== "string") {
    return "?";
  }

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

/**
 * Format a date as a readable hour.
 * Example: "10:45 AM"
 */
function formatTime(date) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format a date as a readable date and time.
 * Example: "Oct 20, 10:45 AM"
 */
function formatDateTime(date) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format a date as relative time.
 * Example: "5 minutes ago"
 */
function timeAgo(date) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const seconds = Math.floor((Date.now() - parsedDate.getTime()) / 1000);

  if (seconds < 0) {
    return formatTime(parsedDate);
  }

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return formatDateTime(parsedDate);
}

module.exports = {
  getInitials,
  formatTime,
  formatDateTime,
  timeAgo,
};
