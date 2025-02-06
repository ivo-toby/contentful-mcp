/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SummarizeOptions {
  maxItems?: number
  indent?: number
  showTotal?: boolean
  remainingMessage?: string
}

export const summarizeData = (data: any[], options: SummarizeOptions = {}): any => {
  const { maxItems = 10, remainingMessage = "To see more items, please ask me to retrieve them." } =
    options

  if (!Array.isArray(data)) {
    return data
  }

  if (data.length <= maxItems) {
    return data
  }

  const summary = data.slice(0, maxItems)
  const remaining = data.length - maxItems

  return {
    items: summary,
    total: data.length,
    showing: maxItems,
    remaining: remaining,
    message: remainingMessage,
  }
}
