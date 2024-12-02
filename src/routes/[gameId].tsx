import { useParams } from "@solidjs/router";
import { createResource, createSignal, Show } from "solid-js";
import QRCode from "qrcode";
import { GameBoard } from "../components/GameBoard";
import { GameTimer } from "../components/GameTimer";
import { ShareGame } from "../components/ShareGame";
import { WinMessage } from "../components/WinMessage";

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

  // Game state management
  const emojis = ["🎈", "🌟", "🎨", "🎮", "🎪"];
  const [currentEmoji] = createSignal(
    emojis[Math.floor(Math.random() * emojis.length)]
  );

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
        setBoard={setBoard}
        cooldown={cooldown()}
        setCooldown={setCooldown}
        currentEmoji={currentEmoji()}
        hasWon={hasWon()}
        setHasWon={setHasWon}
        winningCells={winningCells()}
        setWinningCells={setWinningCells}
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
