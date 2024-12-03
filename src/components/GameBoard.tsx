import { For } from "solid-js";

interface GameBoardProps {
  board: (string | null)[];
  cooldown: number;
  hasWon: boolean;
  winningCells: number[];
  handleCellClick: (index: number) => void;
}

export function GameBoard(props: GameBoardProps) {
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
            onClick={() => props.handleCellClick(index())}
          >
            {cell}
          </button>
        )}
      </For>
    </div>
  );
}
