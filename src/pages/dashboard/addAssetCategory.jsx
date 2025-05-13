// Import necessary dependencies and config
import { Card, CardHeader, CardBody, Typography, Input, Button } from "@material-tailwind/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/configs/config"; // Use centralized config

export function AddAssetCategory() {
  const [assetCategories, setAssetCategories] = useState([]);
  const [assetCategory, setAssetCategory] = useState({ name: "" });
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedAssetCategoryId, setSelectedAssetCategoryId] = useState(null);

  // Fetch asset categories when the component mounts
  useEffect(() => {
    fetchAssetCategories();
  }, []);

  // Helper function to get authorization headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch all asset categories
  const fetchAssetCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/asset-categories`, {
        headers: getAuthHeaders(),
      });
      setAssetCategories(response.data);
    } catch (error) {
      console.error("Error fetching asset categories:", error);
      alert("Failed to load asset categories.");
    }
  };

  // Open modal for adding or editing
  const handleOpenModal = (type, assetCategoryData = null) => {
    setModalType(type);
    if (assetCategoryData) {
      setAssetCategory({ name: assetCategoryData.name });
      setSelectedAssetCategoryId(assetCategoryData._id);
    } else {
      setAssetCategory({ name: "" });
      setSelectedAssetCategoryId(null);
    }
    setOpenModal(true);
  };

  // Handle saving a new or updated asset category
  const handleSaveAssetCategory = async () => {
    if (!assetCategory.name.trim()) {
      alert("Asset Category name is required.");
      return;
    }

    try {
      if (modalType === "add") {
        await axios.post(`${API_BASE_URL}/asset-categories`, assetCategory, {
          headers: getAuthHeaders(),
        });
      } else {
        await axios.put(`${API_BASE_URL}/asset-categories/${selectedAssetCategoryId}`, assetCategory, {
          headers: getAuthHeaders(),
        });
      }
      fetchAssetCategories();
      setOpenModal(false);
    } catch (error) {
      console.error("Error saving asset category:", error);
      alert("There was an error saving the asset category.");
    }
  };

  // Handle deleting an asset category
  const handleDeleteAssetCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this asset category?")) {
      try {
        await axios.delete(`${API_BASE_URL}/asset-categories/${id}`, {
          headers: getAuthHeaders(),
        });
        fetchAssetCategories();
      } catch (error) {
        console.error("Error deleting asset category:", error);
        alert("Failed to delete asset category.");
      }
    }
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6 flex justify-between">
          <Typography variant="h6" color="white">
            Asset Categories
          </Typography>
          <Button color="white" size="sm" className="text-gray-700" onClick={() => handleOpenModal("add")}>
            + Add Asset Category
          </Button>
        </CardHeader>
        <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
          <table className="w-full min-w-[600px] table-auto">
            <thead>
              <tr>
                {["ID", "Category Name", "Actions"].map((el) => (
                  <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                    <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assetCategories.map((assetCategoryData, index) => (
                <tr key={assetCategoryData._id}>
                  <td className="py-3 px-5 border-b border-blue-gray-50">{index + 1}</td>
                  <td className="py-3 px-5 border-b border-blue-gray-50">{assetCategoryData.name}</td>
                  <td className="py-3 px-5 border-b border-blue-gray-50">
                    <Button
                      variant="text"
                      color="blue"
                      className="mr-2"
                      onClick={() => handleOpenModal("edit", assetCategoryData)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="text"
                      color="red"
                      onClick={() => handleDeleteAssetCategory(assetCategoryData._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {openModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <Typography variant="h5" color="blue-gray">
              {modalType === "add" ? "Add Asset Category" : "Edit Asset Category"}
            </Typography>
            <div className="mt-4 space-y-4">
              <Input
                label="Asset Category Name"
                value={assetCategory.name}
                onChange={(e) => setAssetCategory({ name: e.target.value })}
                maxLength={30} // Limit input length
              />
              <div className="flex justify-end gap-4 mt-4">
                <Button color="gray" onClick={() => setOpenModal(false)}>
                  Cancel
                </Button>
                <Button color="blue" onClick={handleSaveAssetCategory}>
                  {modalType === "add" ? "Add Category" : "Update Category"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddAssetCategory;
