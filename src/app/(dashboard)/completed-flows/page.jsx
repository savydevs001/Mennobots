"use client";

import MaxWidth from "@/components/MaxWidth";
import { useState, useEffect } from "react";
import { FaSearch, FaDownload, FaTrash, FaRobot } from "react-icons/fa";
import { RiSettings5Fill } from "react-icons/ri";
import Popup from "@/components/Popup"; // Import the Popup component
import { Toaster, toast } from "react-hot-toast"; // Import toast and Toaster
import Cookies from "js-cookie";
import Loader from "@/components/ui/loader";
import Image from "next/image";

function App() {
  const [showPopup, setShowPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [flowsPerPage] = useState(3);
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const userDataCookie = Cookies.get("user_data");
    const userData = JSON.parse(userDataCookie);
    const userId = userData?.id;

    if (!userId) {
      console.log("User ID not found");
      setLoading(false);
      return;
    }
    const fetchFlows = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/get-flows-by-id`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
          }
        );
        const data = await response.json();
        console.log(data);
        const completedFlows = data.flows.filter(
          (flow) => flow.isCompleted === true
        );
        setFlows(completedFlows);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFlows();
  }, []);

  const openSettings = (flow) => {
    setSelectedFlow(flow);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const openDeletePopup = (flow) => {
    setSelectedFlow(flow);
    setShowDeletePopup(true);
  };

  const closeDeletePopup = () => {
    setShowDeletePopup(false);
  };

  const handleDeleteConfirm = () => {
    // Handle delete logic here
    toast.success(`${selectedFlow.name} deleted successfully.`);
    closeDeletePopup();
  };

  const filteredFlows = flows.filter((flow) =>
    flow.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastFlow = currentPage * flowsPerPage;
  const indexOfFirstFlow = indexOfLastFlow - flowsPerPage;
  const currentFlows = filteredFlows.slice(indexOfFirstFlow, indexOfLastFlow);
  const totalPages = Math.ceil(filteredFlows.length / flowsPerPage);

  return (
    <MaxWidth>
      <Toaster position="top-center" />
      <div className="mb-4 h-full">
        {/* Search Bar with Icon */}
        <div className="relative">
          <span className="absolute top-4 left-0 pl-4 flex items-center text-gray-500">
            <FaSearch />
          </span>
          <input
            type="text"
            placeholder="Search by name, date, version, etc."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 rounded-full bg-white hover:ring-1 hover:ring-primary text-gray-700 py-3 px-4 border border-gray-300 mb-1 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Responsive Layout for Completed Flows */}
      <div className="hidden sm:block">
        {" "}
        {/* Table for larger screens */}
        <table className="min-w-full bg-white">
          <thead className="border-b text-sm text-gray-700 border-t border-gray-300">
            <tr>
              <th className="py-2 px-4">#</th>
              <th className="py-2 px-4 text-left">Flow Name</th>
              <th className="py-2 px-4 text-center">RUC</th>
              <th className="py-2 px-4 text-center">Api</th>
              <th className="py-2 px-4 text-center">Files Downloaded</th>
              <th className="py-2 px-4 text-center">Schedule Time</th>

              <th className="py-2 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="py-10 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Loader />
                  </div>
                </td>
              </tr>
            ) : currentFlows.length > 0 ? (
              currentFlows.map((flow, index) => (
                <tr key={flow.id} className="border-b">
                  <td className="py-2 px-4  text-center font-[600]">
                    {index + 1 + indexOfFirstFlow}
                  </td>
                  <td className="py-2 px-4">
                    {/* <div className="flex items-start"> */}

                    {/* <div className="w-full h-full"> */}
                    <div className="font-semibold">{flow.name}</div>
                    {/* </div> */}
                    {/* </div> */}
                  </td>

                  <td className="text-gray-700 text-center ">{flow.rucId.user}</td>
                  <td className="py-2 px-4 text-gray-700 text-center">
                    {flow.apiType === 0
                      ? "sri-doc-recibidos"
                      : "search-sri-doc-recibidos"}
                  </td>
                  <td className="py-2 px-4 text-center">{flow.downloadedFiles}</td>
                  <td className="py-2 px-4 text-gray-700 text-center">{flow.schedule.times}</td>

                  <td className="py-2 px-4 flex items-end flex-col gap-2">
                    <button
                      onClick={() => openSettings(flow)}
                      className="bg-[#0046FF] text-white w-[120px] px-4 py-2 rounded flex items-center justify-center gap-1 hover:bg-blue-600"
                    >
                      <RiSettings5Fill className="text-white " /> Report
                    </button>

                    <button
                      onClick={() => openDeletePopup(flow)}
                      className="bg-red-600 text-white w-[120px] px-4 py-2 rounded flex items-center justify-center gap-1 hover:bg-red-700"
                    >
                      <FaTrash className="text-white" /> Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="py-10 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Image
                      src="/error.svg"
                      alt="No Flows"
                      width={120}
                      height={120}
                      className="mb-4"
                    />
                    <p className="text-gray-500 text-lg">No flows</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden grid grid-cols-1 gap-4">
        {" "}
        {/* Card layout for small screens */}
        {currentFlows.length > 0 ? (
          currentFlows.map((flow) => (
            <div key={flow.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-start mb-2">
                <FaRobot
                  className="mr-2 text-primary"
                  style={{ color: "#FF6347" }}
                />
                <div className="w-full">
                  <h3 className="font-semibold">{flow.name}</h3>
                  <div className="text-gray-700 text-sm py-2 px-2 w-full rounded min-h-[200px] bg-gray-200">
                    {flow.description}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => openSettings(flow)}
                  className="bg-[#0046FF] flex-1 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-1"
                >
                  <RiSettings5Fill className="text-white" /> Settings
                </button>
                <button className="bg-black flex-1 text-white px-4 py-2 rounded hover:bg-gray-800 flex items-center justify-center gap-1">
                  <FaDownload className="text-white" /> Load
                </button>
                <button
                  onClick={() => openDeletePopup(flow)}
                  className="bg-red-600 text-white flex-1 px-4 py-2 rounded hover:bg-red-700 flex items-center justify-center gap-1"
                >
                  <FaTrash className="text-white" /> Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center col-span-1 py-4">No results found</div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          &lt; Previous
        </button>
        <div className="flex items-center space-x-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === index + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Next &gt;
        </button>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <Popup onClose={closePopup}>
          <h3 className="text-xl font-semibold mb-4">
            Configure {selectedFlow?.name}
          </h3>
          {/* Additional settings form can go here */}
          <div className="flex justify-end space-x-4 mt-4">
            <button
              onClick={closePopup}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </Popup>
      )}

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <Popup onClose={closeDeletePopup}>
          <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
          <p>
            Are you sure you want to delete the flow:{" "}
            <strong>{selectedFlow?.name}</strong>?
          </p>
          <div className="flex justify-end space-x-4 mt-4">
            <button
              onClick={handleDeleteConfirm}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={closeDeletePopup}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </Popup>
      )}
    </MaxWidth>
  );
}

export default App;
