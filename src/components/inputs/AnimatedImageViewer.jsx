"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function AnimatedImageViewer({
    images,
    open,
    initial = 0,
    onClose,
}) {
    const [current, setCurrent] = useState(initial);

    useEffect(() => {
        if (open) setCurrent(initial);
    }, [open, initial]);

    useEffect(() => {
        if (!open) return;
        function handleKey(e) {
            if (e.key === "Escape") onClose && onClose();
            if (images.length > 1) {
                if (e.key === "ArrowLeft")
                    setCurrent((c) => (c > 0 ? c - 1 : c));
                if (e.key === "ArrowRight")
                    setCurrent((c) => (c < images.length - 1 ? c + 1 : c));
            }
        }
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [open, images.length, onClose]);

    if (!open) return null;

    const imgSrc = images[current]?.url || images[current];

    // Button styles
    const btn =
        "group w-10 h-10 cursor-pointer flex items-center justify-center rounded-lg text-neutral-300 bg-transparent hover:bg-neutral-700 transition border-0";
    const icon =
        "w-6 h-6 text-neutral-400 group-hover:text-orange-500 ease-in-out duration-200";

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                {/* Top bar with nav, dots, close */}
                <div className="absolute top-0 left-0 w-full flex items-center justify-between px-4 py-4 pointer-events-auto select-none z-10">
                    {/* Nav buttons on the left */}
                    <div className="flex items-center gap-2">
                        {images.length > 1 && (
                            <>
                                <button
                                    className={btn}
                                    disabled={current === 0}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrent((c) => Math.max(0, c - 1));
                                    }}
                                    style={{
                                        opacity: current === 0 ? 0.5 : 1,
                                        pointerEvents:
                                            current === 0 ? "none" : "auto",
                                    }}
                                    tabIndex={0}
                                    type="button"
                                >
                                    <ChevronLeft className={icon} />
                                </button>
                                <button
                                    className={btn}
                                    disabled={current === images.length - 1}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrent((c) =>
                                            Math.min(images.length - 1, c + 1)
                                        );
                                    }}
                                    style={{
                                        opacity:
                                            current === images.length - 1
                                                ? 0.5
                                                : 1,
                                        pointerEvents:
                                            current === images.length - 1
                                                ? "none"
                                                : "auto",
                                    }}
                                    tabIndex={0}
                                    type="button"
                                >
                                    <ChevronRight className={icon} />
                                </button>
                            </>
                        )}
                    </div>
                    {/* Clickable dots */}
                    {images.length > 1 && (
                        <div className="flex gap-2">
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    aria-label={`Go to image ${i + 1}`}
                                    className={`inline-block w-2.5 h-2.5 rounded-full transition 
                                        ${
                                            i === current
                                                ? "bg-orange-400 shadow"
                                                : "bg-neutral-700 hover:bg-orange-400/50"
                                        }`}
                                    style={{
                                        border:
                                            i === current
                                                ? "2px solid #fb923c"
                                                : "2px solid transparent",
                                        outline: "none",
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrent(i);
                                    }}
                                    tabIndex={0}
                                />
                            ))}
                        </div>
                    )}
                    {/* Close button */}
                    <button
                        className={btn + " ml-2"}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose && onClose();
                        }}
                        aria-label="Close"
                        tabIndex={0}
                        type="button"
                    >
                        <X className={icon} />
                    </button>
                </div>

                {/* Centered image, fits viewport */}
                <motion.div
                    className="relative flex flex-col items-center justify-center w-full h-full pointer-events-auto"
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.98, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <img
                        src={imgSrc}
                        alt=""
                        className="max-h-[80vh] max-w-[96vw] w-auto h-auto rounded object-contain select-none"
                        draggable={false}
                    />
                </motion.div>

                {/* Bottom preview thumbnails */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 pointer-events-auto z-20">
                        {images.map((img, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrent(i);
                                }}
                                className={`
                                    relative group w-20 h-20 rounded overflow-hidden border
                                    transition-all duration-150 cursor-pointer
                                    ${
                                        i === current
                                            ? "border-orange-400"
                                            : "border-neutral-700 hover:border-orange-400"
                                    }
                                     flex items-center justify-center p-1
                                `}
                                tabIndex={0}
                                aria-label={`Preview image ${i + 1}`}
                            >
                                <img
                                    src={img.url || img}
                                    alt={`Preview ${i + 1}`}
                                    className={`
                                        object-cover w-full h-full rounded
                                        
                                        transition
                                    `}
                                    draggable={false}
                                />
                            </button>
                        ))}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
