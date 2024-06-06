import { useEffect } from "react";
import { userStore } from "@/store/userStore";

const Navbar = () => {
  const { user, getUser } = userStore();

  useEffect(() => {
    getUser(); // Fetch user data when the component mounts
  }, []);

  return (
    <div className="w-60 bg-neutral-900 p-4 h-screen">
      <div className="flex items-center justify-center gap-1">
        DUMMY
        <span className="bg-cyan-400 text-neutral-950 px-1 rounded-sm font-bold">
          LAB
        </span>
      </div>
      {user && (
        <div>
          <p>User Data:</p>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Navbar;
