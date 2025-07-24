"use client";

import AnimatedInput from "../inputs/AnimatedInput";
import AnimatedTextarea from "../inputs/AnimatedTextarea";
import AnimatedSelect from "../inputs/AnimatedSelect";
import AnimatedMultiSelect from "../inputs/AnimatedMultiSelect";
import { useState } from "react";
import AnimatedFileInput from "../inputs/AnimatedFileInput";
import AnimatedFileDrop from "../inputs/AnimatedFileDrop";
import AnimatedCheckbox from "../inputs/AnimatedCheckbox";
import AnimatedSwitch from "../inputs/AnimatedSwitch";
import AnimatedImageViewer from "../inputs/AnimatedImageViewer";
import AnimatedAvatarUploader from "../inputs/AnimatedAvatarUploader";
import AnimatedThemeCardSelector from "../inputs/AnimatedThemeCardSelector";

export default function ExampleForm() {
    const [inputValue, setInputValue] = useState("Guardian Inventory");
    const [textareaValue, setTextareaValue] = useState("Description");
    const [selectValue, setSelectValue] = useState("");
    const [roles, setRoles] = useState([]);
    const [files, setFiles] = useState([]);
    const [fileDropValue, setFileDropValue] = useState([]);
    const [checked, setChecked] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [imageViewerOpen, setImageViewerOpen] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [theme, setTheme] = useState("system");

    const [open, setOpen] = useState(false);
    const images = [
        { url: "/gear_blue.png" },
        { url: "/gear_green.png" },
        { url: "/gear_magenta.png" },
        { url: "/gear_cyan.png" },
    ];

    return (
        <div>
            <AnimatedInput
                label="Company Name"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder=""
            />
            <AnimatedTextarea
                label="Company Description"
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                rows={4}
                className="mt-4"
            />
            <AnimatedSelect
                label="Select Option"
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                id="select-option"
                options={[
                    { value: "", label: "Choose an option" },
                    { value: "option1", label: "Option 1" },
                    { value: "option2", label: "Option 2" },
                    { value: "option3", label: "Option 3" },
                ]}
                className="mt-4"
            />
            <AnimatedMultiSelect
                label="User Roles"
                id="roles"
                value={roles}
                onChange={setRoles}
                options={[
                    { value: "admin", label: "Admin" },
                    { value: "manager", label: "Manager" },
                    { value: "staff", label: "Staff" },
                    { value: "auditor", label: "Auditor" },
                ]}
            />
            <AnimatedFileInput
                label="Inventory Images"
                multiple={true}
                value={files}
                onChange={setFiles}
            />
            <AnimatedFileDrop
                label="Inventory Images"
                multiple={true}
                value={fileDropValue}
                onChange={setFileDropValue}
                className="mt-4"
            />
            <AnimatedCheckbox
                label="Mark as Active"
                id="active"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
            />
            <AnimatedSwitch
                id="my-switch"
                label="Enable inventory alerts"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
            />
            <div>
                <div className="flex gap-2 mt-4">
                    {images.map((img, i) => (
                        <img
                            key={i}
                            src={img.url}
                            className="w-20 h-20 rounded cursor-pointer border border-neutral-700 hover:border-orange-400 transition p-1"
                            onClick={() => setOpen(true)}
                            alt=""
                        />
                    ))}
                </div>
                <AnimatedImageViewer
                    images={images}
                    open={open}
                    initial={0}
                    onClose={() => setOpen(false)}
                />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-4">
                Public avatar
            </h2>
            <p className="mb-4 text-neutral-400">
                You can upload your avatar here or change it at{" "}
                <a
                    href="https://gravatar.com"
                    target="_blank"
                    rel="noopener"
                    className="text-blue-400 underline"
                >
                    gravatar.com
                </a>
                .
            </p>
            <AnimatedAvatarUploader
                value={avatar}
                onChange={(file, preview) => {
                    setAvatar(file);
                    setAvatarPreview(preview);
                }}
            />
            <AnimatedThemeCardSelector value={theme} onChange={setTheme} />
        </div>
    );
}
