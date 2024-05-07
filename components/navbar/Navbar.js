import Link from "next/link";
import Logout from "../auth/Logout";
import Image from "next/image";

const Navbar = () => {
  return (
    <div className="bg-zinc-900">
      <div className="max-w-[1440px] mx-auto px-5 py-4 flex justify-between">
        <div>
          <Link href="/dashboard">
            <Image
              src="/assets/logos/dummylab-logo.svg"
              width={100}
              height={80}
              alt="DummyLab Logo"
            />
          </Link>
        </div>
        <div>
          <Logout />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
