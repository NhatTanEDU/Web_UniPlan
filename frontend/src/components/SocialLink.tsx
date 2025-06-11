import React from "react";

interface SocialLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  className?: string; // thêm tùy chọn style ngoài nếu cần
}

const SocialLink: React.FC<SocialLinkProps> = ({
  href,
  icon,
  label,
  className = ""
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    title={label}
    className={`text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 ${className}`}
  >
    {icon}
  </a>
);

export default SocialLink;
