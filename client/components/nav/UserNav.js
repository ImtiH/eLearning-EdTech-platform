import Link from "next/link";
import { useEffect, useState } from "react";

//used in userRoute.js 
const UserNav = () => {
  const [current, setCurrent] = useState("");

    useEffect(() => {
      process.browser && setCurrent(window.location.pathname);
    }, [process.browser && window.location.pathname]);
  
  
  
  return (
    <div className="nav flex-column nav-pills">
      <Link href="/user">
        <a className="nav-link active">Dashboard</a>
      </Link>
    </div>
  );
};

export default UserNav;
