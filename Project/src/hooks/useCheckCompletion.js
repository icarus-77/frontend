import { useMemo } from 'react';
import { COLUMNS } from '../store/boardStore';

/**
 * useCheckCompletion
 *
 * Watches the normalized board columns state and returns whether the board
 * is in a "complete" state — all tasks harvested, none remaining in raw/ripening.
 *
 * @param {Object} columns - The columns slice from board state: { raw, ripening, harvested }
 * @returns {{ isComplete: boolean, harvestedCount: number, totalCount: number }}
 */
export function useCheckCompletion(columns) {
  return useMemo(() => {
    const rawCount = columns[COLUMNS.RAW]?.length ?? 0;
    const ripeningCount = columns[COLUMNS.RIPENING]?.length ?? 0;
    const harvestedCount = columns[COLUMNS.HARVESTED]?.length ?? 0;
    const totalCount = rawCount + ripeningCount + harvestedCount;

    // Must have at least one harvested task and zero remaining in other columns
    const isComplete =
      totalCount > 0 && rawCount === 0 && ripeningCount === 0;

    return { isComplete, harvestedCount, totalCount };
  }, [columns]);
}
