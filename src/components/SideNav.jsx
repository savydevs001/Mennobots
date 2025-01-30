"use client";

import { Link } from "react-transition-progress/next";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
import { useState } from "react";

const SideNav = () => {
  const pathname = usePathname(); // Get the current route path
  const [openMenu, setOpenMenu] = useState(null); // Track currently open menu

  const isActive = (path) => {
    return pathname === path || (pathname === "/" && path === "/")
      ? "bg-[#0044FF4F] border-l-2 border-[#0046FF] text-[#C0F0FF] font-semibold"
      : "";
  };

  const toggleSubMenu = (menu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  // Menu items, "Scripts" has submenus
  const menuItems = [
    {
      title: "Home",
      path: "/home",
      icon: <RiHome2Fill className="mr-2" />,
    },
    {
      title: "Create Flow",
      path: "/create-flow",
      icon: <RiClipboardFill className="mr-2" />,
    },
   
    {
      title: "Completed Flows",
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
      title: "Licenses",
      path: "/licenses",
      icon: <RiFile2Fill className="mr-2" />,
    },
    {
      title: "Help & Support",
      path: "/help",
      icon: <RiQuestionLine className="mr-2" />, // Question mark icon
    },
  ];

  return (
    <aside className="sticky left-0 top-0 text-white min-w-[280px] px-[2rem] bg-[#00172B] py-[30px] h-full lg:h-screen overflow-y-auto hidden lg:block">
      <div className="flex flex-col justify-center">
        <div className="flex flex-col mb-8">
          <Image src="/logo.svg" alt="Logo" width={90} height={90} />
          <p className="text-gray-500 text-[8px]">powered by MENNOVA</p>
        </div>
        <ul className="flex flex-col space-y-2">
          {menuItems.map((item) => (
            <li key={item.title} className="relative">
              {item.subMenu ? (
                // For items with a submenu, just toggle the submenu on click
                <div
                  onClick={() => toggleSubMenu(item.title)}
                  className={`flex items-center p-2 cursor-pointer ${isActive(
                    item.path
                  )}`}
                >
                  {item.icon}
                  {item.title}
                  <span className="ml-auto">
                    {openMenu === item.title ? (
                      <RiArrowUpSLine />
                    ) : (
                      <RiArrowDownSLine />
                    )}
                  </span>
                </div>
              ) : (
                // For other items, wrap in Link for navigation
                <Link
                  href={item.path}
                  className={`flex items-center p-2 ${isActive(item.path)}`}
                >
                  {item.icon}
                  {item.title}
                </Link>
              )}
              {/* Render submenu if the item has one and it's open */}
              {item.subMenu && (
                <div
                  className={`transition-[max-height] duration-300 ease-in-out overflow-hidden ${
                    openMenu === item.title ? "max-h-[300px]" : "max-h-0"
                  }`}
                >
                  <ul className="ml-6 mt-2 space-y-2 bg-gray-700 p-2 rounded">
                    {item.subMenu.map((subItem) => (
                      <li key={subItem.title}>
                        <Link
                          href={subItem.path}
                          className={`flex items-center p-2 rounded hover:bg-gray-600 ${isActive(
                            subItem.path
                          )}`}
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
    </aside>
  );
};

export default SideNav;
