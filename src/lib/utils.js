import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatEventDate(event, options = {}) {
  if (!event || !event.date) return '';
  const dateObj = new Date(event.date);
  
  let formattedDate;
  if (options.customFormat) {
    formattedDate = dateObj.toLocaleDateString(options.locale || 'en-US', options.customFormat);
  } else {
    // Default to standard local date string if no options provided
    formattedDate = dateObj.toLocaleDateString();
  }

  // Preserve existing formatting and uppercase logic if requested
  if (options.uppercase) {
    formattedDate = formattedDate.toUpperCase();
  }

  // Add the (Tentative) indicator safely
  if (event.dateStatus === 'tentative') {
    return `${formattedDate} (Tentative)`;
  }
  
  return formattedDate;
}
