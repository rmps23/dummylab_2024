export default function PageHeader({ icon: Icon, title, children }) {
  return (
    <div className="flex flex-wrap items-center gap-4 w-full pt-4 px-6 pb-4 border-b border-zinc-800 bg-cyan-700">
      <div className="flex items-center gap-4">
        <Icon className="bg-zinc-900 p-2 text-4xl rounded-md" />
        <h1 className="text-lg">{title}</h1>
      </div>
      {children}
    </div>
  );
}
