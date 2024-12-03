import { useParams } from "@solidjs/router";
import {
  createEffect,
  createResource,
  createSignal,
  onCleanup,
  Show,
} from "solid-js";
import QRCode from "qrcode";
import { GameBoard } from "../components/GameBoard";
import { GameTimer } from "../components/GameTimer";
import { ShareGame } from "../components/ShareGame";
import { WinMessage } from "../components/WinMessage";
import PartySocket from "partysocket";
import { checkWin } from "../utils/gameLogic";

const COOLDOWN_SECONDS = 1;

export default function GameRoom() {
  const params = useParams<{ gameId: string }>();
  const gameUrl = () => `${window.location.origin}/${params.gameId}`;
  const [showCopied, setShowCopied] = createSignal(false);
  const [winningCells, setWinningCells] = createSignal<number[]>([]);
  const [board, setBoard] = createSignal(Array(25).fill(null));
  const [cooldown, setCooldown] = createSignal(0);
  const [hasWon, setHasWon] = createSignal(false);
  const [qrCodeUrl] = createResource(gameUrl, (url) => QRCode.toDataURL(url), {
    initialValue: ``,
  });

  const ws = new PartySocket({
    host: "localhost:1999",
    query: async () => ({}),
  });
  createEffect(() => {
    ws.updateProperties({ room: params.gameId });
  });
  function messageHandler(message: MessageEvent) {}
  ws.addEventListener("message", messageHandler);
  onCleanup(() => {
    ws.close();
  });

  // Game state management
  const emojis = ["🎈", "🌟", "🎨", "🎮", "🎪"];
  const [currentEmoji] = createSignal(
    emojis[Math.floor(Math.random() * emojis.length)]
  );

  const handleCellClick = (index: number) => {
    if (board()[index] === null && cooldown() === 0 && !hasWon()) {
      const newBoard = [...board()];
      newBoard[index] = currentEmoji();
      setBoard(newBoard);

      if (checkWin(newBoard, currentEmoji(), setWinningCells)) {
        setHasWon(true);
        return;
      }

      // Start cooldown
      setCooldown(COOLDOWN_SECONDS);
      const timer = setInterval(() => {
        setCooldown((prev) => {
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
    <main class="text-center mx-auto text-gray-700 p-4">
      <Show
        when={hasWon()}
        fallback={
          <GameTimer
            cooldown={cooldown()}
            currentEmoji={currentEmoji()}
            hasWon={hasWon()}
          />
        }
      >
        <WinMessage />
      </Show>

      <GameBoard
        board={board()}
        handleCellClick={handleCellClick}
        cooldown={cooldown()}
        hasWon={hasWon()}
        winningCells={winningCells()}
      />

      <ShareGame
        gameUrl={gameUrl()}
        showCopied={showCopied()}
        setShowCopied={setShowCopied}
        qrCodeUrl={qrCodeUrl()}
      />
    </main>
  );
}
