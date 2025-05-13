import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Input,
    Button,
  } from "@material-tailwind/react";
  import { useState, useEffect } from "react";
  import axios from "axios";
  import { API_BASE_URL } from "@/configs/config"; // Use centralized config
  
  export function AddCoursesCategory() {
    const [courseCategories, setCourseCategories] = useState([]);
    const [courseCategory, setCourseCategory] = useState({ name: "" });
    const [openModal, setOpenModal] = useState(false);
    const [modalType, setModalType] = useState("add");
    const [selectedCourseCategoryId, setSelectedCourseCategoryId] = useState(null);
  
    // Fetch course categories when the component mounts
    useEffect(() => {
      fetchCourseCategories();
    }, []);
  
    // Helper function to get authorization headers
    const getAuthHeaders = () => {
      const token = localStorage.getItem("adminToken");
      return token ? { Authorization: `Bearer ${token}` } : {};
    };
  
    // Fetch all course categories
    const fetchCourseCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/course-categories`, {
          headers: getAuthHeaders(),
        });
        setCourseCategories(response.data);
      } catch (error) {
        console.error("Error fetching course categories:", error);
        alert("Failed to load course categories.");
      }
    };
  
    // Open modal for adding or editing
    const handleOpenModal = (type, courseCategoryData = null) => {
      setModalType(type);
      if (courseCategoryData) {
        setCourseCategory({ name: courseCategoryData.name });
        setSelectedCourseCategoryId(courseCategoryData._id);
      } else {
        setCourseCategory({ name: "" });
        setSelectedCourseCategoryId(null);
      }
      setOpenModal(true);
    };
  
    // Handle saving a new or updated course category
    const handleSaveCourseCategory = async () => {
      if (!courseCategory.name.trim()) {
        alert("Course Category name is required.");
        return;
      }
  
      try {
        if (modalType === "add") {
          await axios.post(`${API_BASE_URL}/course-categories`, courseCategory, {
            headers: getAuthHeaders(),
          });
        } else {
          await axios.put(`${API_BASE_URL}/course-categories/${selectedCourseCategoryId}`, courseCategory, {
            headers: getAuthHeaders(),
          });
        }
        fetchCourseCategories();
        setOpenModal(false);
      } catch (error) {
        console.error("Error saving course category:", error);
        alert("There was an error saving the course category.");
      }
    };
  
    // Handle deleting a course category
    const handleDeleteCourseCategory = async (id) => {
      if (window.confirm("Are you sure you want to delete this course category?")) {
        try {
          await axios.delete(`${API_BASE_URL}/course-categories/${id}`, {
            headers: getAuthHeaders(),
          });
          fetchCourseCategories();
        } catch (error) {
          console.error("Error deleting course category:", error);
          alert("Failed to delete course category.");
        }
      }
    };
  
    return (
      <div className="mt-12 mb-8 flex flex-col gap-12">
        <Card>
          <CardHeader variant="gradient" color="gray" className="mb-8 p-6 flex justify-between">
            <Typography variant="h6" color="white">
              Course Categories
            </Typography>
            <Button color="white" size="sm" className="text-gray-700" onClick={() => handleOpenModal("add")}>
              + Add Course Category
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
                {courseCategories.map((courseCategoryData, index) => (
                  <tr key={courseCategoryData._id}>
                    <td className="py-3 px-5 border-b border-blue-gray-50">{index + 1}</td>
                    <td className="py-3 px-5 border-b border-blue-gray-50">{courseCategoryData.name}</td>
                    <td className="py-3 px-5 border-b border-blue-gray-50">
                      <Button
                        variant="text"
                        color="blue"
                        className="mr-2"
                        onClick={() => handleOpenModal("edit", courseCategoryData)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="text"
                        color="red"
                        onClick={() => handleDeleteCourseCategory(courseCategoryData._id)}
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
                {modalType === "add" ? "Add Course Category" : "Edit Course Category"}
              </Typography>
              <div className="mt-4 space-y-4">
                <Input
                  label="Course Category Name"
                  value={courseCategory.name}
                  onChange={(e) => setCourseCategory({ name: e.target.value })}
                  maxLength={30} // Limit input length
                />
                <div className="flex justify-end gap-4 mt-4">
                  <Button color="gray" onClick={() => setOpenModal(false)}>
                    Cancel
                  </Button>
                  <Button color="blue" onClick={handleSaveCourseCategory}>
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
  
  export default AddCoursesCategory;
  