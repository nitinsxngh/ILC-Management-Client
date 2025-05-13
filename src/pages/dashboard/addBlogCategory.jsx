import { Card, CardHeader, CardBody, Typography, Input, Button } from "@material-tailwind/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/configs/config"; // Import centralized API config

export function AddBlogCategory() {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState({
    name: "",
  });
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Helper function to get authorization headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/blog-categories`, {
        headers: getAuthHeaders(),
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Failed to load categories.");
    }
  };

  // Open modal for adding or editing
  const handleOpenModal = (type, categoryData = null) => {
    setModalType(type);
    if (categoryData) {
      setCategory({ name: categoryData.name });
      setSelectedCategoryId(categoryData._id);
    } else {
      setCategory({ name: "" });
      setSelectedCategoryId(null);
    }
    setOpenModal(true);
  };

  // Save a new or updated category
  const handleSaveCategory = async () => {
    if (!category.name.trim()) {
      alert("Category name is required.");
      return;
    }

    try {
      if (modalType === "add") {
        await axios.post(`${API_BASE_URL}/blog-categories`, category, {
          headers: getAuthHeaders(),
        });
      } else {
        await axios.put(`${API_BASE_URL}/blog-categories/${selectedCategoryId}`, category, {
          headers: getAuthHeaders(),
        });
      }
      fetchCategories();
      setOpenModal(false);
    } catch (error) {
      console.error("Error saving category:", error);
      alert("There was an error saving the category.");
    }
  };

  // Delete a category
  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`${API_BASE_URL}/blog-categories/${id}`, {
          headers: getAuthHeaders(),
        });
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Failed to delete category.");
      }
    }
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6 flex justify-between">
          <Typography variant="h6" color="white">
            Blog Categories
          </Typography>
          <Button color="white" size="sm" className="text-gray-700" onClick={() => handleOpenModal("add")}>
            + Add New Category
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
              {categories.map((categoryData, index) => (
                <tr key={categoryData._id}>
                  <td className="py-3 px-5 border-b border-blue-gray-50">{index + 1}</td>
                  <td className="py-3 px-5 border-b border-blue-gray-50">{categoryData.name}</td>
                  <td className="py-3 px-5 border-b border-blue-gray-50">
                    <Button
                      variant="text"
                      color="blue"
                      className="mr-2"
                      onClick={() => handleOpenModal("edit", categoryData)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="text"
                      color="red"
                      onClick={() => handleDeleteCategory(categoryData._id)}
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
              {modalType === "add" ? "Add Blog Category" : "Edit Blog Category"}
            </Typography>
            <div className="mt-4 space-y-4">
              <Input
                label="Category Name"
                value={category.name}
                onChange={(e) => setCategory({ name: e.target.value })}
                maxLength={30}
              />
              <div className="flex justify-end gap-4 mt-4">
                <Button color="gray" onClick={() => setOpenModal(false)}>
                  Cancel
                </Button>
                <Button color="blue" onClick={handleSaveCategory}>
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

export default AddBlogCategory;
