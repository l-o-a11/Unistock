import React from "react";
import Button from "./../../shared/components/Button";

function AddButton({ onClick, label = "Agregar" }) {
  const plusIcon = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    ><circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );return (
    <Button onClick={onClick} variant="primary" icon={plusIcon}>
      {label}  </Button>
  );
}
export default AddButton;