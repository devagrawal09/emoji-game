import { Accessor, Setter, Show } from "solid-js";

interface ShareGameProps {
  gameUrl: string;
  showCopied: boolean;
  setShowCopied: Setter<boolean>;
  qrCodeUrl: string;
}

export function ShareGame(props: ShareGameProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(props.gameUrl);
    props.setShowCopied(true);
    setTimeout(() => props.setShowCopied(false), 2000);
  };

  return (
    <div class="mt-8">
      <div class="flex flex-col items-center gap-4">
        <div class="flex items-center gap-2">
          {props.gameUrl}
          <button
            onClick={handleCopy}
            class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {props.showCopied ? "Copied!" : "Copy"}
          </button>
        </div>
        <Show when={props.qrCodeUrl}>
          <img src={props.qrCodeUrl} alt="QR Code" class="w-32 h-32" />
          <p class="text-sm text-gray-500">Scan to join the game</p>
        </Show>
      </div>
    </div>
  );
}
