import { useState } from "react";
import { validateField, validateForm } from "../utils/validators";

export const useFormValidation = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateAll = () => {
    const newErrors = validateForm(formData);
    setErrors(newErrors);

    const touchedAll = {};
    Object.keys(formData).forEach(key => {
      touchedAll[key] = true;
    });
    setTouched(touchedAll);

    return !Object.values(newErrors).some(e => e);
  };

  return {
    formData,
    setFormData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll
  };
};