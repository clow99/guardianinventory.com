"use client";

import MenuCalendar from "../calendar/MenuCalendar";
import AnimatedCheckbox from "../inputs/AnimatedCheckbox";

export default function CalendarMenu() {
    return (
        <div className="w-full flex flex-col">
            <div className="border-b border-neutral-700">
                <MenuCalendar />
            </div>
            <div className="flex flex-col p-2">
                <div className="text-sm text-neutral-400">My Calendars</div>
                <AnimatedCheckbox
                    label="Work Schedule"
                    className="mt-1"
                    defaultChecked={true}
                />
                <AnimatedCheckbox
                    label="Personal Events"
                    className="mt-1"
                    defaultChecked={true}
                />
            </div>
        </div>
    );
}
