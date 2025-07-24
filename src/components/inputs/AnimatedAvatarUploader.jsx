"use client";

import { useRef, useState } from "react";

export default function AnimatedAvatarUploader({
    label = "Upload new avatar",
    info = "The ideal image size is 192 x 192 pixels. The maximum file size allowed is 200 KiB.",
    value,
    onChange,
    className = "",
    defaultSrc = "https://www.gravatar.com/avatar/?d=mp&s=192", // fallback avatar
    size = 100, // px
    ...rest
}) {
    const fileInputRef = useRef();
    const [preview, setPreview] = useState(value || defaultSrc);

    function handleChange(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setPreview(ev.target.result);
                onChange && onChange(file, ev.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    return (
        <div className={`flex items-center gap-6 py-4 ${className}`}>
            {/* Avatar Circle */}
            <div
                className={`flex items-center justify-center rounded-full overflow-hidden shadow`}
                style={{ width: size, height: size }}
            >
                <img
                    src={preview}
                    alt="Avatar preview"
                    className="object-cover w-full h-full"
                    draggable={false}
                />
            </div>
            {/* Upload area */}
            <div className="flex flex-col gap-2">
                <label className="font-medium text-neutral-200">{label}</label>
                <div className="flex items-center gap-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                        {...rest}
                    />
                    <button
                        type="button"
                        onClick={() =>
                            fileInputRef.current && fileInputRef.current.click()
                        }
                        className="px-4 py-2 rounded cursor-pointer bg-neutral-800 border border-neutral-700 text-neutral-200 hover:bg-neutral-700 transition"
                    >
                        Choose file...
                    </button>
                    <span
                        className={`${
                            preview && preview !== defaultSrc
                                ? "text-orange-400"
                                : "text-neutral-400"
                        } text-sm`}
                    >
                        {preview && preview !== defaultSrc
                            ? "1 file selected"
                            : "No file chosen."}
                    </span>
                </div>
                <div className="text-neutral-500 text-xs mt-1">{info}</div>
            </div>
        </div>
    );
}
