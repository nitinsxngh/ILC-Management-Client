import { API_BASE_URL } from "@/configs/config";  // Import centralized API config
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { DocumentTextIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import LibraryModal from "@/components/LibraryModal";

export function Library() {
  const [openMenuId, setOpenMenuId] = useState(null); // Tracks the open menu's ID
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [libraryAsset, setLibraryAsset] = useState({
    assetId: "",
    fileUrl: "",
    category: "",
    name: "",
    description: "",
    price: "",
    date: "",
  });
  const [assets, setAssets] = useState([]);

  // Fetch all assets when the component mounts
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/library/assets`);  // Use API_BASE_URL
        if (!response.ok) {
          throw new Error("Failed to fetch assets");
        }
        const data = await response.json();
        setAssets(data);
      } catch (error) {
        console.error("Error fetching assets:", error);
      }
    };
    fetchAssets();
  }, []);

  const handleMenuClick = (assetId) => {
    setOpenMenuId((prevId) => (prevId === assetId ? null : assetId)); // Toggle the menu for each specific asset
  };

  const handleOpenModal = (type, asset = null) => {
    setModalType(type);
    if (asset) {
      setLibraryAsset(asset);
    } else {
      setLibraryAsset({
        assetId: "",
        fileUrl: "",
        category: "",
        name: "",
        description: "",
        price: "",
        date: "",
      });
    }
    setOpenModal(true);
  };

  const handleSaveAsset = async () => {
    try {
      const timestamp = new Date().toISOString(); // Get current timestamp
  
      const url =
        modalType === "add"
          ? `${API_BASE_URL}/library/assets`  // Use API_BASE_URL
          : `${API_BASE_URL}/library/assets/${libraryAsset.assetId}`;  // Use API_BASE_URL
  
      const method = modalType === "add" ? "POST" : "PUT";
  
      // Add timestamp to the asset data
      const assetData = { ...libraryAsset, timestamp };
  
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assetData),
      });

      if (!response.ok) {
        throw new Error(`${modalType === "add" ? "Failed to add" : "Failed to update"} asset`);
      }

      const result = await response.json();
      console.log(
        `${modalType === "add" ? "Asset added" : "Asset updated"} successfully:`,
        result.asset
      );
      
      setAssets((prevAssets) => {
        if (modalType === "add") {
          return [...prevAssets, result.asset];
        } else {
          return prevAssets.map((asset) =>
            asset.assetId === libraryAsset.assetId ? result.asset : asset
          );
        }
      });

      setOpenModal(false); // Close modal after saving
    } catch (error) {
      console.error("Error saving asset:", error);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/library/assets/${assetId}`, {  // Use API_BASE_URL
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete asset");
      }

      console.log("Asset deleted successfully");
      setAssets(assets.filter((asset) => asset.assetId !== assetId)); // Remove deleted asset
    } catch (error) {
      console.error("Error deleting asset:", error);
    }
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-8 p-6 flex justify-between items-center"
        >
          <Typography variant="h6" color="white">
            Library
          </Typography>
          <Button
            color="white"
            size="sm"
            className="text-gray-700"
            onClick={() => handleOpenModal("add")}
          >
            + Add Asset
          </Button>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["ID", "File", "Category", "Title", "Description", "Price", "Timestamp", "Actions"].map(
                  (el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, index) => {
                const className = `py-3 px-5 ${index === assets.length - 1 ? "" : "border-b border-blue-gray-50"}`;

                return (
                  <tr key={asset.assetId}>
                    <td className={className}>
                      <Typography variant="small" color="blue-gray" className="font-semibold">
                        {index + 1}  {/* Sequence number */}
                      </Typography>
                    </td>
                    <td className={className}>
                      {asset.fileUrl ? (
                        <a href={asset.fileUrl} target="_blank" rel="noopener noreferrer">
                            <DocumentTextIcon className="h-6 w-6 text-[#800000]" /> {/* Maroon color */}
                        </a>
                        ) : (
                        "No File"
                       )}
                     </td>
                    <td className={className}>
                      <Typography variant="small" color="blue-gray" className="font-semibold">
                        {asset.category}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography variant="small" color="blue-gray" className="font-semibold">
                        {asset.name && asset.name.length > 30 ? asset.name.slice(0, 30) + "..." : asset.name || "No name"}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-normal text-blue-gray-500">
                        {asset.description && asset.description.length > 30 ? asset.description.slice(0, 30) + "..." : asset.description || "No description"}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography variant="small" color="blue-gray" className="font-semibold">
                        ₹{asset.price}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-normal text-blue-gray-500">
                        {new Date(asset.timestamp).toLocaleString()}
                      </Typography>
                    </td>
                    <td className={className}>
                      {/* Ensure menu is only open for the specific asset */}
                      <Menu open={openMenuId === asset.assetId} handler={() => handleMenuClick(asset.assetId)}>
                        <MenuHandler>
                          <Button variant="text" className="p-0">
                            <EllipsisVerticalIcon className="h-5 w-5 text-blue-gray-500 cursor-pointer" />
                          </Button>
                        </MenuHandler>
                        <MenuList>
                          <MenuItem onClick={() => handleOpenModal("edit", asset)}>Edit</MenuItem>
                          <MenuItem onClick={() => handleDeleteAsset(asset.assetId)} className="text-red-500">
                            Delete
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Library Modal */}
      <LibraryModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        asset={libraryAsset}
        setAsset={setLibraryAsset}
        onSave={handleSaveAsset}
        type={modalType}
      />
    </div>
  );
}

export default Library;
