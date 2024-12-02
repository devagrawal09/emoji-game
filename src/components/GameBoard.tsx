import { For, Setter } from "solid-js";
import { checkWin } from "../utils/gameLogic";

interface GameBoardProps {
  board: (string | null)[];
  setBoard: Setter<(string | null)[]>;
  cooldown: number;
  setCooldown: Setter<number>;
  currentEmoji: string;
  hasWon: boolean;
  setHasWon: Setter<boolean>;
  winningCells: number[];
  setWinningCells: Setter<number[]>;
}

export function GameBoard(props: GameBoardProps) {
  const COOLDOWN_SECONDS = 1;

  const handleCellClick = (index: number) => {
    if (props.board[index] === null && props.cooldown === 0 && !props.hasWon) {
      const newBoard = [...props.board];
      newBoard[index] = props.currentEmoji;
      props.setBoard(newBoard);

      if (checkWin(newBoard, props.currentEmoji, props.setWinningCells)) {
        props.setHasWon(true);
        return;
      }

      // Start cooldown
      props.setCooldown(COOLDOWN_SECONDS);
      const timer = setInterval(() => {
        props.setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  return (
    <div class="inline-grid grid-cols-5 gap-2">
      <For each={props.board}>
        {(cell, index) => (
          <button
            class={`w-16 h-16 bg-gray-100 text-2xl flex items-center justify-center
              ${
                props.cooldown === 0 && !props.hasWon
                  ? "hover:bg-gray-200"
                  : "cursor-not-allowed"
              }
              ${cell === null ? "" : "cursor-not-allowed"}
              ${props.hasWon ? "opacity-75" : ""}
              ${
                props.winningCells.includes(index())
                  ? "bg-green-200 !opacity-100"
                  : ""
              }`}
            onClick={() => handleCellClick(index())}
          >
            {cell}
          </button>
        )}
      </For>
    </div>
  );
}
