export const getInputStyleBox = (hasError) => ({
  width: "100%",
  padding: "10px 12px",
  borderRadius: "6px",
  border: hasError ? "2px solid #ff4fd6" : "1.5px solid #d1d5db",
  outline: "none",
  fontSize: "13px",
});

export const errorStyle = {
  color: "#ff4fd6",
  fontSize: "11px",
  marginTop: "4px",
  display: "block",
  fontWeight: "bold",
};


export const labelStyle = {
  display: "block",
  fontSize: "13px",
  marginBottom: "4px",
  color: "#444",
};

export const requiredStar = {
  color: "#ff4fd6",
  marginLeft: "4px",
};

export const btnPrimary = {
  padding: "10px 20px",
  borderRadius: "6px",
  border: "none",
  background: "#ff4fd6",
  color: "#fff",
  cursor: "pointer",
};

export const btnSecondary = {
  padding: "10px 20px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  background: "#f3f4f6",
  cursor: "pointer",
};