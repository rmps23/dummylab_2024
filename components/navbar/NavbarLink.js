import { usePathname } from "next/navigation";
import Link from "next/link";

const NavbarLink = ({ link, icon, text }) => {
  const path = usePathname();

  return (
    <Link
      href={link}
      className={`rounded-md w-full py-1 px-4 flex items-center gap-3 ${
        path == link ? `bg-teal-300 text-neutral-950` : `bg-neutral-900`
      }`}
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
};

export default NavbarLink;
