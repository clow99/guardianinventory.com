// src/components/Modal.jsx
"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

export default function Modal({
    isOpen,
    onClose,
    children,
    ariaLabel = "Dialog",
}) {
    // close on ESC
    useEffect(() => {
        function handleEsc(e) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    // Prevent scrolling when open
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => (document.body.style.overflow = "");
    }, [isOpen]);

    // nothing until mounted + open
    if (typeof document === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                // backdrop
                <motion.div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    {/* stop clicks from bubbling */}
                    <motion.div
                        className="bg-neutral-900 rounded border border-neutral-700 p-6 max-w-2xl w-full mx-4 relative"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                        }}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label={ariaLabel}
                    >
                        {/* close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 text-neutral-400 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 rounded"
                            aria-label="Close dialog"
                        >
                            ✕
                        </button>

                        {/* your modal content */}
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
