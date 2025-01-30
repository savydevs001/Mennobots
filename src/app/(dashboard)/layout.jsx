"use client"; // Ensure this is at the top for Next.js

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation"; // Import necessary hooks from Next.js
import SideNav from "@/components/SideNav"; // Import your SideNav component
import MobileNav from "@/components/MobileNav"; // Import MobileNav component
import { FaSignOutAlt } from "react-icons/fa"; // Import the logout icon
import Avatar from "@mui/material/Avatar"; // Import Avatar component from Material-UI
import { styled } from "@mui/material/styles"; // For custom styles
import { Link } from "react-transition-progress/next";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import { io } from "socket.io-client";
import Spinner from "@/components/ui/spin";

const socket = io("http://localhost:4000");

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
    transform: "translateY(0px)",
    opacity: 1,
  },
}));

function Layout({ children }) {
  useEffect(() => {
    // Listen for success events
    socket.on("flow-executed", (data) => {
      toast.dismiss();
      toast.success(data.message);
    });

    socket.on("flow-started", (data) => {
      toast.dismiss();
      toast(data.message, {
        icon: <Spinner />,
      });
    });

    socket.on("file-downloaded", (data) => {
      toast.dismiss();
      toast(data.message, {
        icon: <Spinner />,
      });
    });

    return () => {
      socket.off("flow-executed");
      socket.off("flow-started");
      socket.off("file-downloaded");
    };
  }, []);

  const pathname = usePathname();
  const router = useRouter();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const userEmail = "user@corporative.com";
  const [userData, setUserData] = useState(null);

  const getActiveMenuLabel = (path) => {
    const routeMap = {
      "/home": "Home",
      "/create-flow": "Create Flow",
      "/scripts": "Scripts",
      "/scripts/run-python-code": "Run Python Code",
      "/scripts/run-python": "Run Python",
      "/scripts/run-vbs": "Run VBS",
      "/scripts/run-powershell": "Run PowerShell",
      "/completed-flows": "Completed Flow",
      "/reports": "Reports",
      "/settings": "Settings",
      "/licenses": "Licenses",
      "/help": "Help",
    };

    return routeMap[path] || "";
  };

  const handleLogout = async () => {
    try {
      // Call the backend logout API route
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/logout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Cookies.get("auth_token")}`, // Pass the token stored in cookies if needed
          },
        }
      );

      console.log(response);

      if (response.ok) {
        // Clear the cookies on the client side
        Cookies.remove("auth_token"); // Remove the authentication token
        Cookies.remove("user_data"); // Remove user data

        // Show success toast
        toast.success("Successfully logged out!");

        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        // Handle error if the response is not ok
        toast.error("Logout failed, please try again.");
      }
    } catch (error) {
      // Handle any unexpected errors
      toast.error("An error occurred while logging out.");
      console.error("Logout error:", error);
    }
  };

  // Truncate name or email if they are too long
  const truncateText = (text, maxLength) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev); // Toggle dropdown visibility
  };
  // Get user data from cookies when the component mounts
  useEffect(() => {
    const user = Cookies.get("user_data");
    if (user) {
      setUserData(JSON.parse(user)); // Parse and set user data from cookies
    }
  }, []);

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
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownVisible]);

  // Function to check if the screen is small
  const checkScreenSize = () => {
    setIsSmallScreen(window.innerWidth < 1024); // Adjust 1024px based on your lg breakpoint
  };

  // Set up event listeners for resize
  useEffect(() => {
    checkScreenSize(); // Initial check on mount
    window.addEventListener("resize", checkScreenSize); // Update on resize

    return () => {
      window.removeEventListener("resize", checkScreenSize); // Clean up listener on unmount
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row max-w-[1920px] mx-auto bg-[#F7F7F7]">
      <Toaster position="top-center" />
      <SideNav />
      {isSmallScreen && ( // Render MobileNav only on small screens
        <MobileNav
          dropdownVisible={dropdownVisible}
          toggleDropdown={toggleDropdown}
        />
      )}
      <div className="flex-grow h-full m-0 p-0">
        <div className="relative py-[15px] hidden bg-white border-b border-[#EAECF0] lg:flex lg:px-[1.5rem] mb-4">
          <h2 className="text-[24px] font-[700]">
            {getActiveMenuLabel(pathname)}
          </h2>
          {/* Avatar Button */}
          <div className="relative ml-auto">
            <div
              id="avatar"
              className="cursor-pointer"
              onClick={toggleDropdown} // Toggle dropdown on click
            >
              <Avatar
                alt="User Name" // Replace with the user's name
                sx={{ width: 40, height: 40 }} // Size of the avatar
              />
            </div>
            <div className={dropdownVisible ? "visible" : ""}>
              <DropdownContainer
                id="dropdown"
                className={`${
                  dropdownVisible ? "visible z-40" : ""
                } transition-opacity duration-300 ease-in-out`} // Add transition classes for smooth animation
                style={{
                  opacity: dropdownVisible ? 1 : 0, // Control visibility with opacity
                  visibility: dropdownVisible ? "visible" : "", // Ensure the element is completely hidden when not visible
                  pointerEvents: dropdownVisible ? "auto" : "none", // Disable interaction when hidden
                }}
              >
                <div className=" text-sm text-gray-700 overflow-hidden">
                  <div className="py-2 px-4 z-40 bg-gray-100 border-b ">
                    <p className="text-sm font-[400]">
                      {userData ? truncateText(userData.name, 20) : "Guest"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {userData ? truncateText(userData.email, 25) : "Email"}
                    </p>
                  </div>
                  <ul>
                    <li>
                      <p
                        onClick={handleLogout}
                        className="flex items-center text-red-600 !z-40 px-4 py-2 hover:bg-gray-200 cursor-pointer space-x-3"
                      >
                        <FaSignOutAlt className="w-4 h-4 mr-2" />
                        Logout
                      </p>
                    </li>
                  </ul>
                </div>
              </DropdownContainer>
            </div>
          </div>
        </div>
        {children} {/* Render child components */}
      </div>
    </div>
  );
}

export default Layout;
