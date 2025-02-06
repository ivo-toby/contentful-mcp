/* eslint-disable @typescript-eslint/no-explicit-any */

export interface SummarizeOptions {
  maxItems?: number
  indent?: number
  showTotal?: boolean
  remainingMessage?: string
}

export const summarizeData = (data: any, options: SummarizeOptions = {}): any => {
  const { maxItems = 10, remainingMessage = "To see more items, please ask me to retrieve them." } =
    options

  // Handle Contentful-style responses with items and total
  if (data && typeof data === "object" && "items" in data && "total" in data) {
    const items = data.items
    const total = data.total

    if (items.length <= maxItems) {
      return data
    }

    return {
      items: items.slice(0, maxItems),
      total: total,
      showing: maxItems,
      remaining: total - maxItems,
      message: remainingMessage,
    }
  }

  // Handle plain arrays
  if (Array.isArray(data)) {
    if (data.length <= maxItems) {
      return data
    }

    return {
      items: data.slice(0, maxItems),
      total: data.length,
      showing: maxItems,
      remaining: data.length - maxItems,
      message: remainingMessage,
    }
  }

  // Return non-array data as-is
  return data
}
