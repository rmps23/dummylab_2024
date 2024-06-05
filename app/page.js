import Login from "@/components/auth/Login";

export default function Home() {
  return (
    <main className="flex h-screen items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950 px-20">
      <div className="w-full text-center">
        <p className="text-6xl">
          DUMMY<span className="text-cyan-400">LAB</span>
        </p>
        <p className="text-zinc-400 pl-20">
          League of Legends Coaching Dashboard
        </p>
      </div>
      <div className="w-full pr-20">
        <Login />
      </div>
    </main>
  );
}
