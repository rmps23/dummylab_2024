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
      className={`fixed inset-0 flex items-start justify-center z-50 bg-black bg-opacity-50 transition-opacity ${modalVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      onClick={handleOverlayClick}
    >
      <div
        className={`bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg w-full h-full max-w-lg md:h-auto md:max-w-md mx-2 md:mx-auto mt-20 md:mt-40 transition-transform ${modalVisible ? "scale-100" : "scale-95"
          }`}
      >
        <div className="p-6">
          <button className="absolute top-4 right-4" onClick={onClose}>
            <GrClose />
          </button>
          <div className="px-4 py-10">{content}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
