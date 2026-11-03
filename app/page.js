import Login from "@/components/auth/Login";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-zinc-800 to-zinc-950 px-6">
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-10 py-10">
        <div className="w-full text-center">
          <h1 className="text-6xl">
            DUMMY<span className="text-cyan-400">LAB</span>
          </h1>
          <p className="text-zinc-400 mt-2">League of Legends Coaching Dashboard</p>
          <p className="text-zinc-400 text-sm mt-6 max-w-md mx-auto">
            Manage your teams, schedule trainings and scrims with player availability, and track stats from
            match history.
          </p>
        </div>
        <div className="w-full">
          <Login />
        </div>
      </div>
      <Footer className="pb-6" />
    </main>
  );
}
