"use client";

import { useState, useEffect } from "react";
import { PanelRight } from "lucide-react";
import Image from "next/image";
import { CircleX } from "lucide-react";
import {
  RiHome2Fill,
  RiClipboardFill,
  RiFileList2Fill,
  RiSettings5Fill,
  RiQuestionLine,
  RiFile2Fill,
  RiArrowDownSLine,
  RiArrowUpSLine,
} from "react-icons/ri";
import { Link } from "react-transition-progress/next";
import Avatar from "@mui/material/Avatar"; // Import Avatar from Material-UI
import { styled } from "@mui/material/styles"; // For custom styling
import { FaSignOutAlt } from "react-icons/fa"; // Logout icon

const DropdownContainer = styled("div")(({ theme }) => ({
  position: "absolute",
  right: 0,
  marginTop: theme.spacing(1),
  width: "200px",
  backgroundColor: "white",
  border: "1px solid #ddd",
  borderRadius: "4px",
  boxShadow: theme.shadows[2],
  transition: "opacity 0.2s ease-in-out, transform 0.2s ease-in-out",
  transform: "translateY(5px)",
  opacity: 0,
  "&.visible": {
    transform: "translateY(-12px)",
    opacity: 1,
  },
}));

const MobileNav = ({ dropdownVisible, toggleDropdown }) => {
  const [showNav, setShowNav] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(null); // Change state management for submenus
  const userEmail = "user@corporative.com";

  const toggleNavHandler = () => {
    setShowNav(!showNav);
  };

  const toggleSubMenu = (menu) => {
    setOpenSubMenu((prev) => (prev === menu ? null : menu)); // Toggle submenu visibility
  };

  const handleLogout = () => {
    // Implement logout functionality here
    console.log("Logout clicked");
    toggleDropdown();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdownElement = document.getElementById("dropdown");
      const avatarElement = document.getElementById("avatar");
      if (
        dropdownVisible &&
        dropdownElement &&
        !dropdownElement.contains(event.target) &&
        !avatarElement.contains(event.target)
      ) {
        // setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownVisible]);

  const menuItems = [
    { title: "Home", path: "/home", icon: <RiHome2Fill className="mr-2" /> },
    {
      title: "Create Flows",
      path: "/create-flow",
      icon: <RiClipboardFill className="mr-2" />,
    },
    {
      title: "Completed Flow",
      path: "/completed-flows",
      icon: <RiFile2Fill className="mr-2" />,
    },
    {
      title: "Reports",
      path: "/reports",
      icon: <RiFile2Fill className="mr-2" />,
    },
    {
      title: "Settings",
      path: "/settings",
      icon: <RiSettings5Fill className="mr-2" />,
    },
    {
      title: "Help & Support",
      path: "/help",
      icon: <RiQuestionLine className="mr-2" />,
    },
  ];

  return (
    <div className="lg:hidden block">
      <div className="flex items-center py-[16px] px-3 bg-[#00172B] justify-between">
        <div className="flex gap-2 items-center pl-3">
          <PanelRight size={30} onClick={toggleNavHandler} color="#ffffff" />
          <div className="relative w-[110px] h-[37px]">
            <Image src="/logo.svg" alt="Logo" fill />
          </div>
        </div>
        <div className="relative ml-auto">
          <div id="avatar" className="cursor-pointer" onClick={toggleDropdown}>
            <Avatar alt="User Name" sx={{ width: 30, height: 30 }} />
          </div>
          <DropdownContainer
            id="dropdown"
            className={dropdownVisible ? "visible" : ""}
          >
            <div className="p-2 text-sm text-gray-700">
              <p className="py-2 border-b">{userEmail}</p>
              <button
                onClick={handleLogout}
                className="flex items-center my-2 w-full p-2 text-red-600 hover:bg-gray-100"
              >
                <FaSignOutAlt className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </DropdownContainer>
        </div>
      </div>
      <div
        className={`fixed z-[100] top-0 px-[2rem] left-0 lg:hidden bg-[#00172B] w-[300px] h-screen py-4 overflow-hidden transition-transform transform ${
          showNav ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col justify-between gap-6 h-full relative">
          <span onClick={toggleNavHandler} className="absolute top-0 right-3">
            <CircleX size={24} color="white" />
          </span>
          <div className="flex-col flex gap-[24px]">
            <div className="flex flex-col mb-8">
              <Image src="/logo.svg" alt="Logo" width={90} height={90} />
              <p className="text-gray-500 text-[8px]">powered by MENNOVA</p>
            </div>
            <ul className="flex flex-col text-white space-y-2">
              {menuItems.map((item) => (
                <li key={item.title} className="relative">
                  {item.subMenu ? (
                    <div
                      onClick={() => toggleSubMenu(item.title)}
                      className={`flex items-center p-2 cursor-pointer`}
                    >
                      {item.icon}
                      {item.title}
                      <span className="ml-auto">
                        {openSubMenu === item.title ? (
                          <RiArrowUpSLine />
                        ) : (
                          <RiArrowDownSLine />
                        )}
                      </span>
                    </div>
                  ) : (
                    <Link href={item.path} className={`flex items-center p-2`}>
                      {item.icon}
                      {item.title}
                    </Link>
                  )}
                  {item.subMenu && (
                    <div
                      className={`transition-[max-height] duration-300 ease-in-out overflow-hidden ${
                        openSubMenu === item.title ? "max-h-[300px]" : "max-h-0"
                      }`}
                    >
                      <ul className="ml-6 mt-2 space-y-2 bg-gray-700 p-2 rounded">
                        {item.subMenu.map((subItem) => (
                          <li key={subItem.title}>
                            <Link
                              href={subItem.path}
                              className="flex items-center p-2 rounded hover:bg-gray-600 text-white"
                            >
                              {subItem.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
