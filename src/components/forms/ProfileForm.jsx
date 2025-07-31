"use client";
import { useState } from "react";
import AnimatedInput from "../inputs/AnimatedInput";
import AnimatedTextarea from "../inputs/AnimatedTextarea";
import AnimatedAvatarUploader from "../inputs/AnimatedAvatarUploader";
import AnimatedSwitch from "../inputs/AnimatedSwitch";

export default function ProfileForm() {
    const [avatar, setAvatar] = useState(null);
    const [inputValue, setInputValue] = useState("Guardian Inventory");
    const [textareaValue, setTextareaValue] = useState("Description");
    const [enabled, setEnabled] = useState(true);

    return (
        <div className="flex flex-col p-2">
            <div className="flex flex-col border-b border-neutral-700 pb-10">
                <h1 className="text-2xl text-neutral-200 font-semibold">
                    Profile Settings
                </h1>
                <p className="text-neutral-400 text-sm mt-1">
                    Update your profile information. This will be displayed on
                    your profile page.
                </p>
                <AnimatedAvatarUploader
                    value={avatar}
                    onChange={(file, preview) => {
                        setAvatar(file);
                    }}
                />
            </div>
            <div className="flex flex-col border-b w-2/3 border-neutral-700 py-10">
                <h1 className="text-2xl text-neutral-200 font-semibold">
                    Display Name
                </h1>
                <p className="text-neutral-400 text-sm mt-1">
                    This is your name that will be displayed on your profile.
                </p>
                <div className="grid grid-cols-2 gap-5 mt-5">
                    <AnimatedInput
                        label="First Name"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder=""
                    />
                    <AnimatedInput
                        label="Last Name"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder=""
                    />
                </div>
            </div>
            <div className="flex flex-col border-b w-2/3 border-neutral-700 py-10">
                <h1 className="text-2xl text-neutral-200 font-semibold">
                    Contact Email
                </h1>
                <p className="text-neutral-400 text-sm mt-1">
                    This is the email address associated with your profile.
                </p>
                <div className="grid grid-cols-2 gap-5 mt-5">
                    <AnimatedInput
                        label="Email Name"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder=""
                    />
                    <AnimatedSwitch
                        id="my-switch"
                        label="Recieive Notifications"
                        checked={enabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                    />
                </div>
            </div>
        </div>
    );
}
