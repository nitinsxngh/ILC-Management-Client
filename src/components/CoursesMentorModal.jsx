import { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Select,
  Option,
} from "@material-tailwind/react";
import { API_BASE_URL } from "@/configs/config";

export default function CourseMentorModal({
  open,
  onClose,
  mentor,
  setMentor,
  onSave,
  type,
}) {
  const [errors, setErrors] = useState({
    mentorName: false,
    mentorEmail: false,
    professionType: false,
    specialization: false,
  });

  const [emailValid, setEmailValid] = useState(true);
  const [specializations, setSpecializations] = useState([]);
  const [loadingSpecializations, setLoadingSpecializations] = useState(false);

  // Reset form errors & fetch specializations on modal open
  useEffect(() => {
    if (open) {
      setErrors({
        mentorName: false,
        mentorEmail: false,
        professionType: false,
        specialization: false,
      });
      fetchSpecializations();
    }
  }, [open]);

  // Validate email when email changes
  useEffect(() => {
    if (mentor.mentorEmail) {
      validateEmail(mentor.mentorEmail);
    }
  }, [mentor.mentorEmail]);

  // Fetch list of specializations
  const fetchSpecializations = async () => {
    setLoadingSpecializations(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/course-categories`);
      const data = response.data;
      setSpecializations(data);

      // Optional: Auto-select first specialization if none is selected
      if (!mentor.specialization && data.length > 0) {
        setMentor((prev) => ({ ...prev, specialization: data[0].name }));
      }
    } catch (error) {
      console.error("Error fetching specializations:", error);
    } finally {
      setLoadingSpecializations(false);
    }
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailPattern.test(email));
  };

  const validateForm = () => {
    const newErrors = {
      mentorName: !mentor.mentorName,
      mentorEmail: !mentor.mentorEmail || !emailValid,
      professionType: !mentor.professionType,
      specialization: !mentor.specialization,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave();
    }
  };

  return (
    <Dialog open={open} handler={onClose} size="md">
      <DialogHeader>{type === "add" ? "Add New Mentor" : "Edit Mentor"}</DialogHeader>
      <DialogBody className="grid gap-4">
        <Input
          label="Mentor Name"
          value={mentor.mentorName || ""}
          onChange={(e) =>
            setMentor((prev) => ({ ...prev, mentorName: e.target.value }))
          }
          error={errors.mentorName}
        />

        <Input
          label="Mentor Email"
          value={mentor.mentorEmail || ""}
          onChange={(e) =>
            setMentor((prev) => ({ ...prev, mentorEmail: e.target.value }))
          }
          error={errors.mentorEmail || !emailValid}
          onBlur={() => validateEmail(mentor.mentorEmail)}
        />
        {!emailValid && (
          <span className="text-red-500 text-sm -mt-3">Invalid email format</span>
        )}

        <Select
          label="Profession Type"
          value={mentor.professionType || ""}
          onChange={(value) =>
            setMentor((prev) => ({ ...prev, professionType: value }))
          }
          error={errors.professionType}
        >
          <Option value="Professor">Professor</Option>
          <Option value="Professional">Professional</Option>
        </Select>

        <Select
          key={specializations.length} // forces re-render when specializations load
          label="Specialization"
          value={mentor.specialization || ""}
          onChange={(value) =>
            setMentor((prev) => ({ ...prev, specialization: value }))
          }
          error={errors.specialization}
        >
          {loadingSpecializations ? (
            <Option value="" disabled>
              Loading...
            </Option>
          ) : (
            specializations.map((spec) => (
              <Option key={spec.id} value={spec.name}>
                {spec.name}
              </Option>
            ))
          )}
        </Select>
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="gray" onClick={onClose}>
          Cancel
        </Button>
        <Button
          color="blue"
          onClick={handleSave}
          disabled={
            !mentor.mentorName ||
            !mentor.mentorEmail ||
            !emailValid ||
            !mentor.professionType ||
            !mentor.specialization
          }
        >
          {type === "add" ? "Add Mentor" : "Save Changes"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
