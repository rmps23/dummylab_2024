import { usePathname } from "next/navigation";
import Link from "next/link";

const NavbarLink = ({ link, icon, text }) => {
  const path = usePathname();

  return (
    <Link
      href={link}
      className={`flex py-2 px-4 rounded-md gap-3 items-center ${
        path == link
          ? `text-cyan-400 bg-neutral-900 border-cyan-400 hover:bg-neutral-800 hover:text-neutral-300`
          : `text-neutral-400 bg-neutral-950 border-neutral-950 hover:bg-neutral-800 hover:text-neutral-300`
      }`}
    >
      <p className="text-md">{icon}</p>
      <p className="text-sm pt-[1px]">{text}</p>
    </Link>
  );
};

export default NavbarLink;
