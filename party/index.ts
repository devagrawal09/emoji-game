import type * as Party from "partykit/server";
import {
  PlayerJoinedMessage,
  PlayerLeftMessage,
  PlayerMovedMessage,
} from "~/routes/[gameId]";

interface Player {
  id: string;
  emoji: string;
}

interface GameState {
  players: Map<string, Player>;
  board: (string | null)[];
}

type GameMessage = PlayerJoinedMessage | PlayerLeftMessage | PlayerMovedMessage;

export default class Server implements Party.Server {
  private state: GameState;

  constructor(readonly room: Party.Room) {
    this.state = {
      players: new Map(),
      board: Array(25).fill(null),
    };
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Send current board state to new player
    conn.send(
      JSON.stringify({
        type: "gameState",
        board: this.state.board,
        players: Array.from(this.state.players.values()),
      })
    );
  }

  onMessage(message: string, sender: Party.Connection) {
    try {
      const parsedMessage = JSON.parse(message) as GameMessage;
      console.log(parsedMessage);

      switch (parsedMessage.type) {
        case "playerJoined":
          this.handlePlayerJoin(sender.id, parsedMessage);
          break;
        case "playerLeft":
          this.handlePlayerLeft(sender.id, parsedMessage);
          break;
        case "playerMoved":
          this.handlePlayerMove(parsedMessage);
          break;
      }
    } catch (e) {
      console.error("Error processing message:", e);
    }
  }
  handlePlayerLeft(id: string, parsedMessage: PlayerLeftMessage) {
    this.state.players.delete(id);
    this.room.broadcast(
      JSON.stringify({
        type: "playerLeft",
        playerId: parsedMessage.playerId,
      })
    );
  }

  onClose(conn: Party.Connection) {
    if (this.state.players.has(conn.id)) {
      const player = this.state.players.get(conn.id)!;
      this.state.players.delete(conn.id);

      // Notify other players about departure
      this.room.broadcast(
        JSON.stringify({
          type: "playerLeft",
          playerId: player.id,
        }),
        [conn.id]
      );
    }
  }

  private handlePlayerJoin(connectionId: string, message: PlayerJoinedMessage) {
    // Store player info
    this.state.players.set(connectionId, {
      id: message.playerId,
      emoji: message.emoji,
    });

    // Notify other players about new player
    this.room.broadcast(
      JSON.stringify({
        type: "playerJoined",
        playerId: message.playerId,
        emoji: message.emoji,
      })
    );
  }

  private handlePlayerMove(
    message: Extract<GameMessage, { type: "playerMoved" }>
  ) {
    // Update board state
    if (this.isValidMove(message.index)) {
      this.state.board[message.index] = message.emoji;

      // Check for win
      const winningCells = this.checkWin(message.emoji);

      // Broadcast move to all players
      this.room.broadcast(
        JSON.stringify({
          type: "playerMoved",
          playerId: message.playerId,
          emoji: message.emoji,
          index: message.index,
          winningCells,
        })
      );
    }
  }

  private checkWin(emoji: string): number[] | null {
    // Check rows
    for (let i = 0; i < 25; i += 5) {
      if (this.state.board.slice(i, i + 5).every((cell) => cell === emoji)) {
        return [i, i + 1, i + 2, i + 3, i + 4];
      }
    }

    // Check columns
    for (let i = 0; i < 5; i++) {
      if ([0, 1, 2, 3, 4].every((j) => this.state.board[i + j * 5] === emoji)) {
        return [i, i + 5, i + 10, i + 15, i + 20];
      }
    }

    // Check diagonals
    if ([0, 6, 12, 18, 24].every((i) => this.state.board[i] === emoji)) {
      return [0, 6, 12, 18, 24];
    }
    if ([4, 8, 12, 16, 20].every((i) => this.state.board[i] === emoji)) {
      return [4, 8, 12, 16, 20];
    }

    return null;
  }

  private isValidMove(index: number): boolean {
    return (
      index >= 0 &&
      index < this.state.board.length &&
      this.state.board[index] === null
    );
  }
}

Server satisfies Party.Worker;
