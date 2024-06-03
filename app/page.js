import Login from "@/components/auth/Login";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <video
        src="assets/logos/bg/smolder_bg.mp4"
        autoPlay
        loop
        muted
        className="absolute -z-10 opacity-20"
      />
      <Login />
    </main>
  );
}
