import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="text-center py-4 text-white bg-gray-900">
      <p>&copy; {new Date().getFullYear()} Ubon Hooper Club. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
