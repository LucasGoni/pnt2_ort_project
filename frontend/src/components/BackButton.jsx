import { useNavigate } from "react-router-dom";

const BackButton = ({ label = "Volver" }) => {
  const navigate = useNavigate();
  return (
    <button type="button" className="back-btn" onClick={() => navigate(-1)}>
      ← {label}
    </button>
  );
};

export default BackButton;
