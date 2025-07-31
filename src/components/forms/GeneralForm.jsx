"use client";
import { useState } from "react";
import AnimatedInput from "../inputs/AnimatedInput";
import AnimatedTextarea from "../inputs/AnimatedTextarea";
import AnimatedAvatarUploader from "../inputs/AnimatedAvatarUploader";

export default function GeneralForm() {
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [inputValue, setInputValue] = useState("Guardian Inventory");
    const [textareaValue, setTextareaValue] = useState("Description");

    return (
        <div className="flex flex-col p-2">
            <div className="flex flex-col border-b border-neutral-700 pb-10">
                <h1 className="text-2xl text-neutral-200 font-semibold">
                    Company Logo
                </h1>
                <p className="text-neutral-400 text-sm mt-1">
                    Upload a logo for your company. This will be displayed on
                    the site.
                </p>
                <AnimatedAvatarUploader
                    value={avatar}
                    onChange={(file, preview) => {
                        setAvatar(file);
                        setAvatarPreview(preview);
                    }}
                />
            </div>
            <div className="flex flex-col border-b border-neutral-700 py-10">
                <h1 className="text-2xl text-neutral-200 font-semibold">
                    Company Name
                </h1>
                <p className="text-neutral-400 text-sm mt-1">
                    This is the name of your company that will be displayed on
                    the site.
                </p>
                <div className="grid grid-cols-2 mt-5">
                    <AnimatedInput
                        label="Company Name"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder=""
                    />
                </div>
            </div>
            <div className="flex flex-col border-b border-neutral-700 py-10">
                <h1 className="text-xl text-neutral-200 font-semibold">
                    Company Description
                </h1>
                <p className="text-neutral-400 text-sm mt-1">
                    This is the description of your company that will be
                    displayed on the site.
                </p>
                <div className="grid grid-cols-2 mt-5">
                    <AnimatedTextarea
                        label="Company Description"
                        value={textareaValue}
                        onChange={(e) => setTextareaValue(e.target.value)}
                        rows={4}
                        className="mt-4"
                    />
                </div>
            </div>
        </div>
    );
}
