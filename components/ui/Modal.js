'use client';

import { useState, useEffect } from 'react';
import { GrClose } from "react-icons/gr";

const Modal = ({ show, onClose, children }) => {
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
            className={`fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity ${modalVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={handleOverlayClick}
        >
            <div
                className={`bg-zinc-800 rounded-lg shadow-lg overflow-hidden w-full h-full max-w-lg md:h-auto md:max-w-md mx-2 md:mx-auto transition-transform ${modalVisible ? 'scale-100' : 'scale-95'}`}
            >
                <div className="p-10">
                    <button className="absolute top-4 right-4" onClick={onClose}>
                        <GrClose />
                    </button>
                    <div className="mt-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
