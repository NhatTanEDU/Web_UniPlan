// components/DropdownMenu.tsx
import React from "react";
import LinkButton from "./LinkButton"; // Điều chỉnh đường dẫn nếu cần

interface DropdownMenuProps {
  title: string;
  items: string[];
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ title, items }) => (
  <div className="relative group">
    <button
      className="focus:outline-none group-hover:text-primary group-hover:underline transition"
      aria-label={`Menu ${title}`}
    >
      {title}
    </button>
    <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300 z-50">
      <ul className="p-4 space-y-2 text-sm text-gray-700">
        {items.map((item, index) => (
          <li key={index}>
            <LinkButton onClick={() => console.log(item)}>{item}</LinkButton>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default DropdownMenu;