import { useNavigate } from "@solidjs/router";

export default function Home() {
  const navigate = useNavigate();

  const createGameRoom = () => {
    // Generate a random room ID (you can adjust the length/complexity as needed)
    const roomId = Math.random().toString(36).substring(2, 8);
    navigate(`/${roomId}`);
  };

  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <div class="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 class="text-3xl font-bold mb-8">Welcome to the Game</h1>
        <button
          onClick={createGameRoom}
          class="px-6 py-3 bg-blue-500 text-white rounded-lg text-xl hover:bg-blue-600 transition-colors"
        >
          Create Game Room
        </button>
      </div>
    </main>
  );
}
