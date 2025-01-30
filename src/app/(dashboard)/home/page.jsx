"use client";
import { useEffect, useState } from "react";
import MaxWidth from "@/components/MaxWidth";
import Cookies from "js-cookie";
import axios from "axios";
import Image from "next/image";
import { toast } from "react-hot-toast";
import Spinner from "@/components/ui/spinner";
import { Edit2, Trash2 } from "lucide-react";
import Loader from "@/components/ui/loader";
import Popup from "@/components/Popup";
import { Eye, EyeOff } from "lucide-react";

// Modal component
const Modal = ({ isOpen, onClose, onSave, data, isFor }) => {
  const [editedInfo, setEditedInfo] = useState(data);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState(false);

  useEffect(() => {
    setEditedInfo(data);
  }, [data]);

  const validate = () => {
    const newErrors = {};
    editedInfo.forEach((item) => {
      if (!item.value.trim() && item.label !== "Registration Date") {
        newErrors[item.label] = "This field is required.";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e, index) => {
    const updatedInfo = [...editedInfo];
    if (editedInfo.filter((item) => item.label.toLowerCase() !== "id")) {
      updatedInfo[index + 1].value = e.target.value;
    } else updatedInfo[index].value = e.target.value;

    setEditedInfo(updatedInfo);
  };

  const handleSave = async () => {
    if (validate()) {
      setIsSaving(true);
      try {
        const token = Cookies.get("auth_token");
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/put-company-info`;
        let payload;

        // Dynamically set payload based on the value of `isFor`
        if (isFor === "general") {
          payload = { isFor, generalInfo: editedInfo };
        } else if (isFor === "economicActivity") {
          payload = { isFor, economicActivity: editedInfo };
        } else if (isFor === "passwords") {
          payload = { isFor, passwordData: editedInfo };
        } else {
          payload = { isFor, administrator: editedInfo };
        }

        const response = await axios.post(url, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.error) {
          onSave();
          onClose();
          toast.success("Data saved successfully!");
        }
      } catch (error) {
        console.error("Error saving data:", error);
        toast.error("Failed to save data. Please try again.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const editData = editedInfo.filter(
    (item) => item.label.toLowerCase() !== "id"
  );
  console.log(editedInfo);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 max-h-[500px] overflow-auto rounded shadow-lg w-96">
        <h3 className="text-xl font-bold mb-4">
          {isFor === "general"
            ? "Edit Company Info"
            : isFor === "economicActivity"
            ? "Edit Economic Activity"
            : isFor === "passwords"
            ? "Edit Password Info"
            : "Edit Admin Info"}
        </h3>
        <div className="space-y-4">
          {editData.map((item, index) => (
            <div key={index}>
              <label className="block text-sm font-semibold">
                {item.label}
              </label>
              {item.label === "Registration Date" ||
              item.label === "Last Updated" ? (
                <input
                  type="date"
                  value={item.value}
                  onChange={(e) => handleInputChange(e, index)}
                  className="w-full rounded-md bg-white hover:ring-1 hover:ring-primary text-gray-700 py-3 px-4 border border-gray-300 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              ) : item.label.toLowerCase() === "password" ? (
                <div className="relative">
                  <input
                    type={passwordVisibility ? "password" : "text"}
                    value={item.value}
                    onChange={(e) => handleInputChange(e, index)}
                    className="w-full rounded-md bg-white hover:ring-1 hover:ring-primary text-gray-700 py-3 px-4 border border-gray-300 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisibility(!passwordVisibility)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 focus:outline-none"
                  >
                    {passwordVisibility ? (
                      <Eye size={18} />
                    ) : (
                      <EyeOff size={18} />
                    )}
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => handleInputChange(e, index)}
                  className="w-full rounded-md bg-white hover:ring-1 hover:ring-primary text-gray-700 py-3 px-4 border border-gray-300 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white bg-gray-500 rounded mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 text-white ${
              isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"
            } rounded`}
          >
            {isSaving ? <Spinner /> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

function Home() {
  const [companyData, setCompanyData] = useState({
    generalInfo: [],
    economicActivity: [],
    administrators: [],
    passwords: [],
  });

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedInfo, setEditedInfo] = useState([]);
  const [infoType, setInfoType] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [dataToDelete, setDataToDelete] = useState(null);
  const [deleteSpinner, setDeleteSpinner] = useState(false);
  const [deleteType, setDeleteType] = useState("");

  const defaultGeneralInfo = [
    { label: "Name or Business Name", value: "-" },
    { label: "RUC", value: "-" },
    { label: "Date of Incorporation", value: "-" },
    { label: "Country", value: "-" },
    { label: "City", value: "-" },
    { label: "Office Address", value: "-" },
  ];

  const fetchData = async () => {
    const token = Cookies.get("auth_token");
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/get-company-info`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCompanyData((prevData) => ({
        ...prevData,
        generalInfo: response?.data?.generalInfo[0] || [],
      }));
    } catch (error) {
      console.error("Error fetching company data:", error);
    }
  };

  const fetchEconomicActivity = async () => {
    const token = Cookies.get("auth_token");
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/get-economic-activity`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCompanyData((prevData) => ({
        ...prevData,
        economicActivity: response?.data?.economicActivities[0] || [],
      }));
    } catch (error) {
      console.error("Error fetching economic activity data:", error);
    }
  };

  const fetchAdministrators = async () => {
    const token = Cookies.get("auth_token");
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/get-company-admins`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCompanyData((prevData) => ({
        ...prevData,
        administrators: response?.data?.administrators || [],
      }));
    } catch (error) {
      console.error("Error fetching company administrators:", error);
    }
  };

  const fetchPasswords = async () => {
    const token = Cookies.get("auth_token");
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/get-company-passwords`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCompanyData((prevData) => ({
        ...prevData,
        passwords: response?.data?.companyPasswords || [],
      }));
    } catch (error) {
      console.error("Error fetching company passwords:", error);
    }
  };

  const fetchDataAsync = async () => {
    setLoading(true); // Start loading state
    try {
      // Wait for all data fetching to complete
      await Promise.all([
        fetchData(),
        fetchEconomicActivity(),
        fetchAdministrators(),
        fetchPasswords(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false); // Set loading to false once all requests are completed
    }
  };

  useEffect(() => {
    fetchDataAsync(); 
  }, []);

  console.log(loading);

  const handleEditGeneralInfo = () => {
    const formattedGeneralInfo = [
      {
        label: "Name or Business Name",
        value: companyData?.generalInfo?.nameOrBusinessName || "-",
      },
      { label: "RUC", value: companyData?.generalInfo?.ruc || "-" },
      {
        label: "Date of Incorporation",
        value: companyData?.generalInfo?.dateOfIncorporation || "-",
      },
      { label: "Country", value: companyData?.generalInfo?.country || "-" },
      { label: "City", value: companyData?.generalInfo?.city || "-" },
      {
        label: "Office Address",
        value: companyData?.generalInfo?.officeAddress || "-",
      },
    ];

    setInfoType("general");
    setEditedInfo(formattedGeneralInfo);
    setIsModalOpen(true);
  };

  const handleEditEconomicActivity = () => {
    const formattedEconomicActivity = [
      {
        label: "Corporate Purpose",
        value: companyData?.economicActivity?.corporatePurpose || "-",
      },
      {
        label: "Main Activity",
        value: companyData?.economicActivity?.mainActivity || "-",
      },
    ];

    setInfoType("economic");
    setEditedInfo(formattedEconomicActivity);
    setIsModalOpen(true);
  };

  const handleEditAdministrators = (id) => {
    const adminToEdit = companyData?.administrators?.find(
      (admin) => admin._id === id
    );
    const formattedAdministrators = [
      {
        label: "id",
        value: adminToEdit?._id || "-",
      },
      {
        label: "Name",
        value: adminToEdit?.name || "-",
      },

      {
        label: "Nationality",
        value: adminToEdit?.nationality || "-",
      },
      {
        label: "Position",
        value: adminToEdit?.position || "-",
      },
      {
        label: "Registration Date",
        value: adminToEdit?.registrationDate
          ? new Date(adminToEdit?.registrationDate).toISOString().split("T")[0]
          : "",
      },
      {
        label: "Role",
        value: adminToEdit?.role || "-",
      },
    ];

    setInfoType("administrator");
    setEditedInfo(formattedAdministrators);
    setIsModalOpen(true);
  };

  const handleEditCompanyPassword = (id) => {
    const passwordToEdit = companyData?.passwords?.find(
      (password) => password._id === id
    );
    const formattedPasswords = [
      {
        label: "id",
        value: passwordToEdit?._id || "-",
      },
      {
        label: "Site",
        value: passwordToEdit?.site || "-",
      },
      {
        label: "User",
        value: passwordToEdit?.user || "-",
      },
      {
        label: "Password",
        value: passwordToEdit?.password || "-",
      },
    ];

    setInfoType("passwords");
    setEditedInfo(formattedPasswords);
    setIsModalOpen(true);
  };

  const handleAddAdministrators = () => {
    const formattedAdministrators = [
      {
        label: "Name",
        value: "-",
      },

      {
        label: "Nationality",
        value: "-",
      },
      {
        label: "Position",
        value: "-",
      },
      {
        label: "Registration Date",
        value: "-",
      },
      {
        label: "Role",
        value: "-",
      },
    ];

    setInfoType("administrator");
    setEditedInfo(formattedAdministrators);
    setIsModalOpen(true);
  };

  const handleAddPasswords = () => {
    const formattedPasswords = [
      {
        label: "Site",
        value: "-",
      },
      {
        label: "User",
        value: "-",
      },
      {
        label: "Password",
        value: "-",
      },
    ];

    setInfoType("passwords");
    setEditedInfo(formattedPasswords);
    setIsModalOpen(true);
  };

  const handleDeleteAdministrators = async () => {
    setDeleteSpinner(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/delete-admin-info`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ adminId: dataToDelete }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Administrator deleted:", data);
        setIsPopupOpen(false);
        setDataToDelete(null);
        fetchDataAsync();
      } else {
        console.error("Error deleting administrator:", data.error);
      }
    } catch (error) {
      console.error("Failed to delete administrator:", error);
    }
    setDeleteSpinner(false);
  };



  const closePopup = () => {
    setIsPopupOpen(false);
    setDataToDelete(null);
  };

  const deleteConfirmation = (id, type) => {
    setIsPopupOpen(true);
    setDataToDelete(id);
    type.toLowerCase() === "admin"
      ? setDeleteType("admin")
      : setDeleteType("password");
  };

  const handleDeletePassword = async () => {
    setDeleteSpinner(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/delete-password-info`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ passwordId: dataToDelete }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Password deleted:", data);
        setIsPopupOpen(false);
        setDataToDelete(null);
        fetchDataAsync();
      } else {
        console.error("Error deleting password:", data.error);
      }
    } catch (error) {
      console.error("Failed to delete password:", error);
    }
    setDeleteSpinner(false);
  };

  const handleDelete = () => {
    if (deleteType === "admin") {
      handleDeleteAdministrators();
    } else {
      handleDeletePassword();
    }
  };

  return (
    <MaxWidth>
      {loading ? (
        <div className="flex items-center w-full min-h-[50vh] mb-8 justify-center">
          <Loader />
        </div>
      ) : (
        <>
          <div className="">
            {/* Company General Information */}
            <h2 className="text-2xl font-bold mb-4 border-b pb-2 flex justify-between items-center">
              Datos Generales de la Compañía
              <button
                className="ml-4 text-blue-500"
                onClick={handleEditGeneralInfo}
              >
                Edit
              </button>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white p-4 rounded shadow">
                <p className="text-sm font-[700]">Name or Business Name</p>
                <p className="text-lg">
                  {companyData?.generalInfo?.nameOrBusinessName ||
                    defaultGeneralInfo.nameOrBusinessName}
                </p>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <p className="text-sm font-[700]">RUC</p>
                <p className="text-lg">
                  {companyData?.generalInfo?.ruc || defaultGeneralInfo.ruc}
                </p>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <p className="text-sm font-[700]">Date of Incorporation</p>
                <p className="text-lg">
                  {companyData?.generalInfo?.dateOfIncorporation ||
                    defaultGeneralInfo.dateOfIncorporation}
                </p>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <p className="text-sm font-[700]">Country</p>
                <p className="text-lg">
                  {companyData?.generalInfo?.country ||
                    defaultGeneralInfo.country}
                </p>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <p className="text-sm font-[700]">City</p>
                <p className="text-lg">
                  {companyData?.generalInfo?.city || defaultGeneralInfo.city}
                </p>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <p className="text-sm font-[700]">Office Address</p>
                <p className="text-lg">
                  {companyData?.generalInfo?.officeAddress ||
                    defaultGeneralInfo.officeAddress}
                </p>
              </div>
            </div>

            {/* Economic Activity */}
            <h2 className="text-2xl font-bold mb-4 border-b pb-2 flex justify-between items-center">
              Actividad Económica
              <button
                className="ml-4 text-blue-500"
                onClick={handleEditEconomicActivity}
              >
                Edit
              </button>
            </h2>

            <div className="border rounded shadow mb-8">
              <div className="grid grid-cols-3 md:grid-cols-4 p-4 bg-white">
                <div className="col-span-1 font-[700]">Corporate Purpose</div>
                <div className="col-span-2 md:col-span-3">
                  {companyData.economicActivity.corporatePurpose || "-"}
                </div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 p-4 bg-white">
                <div className="col-span-1 font-[700]">Main Activity</div>
                <div className="col-span-2 md:col-span-3">
                  {companyData.economicActivity.mainActivity || "-"}
                </div>
              </div>
            </div>

            {/* Company Administrators Table */}
            <h2 className="text-2xl font-bold mb-4 border-b pb-2 flex justify-between items-center">
              Company Administrators
              <button
                className="ml-4 text-blue-500"
                onClick={handleAddAdministrators}
              >
                Add
              </button>
            </h2>
            <div className="overflow-auto">
              <table className="min-w-full bg-white border rounded-lg mb-8">
                <thead>
                  <tr className="bg-gray-200">
                    {[
                      "ID",
                      "Name",
                      "Nationality",
                      "Position",
                      "Registration Date",
                      "Role",
                      "Actions", // Added Actions column
                    ].map((header) => (
                      <th
                        key={header}
                        className={`text-left p-2 text-sm font-[700] border-b ${
                          header === "ID" || header === "Name"
                            ? "text-left"
                            : "text-center"
                        }`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {companyData?.administrators?.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center p-4">
                        <Image
                          src="/error.svg"
                          alt="No Data"
                          width={120}
                          height={120}
                          className="mx-auto"
                        />
                        <p className="mt-2 text-gray-500">
                          No admin data available
                        </p>
                      </td>
                    </tr>
                  ) : (
                    companyData?.administrators?.map((admin, index) => (
                      <tr key={index} className="hover:bg-gray-100">
                        <td className="p-2 border-b text-sm">
                          {index + 1 || ""}
                        </td>
                        <td className="p-2 border-b text-sm">
                          {admin.name || ""}
                        </td>
                        <td className="p-2 border-b text-center text-sm">
                          {admin.nationality || ""}
                        </td>
                        <td className="p-2 border-b text-center text-sm">
                          {admin.position || ""}
                        </td>
                        <td className="p-2 border-b text-center text-sm">
                          {new Date(admin.registrationDate).toLocaleDateString(
                            "en-US"
                          ) || ""}
                        </td>
                        <td className="p-2 border-b text-center text-sm">
                          {admin.role || ""}
                        </td>
                        <td className="p-2 border-b text-center text-sm">
                          {/* Actions column with Edit and Delete icons */}
                          <button
                            onClick={() => handleEditAdministrators(admin._id)}
                            className="text-blue-500 mr-2"
                          >
                            <Edit2 size={18} />{" "}
                            {/* Edit icon from lucide-react */}
                          </button>
                          <button
                            onClick={() =>
                              deleteConfirmation(admin._id, "admin")
                            }
                            className="text-red-500"
                          >
                            <Trash2 size={18} />{" "}
                            {/* Delete icon from lucide-react */}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Company Passwords Table */}
            <h2 className="text-2xl font-bold mb-4 border-b pb-2 flex justify-between items-center">
              Company Passwords
              <button
                className="ml-4 text-blue-500"
                onClick={handleAddPasswords}
              >
                Add
              </button>
            </h2>
            <div className="overflow-auto">
              <table className="min-w-full bg-white border rounded-lg">
                <thead>
                  <tr className="bg-gray-200">
                    {[
                      "Site",
                      "User",
                      "Password",
                      "Last Updated",
                      "Actions",
                    ].map((header, index) => (
                      <th
                        key={header}
                        className={`p-2 text-sm font-[700] border-b ${
                          index === 2 ||
                          index === 3 ||
                          index === 1 ||
                          index === 4
                            ? "text-center"
                            : "text-left"
                        }`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {companyData?.passwords?.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center p-4">
                        <Image
                          src="/error.svg"
                          alt="No Data"
                          width={120}
                          height={120}
                          className="mx-auto"
                        />
                        <p className="mt-2 text-gray-500">
                          No password data available
                        </p>
                      </td>
                    </tr>
                  ) : (
                    companyData?.passwords?.map((password, index) => (
                      <tr key={index} className="hover:bg-gray-100">
                        {/* Display each password entry manually */}
                        <td className="p-2 border-b text-sm">
                          {password.site}
                        </td>
                        <td className="p-2 border-b text-center text-sm">
                          {password.user}
                        </td>
                        <td className="p-2 border-b text-center text-sm">
                          {password.password}
                        </td>
                        <td className="p-2 border-b text-center text-sm">
                          {new Date(password.updatedAt).toLocaleDateString(
                            "en-US"
                          ) || ""}
                        </td>
                        {/* Actions column with Edit and Delete buttons */}
                        <td className="p-2 border-b text-center text-sm">
                          <button
                            onClick={() =>
                              handleEditCompanyPassword(password._id)
                            }
                            className="text-blue-500 mr-2"
                          >
                            <Edit2 size={18} />{" "}
                            {/* Edit icon from lucide-react */}
                          </button>
                          <button
                            onClick={() =>
                              deleteConfirmation(password._id, "password")
                            }
                            className="text-red-500"
                          >
                            <Trash2 size={18} />{" "}
                            {/* Delete icon from lucide-react */}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={fetchDataAsync}
            data={editedInfo}
            isFor={infoType}
          />
        </>
      )}
      {/* Delete Confirmation Popup */}
      {isPopupOpen && (
        <Popup onClose={closePopup}>
          <h3 className="text-xl font-semibold mb-4">
            Are you sure you want to delete this?
          </h3>
          <div className="flex justify-end space-x-4 mt-4">
            <button
              onClick={closePopup}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white flex justify-center items-center px-4 py-2 rounded hover:bg-red-600"
            >
              {deleteSpinner ? <Spinner /> : "Delete"}
            </button>
          </div>
        </Popup>
      )}
    </MaxWidth>
  );
}

export default Home;
