import { useParams } from "@solidjs/router";
import {
  createEffect,
  createResource,
  createSignal,
  onCleanup,
  Show,
  For,
} from "solid-js";
import QRCode from "qrcode";
import { GameBoard } from "../components/GameBoard";
import { GameTimer } from "../components/GameTimer";
import { ShareGame } from "../components/ShareGame";
import { WinMessage } from "../components/WinMessage";
import PartySocket from "partysocket";

const COOLDOWN_SECONDS = 1;

export type PlayerJoinedMessage = {
  type: "playerJoined";
  playerId: string;
  emoji: string;
};

export type PlayerLeftMessage = {
  type: "playerLeft";
  playerId: string;
};

export type PlayerMovedMessage = {
  type: "playerMoved";
  playerId: string;
  emoji: string;
  index: number;
  winningCells?: number[];
};

export type GameStateMessage = {
  type: "gameState";
  board: (string | null)[];
  players: { id: string; emoji: string }[];
};

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
  const [wsReady, setWsReady] = createSignal(false);
  ws.addEventListener("open", () => setWsReady(true));

  // Add new signal for players
  const [players, setPlayers] = createSignal<{ id: string; emoji: string }[]>(
    []
  );

  function messageHandler(event: MessageEvent) {
    const message = JSON.parse(event.data) as
      | PlayerJoinedMessage
      | PlayerLeftMessage
      | PlayerMovedMessage
      | GameStateMessage;

    console.log(message);

    switch (message.type) {
      case "playerJoined":
        setPlayers((prev) => [
          ...prev,
          { id: message.playerId, emoji: message.emoji },
        ]);
        break;
      case "playerLeft":
        setPlayers((prev) =>
          prev.filter((player) => player.id !== message.playerId)
        );
        break;
      case "playerMoved":
        setBoard((prev) => {
          const newBoard = [...prev];
          newBoard[message.index] = message.emoji;

          // Check for winning move
          if (message.winningCells) {
            setWinningCells(message.winningCells);
            setHasWon(true);
          }

          return newBoard;
        });
        break;
      case "gameState":
        setBoard(message.board);
        setPlayers(message.players);
        break;
    }
  }
  ws.addEventListener("message", messageHandler);
  onCleanup(() => {
    ws.close();
  });

  // Game state management
  const getUniqueEmoji = (currentPlayers: { id: string; emoji: string }[]) => {
    const availableEmojis = ["🎈", "🌟", "🎨", "🎮", "🎪"];
    const usedEmojis = new Set(currentPlayers.map((player) => player.emoji));
    const unusedEmojis = availableEmojis.filter(
      (emoji) => !usedEmojis.has(emoji)
    );

    // If all emojis are taken, add more options
    if (unusedEmojis.length === 0) {
      return ["🎭", "🎲", "🎯", "🎸", "🎹"][Math.floor(Math.random() * 5)];
    }

    return unusedEmojis[Math.floor(Math.random() * unusedEmojis.length)];
  };

  const [currentEmoji, setCurrentEmoji] = createSignal("");

  // Add new signals for player management
  const playerId = crypto.randomUUID();

  // Add current player to players list on mount
  createEffect(() => {
    if (wsReady()) {
      // Only set emoji and join if we haven't already (check if currentEmoji is empty)
      if (!currentEmoji()) {
        const uniqueEmoji = getUniqueEmoji(players());
        setCurrentEmoji(uniqueEmoji);

        const joinMessage: PlayerJoinedMessage = {
          type: "playerJoined",
          playerId,
          emoji: uniqueEmoji,
        };
        ws.send(JSON.stringify(joinMessage));
      }
    }
  });

  createEffect(() => {
    console.log(`players`, players());
  });

  // Modify cell click handler to send moves through WebSocket
  const handleCellClick = (index: number) => {
    if (board()[index] === null && cooldown() === 0 && !hasWon()) {
      const moveMessage: PlayerMovedMessage = {
        type: "playerMoved",
        playerId,
        emoji: currentEmoji(),
        index,
      };
      ws.send(JSON.stringify(moveMessage));

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
      {/* Add player list display */}
      <div class="mb-4">
        <h2 class="text-lg font-bold mb-2">Players in Game:</h2>
        <div class="flex justify-center gap-2">
          <For each={players()}>
            {(player) => (
              <ul class="flex flex-col items-center gap-1">
                <li class="text-2xl">{player.emoji}</li>
                <li class="text-sm">
                  {player.id === playerId ? (
                    <strong>You</strong>
                  ) : (
                    player.id.slice(0, 4)
                  )}
                </li>
              </ul>
            )}
          </For>
        </div>
      </div>

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
