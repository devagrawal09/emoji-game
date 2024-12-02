import { useParams } from "@solidjs/router";
import { createSignal, onMount, Show } from "solid-js";
import QRCode from "qrcode";

export default function Home() {
  const params = useParams<{ gameId: string }>();
  const gameUrl = () => `${window.location.origin}/${params.gameId}`;
  const [showCopied, setShowCopied] = createSignal(false);
  const [qrCodeUrl, setQrCodeUrl] = createSignal("");
  const [winningCells, setWinningCells] = createSignal<number[]>([]);

  onMount(async () => {
    try {
      const url = await QRCode.toDataURL(gameUrl());
      setQrCodeUrl(url);
    } catch (err) {
      console.error("Error generating QR code:", err);
    }
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(gameUrl());
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const emojis = ["🎈", "🌟", "🎨", "🎮", "🎪"];
  const COOLDOWN_SECONDS = 1;
  const CIRCLE_WIDTH = 32;

  const [currentEmoji] = createSignal(
    emojis[Math.floor(Math.random() * emojis.length)]
  );
  const [board, setBoard] = createSignal(Array(25).fill(null));
  const [cooldown, setCooldown] = createSignal(0);
  const [hasWon, setHasWon] = createSignal(false);

  const checkWin = (newBoard: (string | null)[]) => {
    // Check rows
    for (let i = 0; i < 25; i += 5) {
      if (newBoard.slice(i, i + 5).every((cell) => cell === currentEmoji())) {
        setWinningCells([i, i + 1, i + 2, i + 3, i + 4]);
        return true;
      }
    }

    // Check columns
    for (let i = 0; i < 5; i++) {
      if (
        [0, 1, 2, 3, 4].every((j) => newBoard[i + j * 5] === currentEmoji())
      ) {
        setWinningCells([i, i + 5, i + 10, i + 15, i + 20]);
        return true;
      }
    }

    // Check diagonals
    if ([0, 6, 12, 18, 24].every((i) => newBoard[i] === currentEmoji())) {
      setWinningCells([0, 6, 12, 18, 24]);
      return true;
    }
    if ([4, 8, 12, 16, 20].every((i) => newBoard[i] === currentEmoji())) {
      setWinningCells([4, 8, 12, 16, 20]);
      return true;
    }

    return false;
  };

  const handleCellClick = (index: number) => {
    if (board()[index] === null && cooldown() === 0 && !hasWon()) {
      const newBoard = [...board()];
      newBoard[index] = currentEmoji();
      setBoard(newBoard);

      if (checkWin(newBoard)) {
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

  const rProportional = () =>
    cooldown() === 0 ? 1 : (cooldown() - 1) / COOLDOWN_SECONDS;

  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      {hasWon() ? (
        <div class="mb-4 text-2xl text-green-600 font-bold">
          🎉 Congratulations! You won! 🎉
        </div>
      ) : (
        <div class="mb-4 flex items-center justify-center gap-4">
          <div class="relative w-16 h-16">
            <svg class="transform -rotate-90 w-16 h-16">
              {/* Background circle */}
              <circle
                cx={`${CIRCLE_WIDTH}`}
                cy={`${CIRCLE_WIDTH}`}
                r={`${CIRCLE_WIDTH - 4}`}
                stroke-width="8"
                stroke="#e5e7eb"
                fill="none"
              />
              {/* Timer circle */}
              <circle
                cx={`${CIRCLE_WIDTH}`}
                cy={`${CIRCLE_WIDTH}`}
                r={`${CIRCLE_WIDTH - 4}`}
                stroke-width="8"
                stroke="#0ea5e9"
                fill="none"
                stroke-dasharray={`${2 * Math.PI * (CIRCLE_WIDTH - 4)}`}
                stroke-dashoffset={`${
                  2 * Math.PI * (CIRCLE_WIDTH - 4) * rProportional()
                }`}
                style={
                  cooldown() === 0
                    ? {}
                    : { transition: "stroke-dashoffset 1s linear" }
                }
              />
            </svg>
            <span class="absolute inset-0 flex items-center justify-center">
              {cooldown() || currentEmoji()}
            </span>
          </div>
        </div>
      )}

      <div class="inline-grid grid-cols-5 gap-2">
        {board().map((cell, index) => (
          <button
            class={`w-16 h-16 bg-gray-100 text-2xl flex items-center justify-center
              ${
                cooldown() === 0 && !hasWon()
                  ? "hover:bg-gray-200"
                  : "cursor-not-allowed"
              }
              ${board()[index] === null ? "" : "cursor-not-allowed"}
              ${hasWon() ? "opacity-75" : ""}
              ${
                winningCells().includes(index)
                  ? "bg-green-200 !opacity-100"
                  : ""
              }`}
            onClick={() => handleCellClick(index)}
          >
            {cell}
          </button>
        ))}
      </div>

      <div class="mt-8">
        <div class="flex flex-col items-center gap-4">
          <div class="flex items-center gap-2">
            {gameUrl()}
            <button
              onClick={handleCopy}
              class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {showCopied() ? "Copied!" : "Copy"}
            </button>
          </div>
          <Show when={qrCodeUrl()}>
            <img src={qrCodeUrl()} alt="QR Code" class="w-32 h-32" />
            <p class="text-sm text-gray-500">Scan to join the game</p>
          </Show>
        </div>
      </div>
    </main>
  );
}
