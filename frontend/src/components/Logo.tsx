import React from "react";

const Logo = ({ fullLogo }: { fullLogo: boolean }) => {
  return (
    <div className="flex items-center space-x-3">
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpwHDm35U1OOC6JkHVH4_5KsJiNl0jtXZAwA&s"
        alt="Infintrix Atlas Logo"
        width={50}
        height={50}
        className="block dark:hidden"
      />
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpwHDm35U1OOC6JkHVH4_5KsJiNl0jtXZAwA&s"
        alt="Infintrix Atlas Logo"
        width={50}
        height={50}
        className="hidden dark:block"
      />
      {fullLogo && (
        <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-white">
          Infintrix Atlas
        </span>
      )}
    </div>
  );
};

export default Logo;