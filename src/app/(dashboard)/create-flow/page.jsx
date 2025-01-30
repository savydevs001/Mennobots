"use client";
import { useState, useEffect } from "react";
import MaxWidth from "@/components/MaxWidth";
import {
  Plus,
  Save,
  Play,
  Calendar,
  Clock,
  Delete,
  Trash2,
} from "lucide-react";
import Popup from "@/components/Popup";
import { Toaster, toast } from "react-hot-toast";
import Image from "next/image";
import Loader from "@/components/ui/loader";
import Cookies from "js-cookie";
import Spinner from "@/components/ui/spinner";
import { Eye, EyeOff } from "lucide-react";
import { dataListLabelPropDefs } from "@radix-ui/themes/dist/cjs/components/data-list.props";

function FlowPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPop, setLoadingPop] = useState(false);
  const [toFetchData, setToFetchData] = useState(true);
  const [selectedFlow, setSelectedFlow] = useState(null);

  const [year, setYear] = useState(2024);
  const [month, setMonth] = useState(1);
  const [date, setDate] = useState(0);
  const [selectedDays, setSelectedDays] = useState([]);
  const [times, setTimes] = useState([""]);
  const [rucList, setRucList] = useState([]);
  const [selectedRuc, setSelectedRuc] = useState("");
  const [selectedRucId, setSelectedRucId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [everyday, setEveryday] = useState(false);
  const [voucherType, setVoucherType] = useState(1);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [apiFunction, setApiFunction] = useState(0);

  const handleTimeChange = (index, value) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  const addNewTime = () => {
    setTimes([...times, ""]);
  };

  const removeTime = (index) => {
    setTimes(times.filter((_, i) => i !== index));
  };

  const fetchRucData = async () => {
    setLoading(true);
    const authTokenCookie = Cookies.get("auth_token");
    // const tokenVal = JSON.parse(authTokenCookie);

    if (!authTokenCookie) {
      console.log("Token not found");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/get-sri-password`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authTokenCookie}`,
          },
        }
      );
      const data = await response.json();
      setRucList(data?.companyPasswords || []);
    } catch (error) {
      console.error("Error fetching RUC data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlows = async () => {
    setLoading(true);
    const userDataCookie = Cookies.get("user_data");
    const userData = JSON.parse(userDataCookie);
    const userId = userData?.id;

    if (!userId) {
      console.log("User ID not found");
      setLoading(false);
      return;
    }

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
      setListings(data?.flows);
    } catch (error) {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlows();
    fetchRucData();
    setToFetchData(false);
    console.log("fetching data");
  }, [toFetchData]);

  const handleOkClick = async () => {
    const newErrors = {};

    // Basic validations
    if (!name) {
      newErrors.name = "Name is required";
    }

    if (!description) {
      newErrors.description = "Description is required";
    }

    if (!selectedRuc) {
      newErrors.ruc = "RUC is required";
    }

    if (selectedRuc && !password) {
      newErrors.password = "Password is required";
    }

    // Validate schedule times
    if (everyday || selectedDays.length > 0) {
      console.log(times);
      if (times.length === 0 || times.every((time) => time === "")) {
        newErrors.time = "At least one time is required.";
      } else {
        for (const [index, time] of times.entries()) {
          if (!time) {
            newErrors.time = `Time slot ${index + 1} is required.`;
          }
        }
      }
    } else {
      newErrors.days = "At least one day is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create schedule object
    const scheduleObject = {
      days: everyday ? [0, 1, 2, 3, 4, 5, 6] : selectedDays,
      times: times.filter((time) => time !== ""),
    };

    try {
      setLoadingPop(true);
      const userDataCookie = Cookies.get("user_data");
      const userData = JSON.parse(userDataCookie);
      const userId = userData?.id;

      if (!userId) {
        console.log("User ID not found");
        setLoadingPop(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/create-flow`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: userId,
            name,
            description,
            rucId: selectedRuc,
            year: year.toString(),
            month: month,
            date: date,
            voucherType: voucherType,
            schedule: scheduleObject,
            apiType: apiFunction,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("New robot created successfully!");
        setName("");
        setDescription("");
        setSelectedRuc("");
        setPassword("");
        setYear(2024);
        setMonth(1);
        setDate(0);
        setApiFunction(0);
        setSelectedDays([]);
        setTimes([""]);
        setEveryday(false);
        setErrors({});
        setIsPopupOpen(false);
        fetchFlows();
      } else {
        toast.error(data.message || "Failed to create flow.");
      }
    } catch (error) {
      console.error("Error creating flow:", error);
      toast.error("An error occurred while creating the flow.");
    } finally {
      setLoadingPop(false);
    }
  };

  const handlePopup = () => {
    setIsPopupOpen((prevVal) => !prevVal);
  };

  // Handle RUC selection and set password
  const handleRucChange = (e) => {
    const selected = rucList.find((item) => item._id === e.target.value);

    setSelectedRuc(selected?._id || "");
    setSelectedRucId(selected?._id || "");
    setPassword(selected?.password || "");
  };

  const showDetailsPopup = (listingId) => {
    const listing = listings.find((listing) => listing._id === listingId);
    setSelectedFlow(listing);
    setIsDetailsOpen(true);
  };

  const closeDetailsPopup = () => {
    setIsDetailsOpen(false);
    setSelectedFlow(null);
  };

  return (
    <MaxWidth>
      <Toaster position="top-center" />

      <div className="flex w-full justify-end mb-6">
        <button
          className="bg-[rgb(0,70,255)] py-2 text-white px-4 rounded-full hover:bg-[rgb(0,50,200)] transition flex items-center"
          aria-label="Create a new item"
          onClick={handlePopup}
        >
          <Plus className="mr-2" />
          New
        </button>
      </div>

      <div className="relative overflow-x-auto shadow-md rounded-lg">
        <table className="w-full bg-white  text-left text-gray-500">
          <thead className="text-sm text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-center">ID</th>
              <th className="px-6 py-3 text-center">Name</th>
              <th className="px-6 py-3 text-center">Description</th>
              <th className="px-6 py-3 text-center">RUC</th>
              <th className="px-6 py-3 text-center">Api Function</th>
              <th className="px-6 py-3 text-center">Details</th>
            </tr>
          </thead>
          {/* Conditionally rendering loading or listings */}
          {loading ? (
            <tbody>
              <tr>
                <td colSpan="5" className="py-10 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Loader />
                  </div>
                </td>
              </tr>
            </tbody>
          ) : listings.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan="5" className="text-center py-10">
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
            </tbody>
          ) : (
            <tbody className="font-[500]">
              {listings.map((listing, index) => (
                <tr
                  key={listing._id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-200"}
                >
                  <td className="border-b border-gray-300 px-6 py-4 text-gray-700 text-center">
                    {index + 1}
                  </td>
                  <td className="border-b border-gray-300 px-6 py-4 text-gray-700 text-center">
                    {listing.name}
                  </td>
                  <td className="border-b border-gray-300 px-6 py-4 text-gray-700 text-center">
                    {listing.description}
                  </td>

                  <td className="border-b border-gray-300 px-6 py-4 text-gray-700 text-center">
                    {listing?.rucId?.user || "N/A"}
                  </td>
                  <td className="border-b border-gray-300 px-6 py-4 text-gray-700 text-center">
                  {listing.apiType === 0 ? "sri-doc-recibidos" : "search-sri-doc-recibidos"}
                  </td>
                  <td className="border-b border-gray-300 px-6 py-4 text-gray-700 text-center">
                    <span
                      onClick={() => showDetailsPopup(listing?._id)}
                      className="text-blue-500 hover:underline underline-offset-4 cursor-pointer"
                    >
                      View Details
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {isPopupOpen && (
        <Popup onClose={() => setIsPopupOpen(false)}>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Create New Flow
          </h2>
          <div className="space-y-4">
            <label className="block">
              <span className=" font-medium text-gray-700">Name</span>
              <input
                type="text"
                placeholder="Enter robot name"
                className={`w-full rounded-md bg-white hover:ring-1 hover:ring-primary text-gray-700 py-3 px-3 border border-gray-300 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                  errors.name ? "border-red-500" : ""
                }`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }}
              />
              {errors.name && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.name}
                </span>
              )}
            </label>
            <div>
              <label className="">
                <span className=" font-medium text-gray-700">Description</span>
                <textarea
                  placeholder="Enter robot description"
                  className={`w-full rounded-md bg-white hover:ring-1 hover:ring-primary text-gray-700 py-3 px-3 border border-gray-300 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                    errors.description ? "border-red-500" : ""
                  }`}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setErrors((prev) => ({ ...prev, description: undefined }));
                  }}
                />
                {errors.description && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.description}
                  </span>
                )}
              </label>
            </div>
            {/* <div className="flex w-full items-center justify-between">
              <div className="space-y-2">
                <p className="font-medium text-gray-700">Open new robot:</p>
                <div className="flex items-center gap-6">
                  {["Studio", "Flow"].map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2  font-medium text-gray-700"
                    >
                      <input
                        type="radio"
                        value={type}
                        checked={robotType === type}
                        onChange={() => setRobotType(type)}
                        className="form-radio text-blue-500"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
            </div> */}

            {/* New API Function Dropdown */}
            <div>
              <label className="block">
                <span className="font-medium text-gray-700 mt-[-30px]">
                  API Function
                </span>
                <select
                  className="rounded-md w-full bg-white py-3 px-3 border hover:ring-1 hover:ring-primary border-gray-300 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={apiFunction}
                  onChange={(e) => setApiFunction(Number(e.target.value))}
                >
                  <option value={0}>sri-doc-recibidos</option>
                  <option value={1}>search-sri-doc-recibidos</option>
                </select>
              </label>
            </div>

            {/* RUC Selection */}
            <div>
              <label className="block font-medium text-gray-700 ">RUC</label>
              <select
                className={`rounded-md w-full bg-white py-3 px-3 border hover:ring-1 hover:ring-primary border-gray-300 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                  errors.ruc ? "border-red-500" : ""
                }`}
                value={selectedRucId}
                onChange={(e) => {
                  handleRucChange(e);
                  setErrors((prev) => ({ ...prev, ruc: undefined }));
                }}
              >
                <option className="text-gray-700" value="">
                  Select RUC
                </option>
                {rucList.map((item) => (
                  <option
                    className="text-gray-700"
                    key={item.user}
                    value={item._id}
                  >
                    {item.user}
                  </option>
                ))}
              </select>
              {errors.ruc && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.ruc}
                </span>
              )}
            </div>

            {/* Password Field */}
            {/* Password Field */}
            {selectedRuc && (
              <div>
                <label className="block font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`rounded-md w-full bg-white py-3 px-3 border hover:ring-1 hover:ring-primary border-gray-300 text-gray-700 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                      errors.password ? "border-red-500" : ""
                    }`}
                    value={password}
                    readOnly
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="cursor-pointer" />
                    ) : (
                      <Eye className="cursor-pointer" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.password}
                  </span>
                )}
              </div>
            )}

            {/* Issue Period Selection */}
            <div className="block">
              <span className="font-medium text-gray-700">Issue Period</span>
              <div className="grid grid-cols-3 gap-4 mt-2">
                {/* Year */}
                <label className="block">
                  <span className="font-medium text-gray-700">Year</span>
                  <select
                    className=" rounded-md w-full bg-white py-2 px-3 border hover:ring-1 hover:ring-primary border-gray-300 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  >
                    {[2025, 2024, 2023, 2022, 2021].map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Month */}
                <label className="block">
                  <span className="font-medium text-gray-700">Month</span>
                  <select
                    className=" rounded-md w-full bg-white py-2 px-3 border hover:ring-1 hover:ring-primary border-gray-300 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  >
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((name, index) => (
                      <option key={index + 1} value={index + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Date */}
                <label className="block">
                  <span className="font-medium text-gray-700">Date</span>
                  <select
                    className=" rounded-md w-full bg-white py-2 px-3 border hover:ring-1 hover:ring-primary border-gray-300 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  >
                    {[
                      "All",
                      ...Array.from({ length: 31 }, (_, i) => i + 1),
                    ].map((d, index) => (
                      <option key={index} value={index}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div>
              {/* New Voucher Type dropdown */}
              <label className="block">
                <span className="font-medium text-gray-700">
                  Type of Voucher
                </span>
                <select
                  className="rounded-md w-full bg-white py-2 px-3 border hover:ring-1 hover:ring-primary border-gray-300 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={voucherType}
                  onChange={(e) => setVoucherType(e.target.value)}
                >
                  <option value={1}>Bill</option>
                  <option value={2}>
                    Settlement of purchase of goods and provision of services
                  </option>
                  <option value={3}>Credit Notes</option>
                  <option value={4}>Debit Notes</option>
                  <option value={5}>Withholding Voucher</option>
                </select>
              </label>
            </div>
            {/* Days Selection */}
            <div>
              <span className="font-medium text-gray-700">
                Schedule on Days
              </span>
              <div
                className={`grid grid-cols-4 gap-3 mt-2 ${
                  errors.days ? "border border-red-500 rounded-md p-2" : ""
                }`}
              >
                {/* Everyday Checkbox */}
                <label className="flex text-gray-700 items-center gap-2 col-span-4">
                  <input
                    type="checkbox"
                    checked={everyday}
                    onChange={() => {
                      setEveryday(!everyday);
                      setSelectedDays(everyday ? [] : [0, 1, 2, 3, 4, 5, 6]);
                      setErrors((prev) => ({ ...prev, days: undefined }));
                    }}
                    className="form-checkbox text-blue-500"
                  />
                  Everyday
                </label>
                {/* Individual Day Checkboxes */}
                {[
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ].map((day, index) => (
                  <label
                    key={day}
                    className="flex text-gray-700 items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      disabled={everyday} // Disable individual checkboxes if Everyday is selected
                      checked={everyday || selectedDays.includes(index)} // Check if it's Everyday or the day is selected
                      onChange={() => {
                        if (!everyday) {
                          setSelectedDays((prev) =>
                            prev.includes(index)
                              ? prev.filter((d) => d !== index)
                              : [...prev, index]
                          );
                        }
                      }}
                      className="form-checkbox  text-blue-500"
                    />
                    {day}
                  </label>
                ))}
              </div>
              {errors.days && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.days}
                </span>
              )}
            </div>

            {/* Time Selection */}
            <div
              className={`bg-gray-50 rounded-lg p-4 ${
                errors.time ? "border border-red-500" : ""
              }`}
            >
              <h3 className="font-semibold text-gray-700 mb-3">
                Schedule Times
              </h3>
              {times.map((time, index) => (
                <div key={index} className="flex items-center gap-4 mb-2">
                  <input
                    type="time"
                    className={`rounded-lg w-full bg-white py-2 px-3 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                      errors.time ? "border-red-500" : ""
                    }`}
                    value={time}
                    onChange={(e) => {
                      handleTimeChange(index, e.target.value);
                      setErrors((prev) => ({ ...prev, time: undefined }));
                    }}
                  />
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => removeTime(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              {errors.time && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.time}
                </span>
              )}
              <button
                className="text-blue-500 hover:underline"
                onClick={addNewTime}
              >
                Add Time
              </button>
            </div>
          </div>
          <div className="flex justify-end mt-6 space-x-3">
            <button
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              onClick={handleOkClick}
              disabled={loadingPop}
            >
              <p>Create</p>
              {loadingPop && <Spinner />}
            </button>
            <button
              className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
              onClick={() => setIsPopupOpen(false)}
            >
              Cancel
            </button>
          </div>
        </Popup>
      )}

      {isDetailsOpen && selectedFlow && (
        <Popup onClose={closeDetailsPopup}>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Flow Details
          </h2>

          <div className="space-y-6">
            {/* All Details in Column */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <p className="font-medium text-gray-700">Name</p>
                <p className="text-lg text-gray-800">{selectedFlow.name}</p>
                <hr className="my-4" />
              </div>

              {/* Description */}
              <div>
                <p className="font-medium text-gray-700">Description</p>
                <p className="text-lg text-gray-800">
                  {selectedFlow.description}
                </p>
                <hr className="my-4" />
              </div>

              {/* RUC */}
              <div>
                <p className="font-medium text-gray-700">RUC</p>
                <p className="text-lg text-gray-800">
                  {selectedFlow?.rucId?.user || "N/A"}
                </p>
                <hr className="my-4" />
              </div>

              {/* Issue Period */}
              <div>
                <p className="font-medium text-gray-700">Issue Period</p>
                <p className="text-lg text-gray-800">
                  {selectedFlow.year} -{" "}
                  {
                    [
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ][selectedFlow.month - 1]
                  }
                </p>
                <hr className="my-4" />
              </div>

              {/* Date */}
              <div>
                <p className="font-medium text-gray-700">Date</p>
                <p className="text-lg text-gray-800">
                  {selectedFlow.date === 0 ? "All" : selectedFlow.date}
                </p>
                <hr className="my-4" />
              </div>

              {/* Voucher Type */}
              <div>
                <p className="font-medium text-gray-700">Voucher Type</p>
                <p className="text-lg text-gray-800">
                  {selectedFlow.voucherType === 1
                    ? "Bill"
                    : selectedFlow.voucherType === 2
                    ? "Settlement of purchase of goods and provision of services"
                    : selectedFlow.voucherType === 3
                    ? "Credit Notes"
                    : selectedFlow.voucherType === 4
                    ? "Debit Notes"
                    : selectedFlow.voucherType === 5
                    ? "Withholding Voucher"
                    : "N/A"}
                </p>
                <hr className="my-4" />
              </div>
            </div>

            {/* Schedule Details */}
            <div>
              <h3 className="font-semibold text-xl text-gray-900 mb-4">
                Schedule
              </h3>

              {/* Days */}
              <div>
                <p className="font-medium text-gray-700">Days</p>
                <p className="text-lg text-gray-800">
                  {selectedFlow.schedule && selectedFlow.schedule.days
                    ? selectedFlow.schedule.days[0] === 0
                      ? "Everyday" // If 0, print "Everyday" and don't show other days
                      : selectedFlow.schedule.days
                          .map(
                            (day) =>
                              [
                                "Sunday",
                                "Monday",
                                "Tuesday",
                                "Wednesday",
                                "Thursday",
                                "Friday",
                                "Saturday",
                              ][day]
                          )
                          .join(", ")
                    : "No days available"}
                </p>
                <hr className="my-4" />
              </div>

              {/* Times */}
              <div>
                <p className="font-medium text-gray-700">Times</p>
                <p className="text-lg text-gray-800">
                  {selectedFlow.schedule && selectedFlow.schedule.times
                    ? selectedFlow.schedule.times.join(", ")
                    : "No times available"}
                </p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={closeDetailsPopup}
              className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition"
            >
              Close
            </button>
          </div>
        </Popup>
      )}
    </MaxWidth>
  );
}

export default FlowPage;
