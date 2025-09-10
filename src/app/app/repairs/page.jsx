"use client";
import TaskListBoard from "@/components/tasks/TaskListBoard";

export default function RepairsPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-white text-2xl font-bold">Repairs</h1>
            <TaskListBoard defaultQuery="repair" />
        </div>
    );
}
