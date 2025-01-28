import { Dialog, DialogHeader, DialogBody, DialogFooter, Input, Button } from "@material-tailwind/react";

export function AdminModal({ open, handleClose, admin, setAdmin, handleSaveAdmin, modalType }) {
  const handlePasswordChange = (e) => {
    setAdmin({ ...admin, password: e.target.value });
  };

  const handleConfirmPasswordChange = (e) => {
    setAdmin({ ...admin, confirmPassword: e.target.value });
  };

  const isPasswordValid = () => {
    return admin.password === admin.confirmPassword;
  };

  return (
    <Dialog open={open} handler={handleClose}>
      <DialogHeader>{modalType === "add" ? "Add New Admin" : "Edit Admin"}</DialogHeader>
      <DialogBody className="grid gap-4">
        <Input 
          label="Name" 
          value={admin.name} 
          maxLength={30} // Limit name to 30 characters
          onChange={(e) => setAdmin({ ...admin, name: e.target.value })} 
        />
        <Input 
          label="Email" 
          value={admin.email} 
          maxLength={60} // Limit email to 60 characters
          onChange={(e) => setAdmin({ ...admin, email: e.target.value })} 
        />
        <Input 
          label="Job Title" 
          value={admin.job[0]} 
          maxLength={30} // Limit job title to 30 characters
          onChange={(e) => setAdmin({ ...admin, job: [e.target.value, admin.job[1]] })} 
        />
        <Input 
          label="Department" 
          value={admin.job[1]} 
          maxLength={30} // Limit department to 30 characters
          onChange={(e) => setAdmin({ ...admin, job: [admin.job[0], e.target.value] })} 
        />
        <Input 
          label="Password" 
          type="password" 
          onChange={handlePasswordChange} 
        />
        <Input 
          label="Confirm Password" 
          type="password" 
          onChange={handleConfirmPasswordChange} 
        />
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="gray" onClick={handleClose}>
          Cancel
        </Button>
        <Button color="blue" onClick={handleSaveAdmin} disabled={!isPasswordValid()}>
          {modalType === "add" ? "Add Admin" : "Save Changes"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default AdminModal;
