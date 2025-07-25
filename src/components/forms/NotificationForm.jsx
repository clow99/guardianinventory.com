"use client";
import { useState } from "react";
import AnimatedSwitch from "../inputs/AnimatedSwitch";

export default function NotificationForm({}) {
    const [enabled, setEnabled] = useState(true);

    return (
        <div className="flex flex-col p-10">
            <div>
                <div className="font-medium text-neutral-200 mb-1">
                    Notification Preferences
                </div>
                <div className="text-neutral-400 text-sm mb-4">
                    Select or customize your notification preferences.
                </div>
            </div>
            <div className="flex flex-col border-b border-neutral-700 pb-10">
                <div className="grid grid-cols-3 py-3">
                    <div></div>
                    <div className="flex flex-col">
                        <AnimatedSwitch
                            id="my-switch"
                            label="Enable notifications"
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                        />
                        <div className="text-neutral-400 text-sm pl-18">
                            Allow the application to send you notifications
                            about important updates and events.
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col border-b border-neutral-700 py-10">
                <div className="font-medium text-neutral-200 mb-1">
                    Email Notifications
                </div>
                <div className="text-neutral-400 text-sm mb-4">
                    Manage your email notification settings.
                </div>
                <div className="grid grid-cols-3 py-3">
                    <div></div>
                    <div className="flex flex-col">
                        <AnimatedSwitch
                            id="my-switch"
                            label="Low inventory alerts"
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                        />
                        <div className="text-neutral-400 text-sm pl-18">
                            lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Sed do eiusmod tempor incididunt ut labore et
                            dolore magna aliqua.
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-3 py-3">
                    <div></div>
                    <div className="flex flex-col">
                        <AnimatedSwitch
                            id="my-switch"
                            label="Low inventory alerts"
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                        />
                        <div className="text-neutral-400 text-sm pl-18">
                            lorem ipsum dolor sit amet, consectetur adipiscing
                            elit.
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-3 py-3">
                    <div></div>
                    <div className="flex flex-col">
                        <AnimatedSwitch
                            id="my-switch"
                            label="Low inventory alerts"
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                        />
                        <div className="text-neutral-400 text-sm pl-18">
                            lorem ipsum dolor sit amet, consectetur adipiscing
                            elit.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
