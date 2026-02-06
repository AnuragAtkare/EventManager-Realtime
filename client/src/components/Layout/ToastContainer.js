import React from "react";
import { useToast } from "../../utils/toast";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

const icons = {
  success: <CheckCircle size={18} color="#00c853" />,
  error: <AlertCircle size={18} color="#ff5252" />,
  info: <Info size={18} color="#6c63ff" />,
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {icons[t.type]}
          <span style={{ flex: 1 }}>{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
