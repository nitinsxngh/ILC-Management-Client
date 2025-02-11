import { Card, CardHeader, CardBody, Typography, Avatar, Select, Option, Button } from "@material-tailwind/react";
import { useState, useEffect } from "react";
import axios from "axios";
import AdminModal from "@/components/AdminModal"; // Importing the modal component
import { API_BASE_URL } from "@/configs/config"; // Import centralized API config

export function Admins() {
  const [data, setData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [adminRole, setAdminRole] = useState(localStorage.getItem("adminRole") || "viewer"); // Get role from localStorage

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
    const token = localStorage.getItem("adminToken");
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
    if (!admin.name || !admin.email || !admin.job[0] || !admin.job[1]) {
      alert("Please fill all required fields.");
      return;
    }

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

  const handleStatusChange = async (key, e) => {
    const updatedData = [...data];
    updatedData[key].status = e;
    setData(updatedData);

    try {
      await axios.put(`${API_BASE_URL}/admins/${updatedData[key].email}`, {
        ...updatedData[key],
        status: e,
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

    try {
      await axios.put(`${API_BASE_URL}/admins/${updatedData[key].email}`, {
        ...updatedData[key],
        access: e,
      }, {
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error("Error updating access:", error);
    }
  };

  if (adminRole === "viewer" || adminRole === "editor") {
    return (
      <div className="mt-12 mb-8 flex flex-col items-center">
        <Typography variant="h6" color="red">
          Access Denied
        </Typography>
        <Typography className="text-gray-600">
          You do not have permission to view this page.
        </Typography>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6 flex justify-between">
          <Typography variant="h6" color="white">
            Admins Table
          </Typography>
          {adminRole === "admin" && (
            <Button color="white" size="sm" className="text-gray-700" onClick={() => handleOpenModal("add")}>
              + Add Admin
            </Button>
          )}
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[800px] table-auto">
            <thead>
              <tr>
                {["Employee", "Function", "Status", "Access", "Created", "Actions"].map((el) => (
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
                      <Avatar src={adminData.img || "https://placehold.co/150"} alt={adminData.name} size="sm" variant="rounded" />
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
                    <Select value={adminData.status} onChange={(e) => handleStatusChange(key, e)}>
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                    </Select>
                  </td>
                  <td className="py-3 px-5 border-b border-blue-gray-50">
                    <Select value={adminData.access} onChange={(e) => handleAccessChange(key, e)}>
                      <Option value="admin">Admin</Option>
                      <Option value="editor">Editor</Option>
                      <Option value="viewer">Viewer</Option>
                    </Select>
                  </td>
                  <td className="py-3 px-5 border-b text-sm border-blue-gray-50">
                    {new Date(adminData.createdAt).toLocaleDateString("en-US")}
                  </td>
                  <td className="py-3 px-5 border-b border-blue-gray-50">
                    {adminRole === "admin" && (
                      <Button variant="text" color="blue" onClick={() => handleOpenModal("edit", adminData)}>
                        Edit
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <AdminModal open={openModal} handleClose={() => setOpenModal(false)} admin={admin} setAdmin={setAdmin} handleSaveAdmin={handleSaveAdmin} modalType={modalType} />
    </div>
  );
}

export default Admins;
