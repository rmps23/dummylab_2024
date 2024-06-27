"use client";

import { useState, useEffect } from "react";
import { GrClose } from "react-icons/gr";

const Modal = ({ show, onClose, content }) => {
  const [modalVisible, setModalVisible] = useState(show);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    if (show) {
      setModalVisible(true);
    } else {
      setTimeout(() => setModalVisible(false), 100);
    }
  }, [show]);

  return (
    <div
      className={`fixed inset-0 flex items-start justify-center z-50 bg-opacity-80 backdrop-blur-sm transition-opacity ${modalVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      onClick={handleOverlayClick}
    >
      <div
        className={`bg-zinc-950/80 backdrop-blur-sm border border-zinc-700 rounded-lg shadow-lg w-full h-screen pt-10 transition-transform overflow-y-scroll ${modalVisible ? "scale-100" : "scale-95"
          }`}
      >
        <div className="p-6 max-w-2xl mx-auto">
          <button className="w-full px-4 flex justify-end" onClick={onClose}>
            <GrClose />
          </button>
          <div className="px-4 py-10">{content}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
