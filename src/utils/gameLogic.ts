import { Setter } from "solid-js";

export function checkWin(
  newBoard: (string | null)[],
  currentEmoji: string,
  setWinningCells: Setter<number[]>
) {
  // Check rows
  for (let i = 0; i < 25; i += 5) {
    if (newBoard.slice(i, i + 5).every((cell) => cell === currentEmoji)) {
      setWinningCells([i, i + 1, i + 2, i + 3, i + 4]);
      return true;
    }
  }

  // Check columns
  for (let i = 0; i < 5; i++) {
    if ([0, 1, 2, 3, 4].every((j) => newBoard[i + j * 5] === currentEmoji)) {
      setWinningCells([i, i + 5, i + 10, i + 15, i + 20]);
      return true;
    }
  }

  // Check diagonals
  if ([0, 6, 12, 18, 24].every((i) => newBoard[i] === currentEmoji)) {
    setWinningCells([0, 6, 12, 18, 24]);
    return true;
  }
  if ([4, 8, 12, 16, 20].every((i) => newBoard[i] === currentEmoji)) {
    setWinningCells([4, 8, 12, 16, 20]);
    return true;
  }

  return false;
}
