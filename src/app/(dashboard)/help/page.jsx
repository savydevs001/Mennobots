"use client";
import React, { useState } from "react";
import MaxWidth from "@/components/MaxWidth";
import { FaSearch } from "react-icons/fa";

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVideoIndex, setActiveVideoIndex] = useState(null);

  const cards = [
    { title: "Introduction to MennoBots", lang: "en" },
    { title: "How to create a flow?", lang: "en" },
    { title: "How to execute a flow?", lang: "en" },
    { title: "How to view reports?", lang: "en" },
    { title: "Introducción a MennoBots", lang: "es" },
    { title: "Cómo ejecutar un flujo", lang: "es" },
  ];

  const filteredCards = cards.filter((card) =>
    card.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVideoClick = (index) => {
    setActiveVideoIndex(index); // Set the new active video
  };

  return (
    <MaxWidth>
      <div className="min-h-screen flex flex-col items-center py-8">
        {/* Search Bar */}
        <div className="w-full font-[600] text-center text-gray-800 max-w-md px-4 mb-6">
          <label htmlFor="search">How can we help you?</label>
          <div className="relative mt-4">
            <span className="absolute top-4 left-0 pl-4 flex items-center text-gray-500">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search by title"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 rounded-full bg-white hover:ring-1 hover:ring-primary text-gray-700 py-3 px-4 border border-gray-300 mb-1 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Large Video Player */}
        {activeVideoIndex !== null && (
          <div className="w-full max-w-4xl mb-8 px-4">
            <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
              <video
                src={cards[activeVideoIndex].videoUrl}
                controls
                autoPlay
                className="w-full h-96 object-cover rounded-lg"
              />
              <h2 className="text-white text-lg font-semibold p-4 bg-black bg-opacity-75 rounded-b-lg">
                {cards[activeVideoIndex].title}
              </h2>
            </div>
          </div>
        )}

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full px-4">
          {filteredCards.map((card, index) => (
            <div
              key={index}
              className="flex flex-col items-center bg-white p-4 rounded-lg shadow-md cursor-pointer"
              onClick={() => handleVideoClick(index)}
            >
              <div className="relative mb-4 w-full h-48 overflow-hidden rounded-lg">
                {/* Video Thumbnail */}
                <video
                  src={card.videoUrl}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                />
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white p-2 rounded-full shadow-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-5.197-2.518A1 1 0 008 9.454v5.092a1 1 0 001.555.832l5.197-2.518a1 1 0 000-1.832z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <h2 className="text-lg font-medium text-center">{card.title}</h2>
            </div>
          ))}
          {filteredCards.length === 0 && (
            <p className="text-center text-gray-500">No results found.</p>
          )}
        </div>
      </div>
    </MaxWidth>
  );
}
