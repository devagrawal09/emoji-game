interface GameTimerProps {
  cooldown: number;
  currentEmoji: string;
  hasWon: boolean;
}

export function GameTimer(props: GameTimerProps) {
  const CIRCLE_WIDTH = 32;
  const COOLDOWN_SECONDS = 1;

  const rProportional = () =>
    props.cooldown === 0 ? 1 : (props.cooldown - 1) / COOLDOWN_SECONDS;

  return (
    <div class="mb-4 flex items-center justify-center gap-4">
      <div class="relative w-16 h-16">
        <svg class="transform -rotate-90 w-16 h-16">
          <circle
            cx={`${CIRCLE_WIDTH}`}
            cy={`${CIRCLE_WIDTH}`}
            r={`${CIRCLE_WIDTH - 4}`}
            stroke-width="8"
            stroke="#e5e7eb"
            fill="none"
          />
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
              props.cooldown === 0
                ? {}
                : { transition: "stroke-dashoffset 1s linear" }
            }
          />
        </svg>
        <span class="absolute inset-0 flex items-center justify-center">
          {props.cooldown || props.currentEmoji}
        </span>
      </div>
    </div>
  );
}
