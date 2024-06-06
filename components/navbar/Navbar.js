import useUserStore from "@/store/useStore";

const Navbar = () => {
  const user = useUserStore((data) => data.user);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      {/* Display more user info here */}
    </div>
  );
};

export default Navbar;
