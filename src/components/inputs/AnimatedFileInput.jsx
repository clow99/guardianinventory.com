"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UploadCloud, X } from "lucide-react";

export default function AnimatedFileInput({
    label = "Upload File",
    id = "file",
    multiple = false,
    value,
    onChange,
    className = "",
    ...rest
}) {
    const [isFocused, setIsFocused] = useState(false);
    const [internalFiles, setInternalFiles] = useState([]);
    const fileInputRef = useRef();
    const wrapperRef = useRef();

    // Controlled/uncontrolled support
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
        // If no files left, remove focus immediately
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
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div ref={wrapperRef} className={`relative w-full py-2 ${className}`}>
            <motion.label
                htmlFor={id}
                initial={false}
                animate={{
                    x: isFloating ? 8 : 16,
                    y: isFloating ? -5 : 18,
                    scale: isFloating ? 0.85 : 1,
                    color: isFloating ? "#fb923c" : "#a3a3a3",
                    backgroundColor: isFloating ? "#262626" : "transparent",
                    paddingLeft: isFloating ? 3 : 0,
                    paddingRight: isFloating ? 3 : 0,
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
            <button
                type="button"
                tabIndex={0}
                onClick={() => {
                    setIsFocused(true);
                    fileInputRef.current && fileInputRef.current.click();
                }}
                className={`w-full h-12 px-4 flex items-center gap-2 rounded border-2 transition bg-neutral-800
                    ${isFocused ? "border-orange-500" : "border-neutral-700"}
                    text-neutral-100 cursor-pointer outline-none focus:border-orange-500`}
            >
                {isFloating && (
                    <>
                        <UploadCloud className="w-5 h-5 text-orange-400" />
                        <span className="text-sm flex flex-wrap items-center gap-2">
                            {files && files.length > 0
                                ? files.map((f, idx) => (
                                      <span
                                          key={f.name + idx}
                                          className="flex items-center gap-1 bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded text-xs"
                                      >
                                          {f.name}
                                          <button
                                              tabIndex="-1"
                                              className="ml-1 text-orange-400 hover:text-orange-600 focus:outline-none"
                                              type="button"
                                              onClick={(e) =>
                                                  handleRemove(idx, e)
                                              }
                                          >
                                              ×
                                          </button>
                                      </span>
                                  ))
                                : "Select file(s)"}
                        </span>
                    </>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    id={id}
                    multiple={multiple}
                    onChange={handleChange}
                    className="hidden"
                    {...rest}
                />
            </button>
        </div>
    );
}
