/**
 * A purchased session may open the question runner only after identity confirmation.
 * That confirmation is the status transition to `in_progress`.
 */
export function canStartTest(status: string): boolean {
  return status === "in_progress";
}

/** Answer writes and final submit use the same confirmed state. */
export function canWriteTest(status: string): boolean {
  return status === "in_progress";
}

export function initialQuestionIndex(
  itemIds: number[],
  isComplete: (itemId: number) => boolean,
): number {
  const index = itemIds.findIndex((itemId) => !isComplete(itemId));
  if (index === -1) return Math.max(0, itemIds.length - 1);
  return index;
}
