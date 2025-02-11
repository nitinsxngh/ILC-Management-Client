import { Card, CardHeader, CardBody, Typography, Avatar, Select, Option, Button } from "@material-tailwind/react";
import { useState, useEffect } from "react";
import axios from "axios";
import AdminModal from "@/components/AdminModal"; // Importing the modal component
import { API_BASE_URL } from "@/configs/config"; // Import centralized API config

export function Admins() {
  const [data, setData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [admin, setAdmin] = useState({
    img: "",
    name: "",
    email: "",
    job: ["", ""],
    status: "active",
    date: "",
    access: "viewer",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminToken"); // Assume the token is stored in localStorage
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admins`, {
        headers: getAuthHeaders(),
      });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      if (error.response && error.response.status === 401) {
        alert("You are not authorized. Please log in again.");
        // You can add a redirect to login page here if needed
      }
    }
  };

  const handleOpenModal = (type, adminData = null) => {
    setModalType(type);
    if (adminData) {
      setAdmin(adminData);
    } else {
      setAdmin({
        img: "",
        name: "",
        email: "",
        job: ["", ""],
        status: "active",
        date: "",
        access: "viewer",
        password: "",
        confirmPassword: "",
      });
    }
    setOpenModal(true);
  };

  const handleSaveAdmin = async () => {
    // Check if required fields are filled
    if (!admin.name || !admin.email || !admin.job[0] || !admin.job[1]) {
      alert("Please fill all required fields.");
      return;
    }
  
    // Only check password when adding a new admin
    if (modalType === "add") {
      if (!admin.password || !admin.confirmPassword) {
        alert("Password and Confirm Password are required.");
        return;
      }
      if (admin.password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
      }
      if (admin.password !== admin.confirmPassword) {
        alert("Passwords do not match.");
        return;
      }
    } else {
      // Remove password fields from update request if empty
      if (!admin.password) {
        delete admin.password;
        delete admin.confirmPassword;
      }
    }
  
    try {
      if (modalType === "add") {
        await axios.post(`${API_BASE_URL}/admins/register`, admin, {
          headers: getAuthHeaders(),
        });
      } else {
        await axios.put(`${API_BASE_URL}/admins/${admin.email}`, admin, {
          headers: getAuthHeaders(),
        });
      }
      fetchAdmins();
      setOpenModal(false);
    } catch (error) {
      console.error("Error saving admin:", error);
      alert("There was an error saving the admin. Please try again.");
    }
  };
  

  const getRandomAvatar = () => {
    const randomString = Math.random().toString(36).substring(7); // Generates a random string
    return `https://robohash.org/${randomString}?size=150x150`; // RoboHash URL
  };

  const handleStatusChange = async (key, e) => {
    const updatedData = [...data];
    updatedData[key].status = e;
    setData(updatedData);

    // Send PUT request to update status in the backend
    try {
      await axios.put(`${API_BASE_URL}/admins/${updatedData[key].email}`, {
        ...updatedData[key],
        status: e, // Update the status
      }, {
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleAccessChange = async (key, e) => {
    const updatedData = [...data];
    updatedData[key].access = e;
    setData(updatedData);

    // Send PUT request to update access in the backend
    try {
      await axios.put(`${API_BASE_URL}/admins/${updatedData[key].email}`, {
        ...updatedData[key],
        access: e, // Update the access
      }, {
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error("Error updating access:", error);
    }
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6 flex justify-between">
          <Typography variant="h6" color="white">
            Admins Table
          </Typography>
          <Button color="white" size="sm" className="text-gray-700" onClick={() => handleOpenModal("add")}>
            + Add Admin
          </Button>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[800px] table-auto">
            <thead>
              <tr>
                {["employee", "function", "status", "access", "created", "actions"].map((el) => (
                  <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                    <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((adminData, key) => (
                <tr key={adminData.email}>
                  <td className="py-3 px-5 border-b border-blue-gray-50">
                    <div className="flex items-center gap-4">
                      <Avatar src={getRandomAvatar()} alt={adminData.name} size="sm" variant="rounded" />
                      <div>
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                          {adminData.name}
                        </Typography>
                        <Typography className="text-xs font-normal text-blue-gray-500">
                          {adminData.email}
                        </Typography>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-5 border-b border-blue-gray-50">
                    <Typography className="text-xs font-semibold text-blue-gray-600">
                      {adminData.job[0]}
                    </Typography>
                    <Typography className="text-xs font-normal text-blue-gray-500">
                      {adminData.job[1]}
                    </Typography>
                  </td>
                  <td className="py-3 px-5 border-b border-blue-gray-50">
                    <Select
                      value={adminData.status}
                      onChange={(e) => handleStatusChange(key, e)}
                      menuPlacement="bottom" // Ensure the dropdown opens below the select element
                    >
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                    </Select>
                  </td>
                  <td className="py-3 px-5 border-b border-blue-gray-50">
                    <Select
                      value={adminData.access}
                      onChange={(e) => handleAccessChange(key, e)}
                      menuPlacement="bottom" // Ensure the dropdown opens below the select element
                    >
                      <Option value="admin">Admin</Option>
                      <Option value="editor">Editor</Option>
                      <Option value="viewer">Viewer</Option>
                    </Select>
                  </td>
                  <td className="py-3 px-5 border-b text-sm border-blue-gray-50">
                    {new Date(adminData.createdAt).toLocaleDateString("en-US", {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-5 border-b border-blue-gray-50">
                    <Button variant="text" color="blue" onClick={() => handleOpenModal("edit", adminData)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <AdminModal
        open={openModal}
        handleClose={() => setOpenModal(false)}
        admin={admin}
        setAdmin={setAdmin}
        handleSaveAdmin={handleSaveAdmin}
        modalType={modalType}
      />
    </div>
  );
}

export default Admins;
