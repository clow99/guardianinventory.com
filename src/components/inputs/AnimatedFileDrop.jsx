"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UploadCloud, X } from "lucide-react";

export default function AnimatedFileInput({
    label = "Upload File(s)",
    id = "file",
    multiple = false,
    value,
    onChange,
    className = "",
    ...rest
}) {
    const [isFocused, setIsFocused] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [internalFiles, setInternalFiles] = useState([]);
    const fileInputRef = useRef();
    const wrapperRef = useRef();

    const files = value !== undefined ? value : internalFiles;
    const isFloating = isFocused || (files && files.length > 0);

    function handleChange(e) {
        const selected = Array.from(e.target.files || []);
        const existing = files || [];
        const all = [
            ...existing,
            ...selected.filter(
                (f) =>
                    !existing.some(
                        (ef) => ef.name === f.name && ef.size === f.size
                    )
            ),
        ];
        if (onChange) {
            onChange(all);
        } else {
            setInternalFiles(all);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    function handleRemove(idx, e) {
        e.stopPropagation();
        const newFiles = files.filter((_, i) => i !== idx);
        if (onChange) {
            onChange(newFiles);
        } else {
            setInternalFiles(newFiles);
        }
        if (newFiles.length === 0 && fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        if (newFiles.length === 0) setIsFocused(false);
    }

    // Click-away detection
    useEffect(() => {
        function handleClick(event) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setIsFocused(false);
                setIsDragging(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // --- Drag and drop events ---
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setIsFocused(true);
    }
    function handleDragEnter(e) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setIsFocused(true);
    }
    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        setIsFocused(true);
        const dropped = Array.from(e.dataTransfer.files || []);
        if (dropped.length === 0) return;
        const existing = files || [];
        const all = [
            ...existing,
            ...dropped.filter(
                (f) =>
                    !existing.some(
                        (ef) => ef.name === f.name && ef.size === f.size
                    )
            ),
        ];
        if (onChange) {
            onChange(all);
        } else {
            setInternalFiles(all);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    return (
        <div ref={wrapperRef} className={`relative w-full py-2 ${className}`}>
            <motion.label
                htmlFor={id}
                initial={false}
                animate={{
                    x: isFloating ? 12 : 24,
                    y: isFloating ? -8 : 20,
                    scale: isFloating ? 0.88 : 1,
                    color: isFloating ? "#fb923c" : "#a3a3a3",
                    backgroundColor: isFloating ? "#262626" : "transparent",
                    paddingLeft: isFloating ? 6 : 0,
                    paddingRight: isFloating ? 6 : 0,
                }}
                transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 23,
                }}
                className="absolute pointer-events-none z-10 px-1 py-1"
                style={{
                    top: 0,
                    left: 0,
                    borderRadius: 4,
                    fontSize: isFloating ? "0.85rem" : "1rem",
                    lineHeight: 1.2,
                }}
            >
                {label}
            </motion.label>
            <div
                tabIndex={0}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onClick={() => {
                    setIsFocused(true);
                    fileInputRef.current && fileInputRef.current.click();
                }}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    group w-full flex flex-col items-center justify-center 
                    min-h-[120px] h-auto px-6 py-8 rounded transition
                    border-2
                    ${
                        isDragging
                            ? "border-orange-500 bg-orange-950/70"
                            : isFocused
                            ? "border-orange-500 bg-neutral-800"
                            : "border-dashed border-neutral-700 bg-neutral-800"
                    }
                    cursor-pointer outline-none relative
                    duration-150
                `}
            >
                <UploadCloud
                    className={`w-9 h-9 mb-2 transition ${
                        isDragging
                            ? "text-orange-400 scale-110 animate-bounce"
                            : "text-neutral-400 group-hover:text-orange-400"
                    }`}
                />
                <span
                    className={`text-base font-medium mb-1 ${
                        isDragging ? "text-orange-400" : "text-neutral-300"
                    }`}
                >
                    {isDragging
                        ? "Drop files here"
                        : files && files.length > 0
                        ? ""
                        : "Drag and drop files here"}
                </span>
                <span className="text-xs text-neutral-400 opacity-80">
                    or click to select {multiple ? "files" : "a file"}
                </span>
                <input
                    ref={fileInputRef}
                    type="file"
                    id={id}
                    multiple={multiple}
                    onChange={handleChange}
                    className="hidden"
                    {...rest}
                />
                {/* File previews (if files exist) */}
                {files && files.length > 0 && (
                    <div className="w-full flex flex-wrap gap-2 justify-center mt-4">
                        {files.map((f, idx) => (
                            <span
                                key={f.name + idx}
                                className="flex items-center gap-1 bg-orange-500/20 text-orange-400 px-3 py-1 rounded text-xs"
                            >
                                {f.name}
                                <button
                                    tabIndex="-1"
                                    className="ml-1 text-orange-400 hover:text-orange-600 focus:outline-none"
                                    type="button"
                                    onClick={(e) => handleRemove(idx, e)}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
