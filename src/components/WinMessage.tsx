interface WinMessageProps {
  hasWon: boolean;
}

export function WinMessage(props: WinMessageProps) {
  return (
    <>
      {props.hasWon && (
        <div class="mb-4 text-2xl text-green-600 font-bold">
          🎉 Congratulations! You won! 🎉
        </div>
      )}
    </>
  );
}
