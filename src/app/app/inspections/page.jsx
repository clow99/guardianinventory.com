"use client";
import TaskListBoard from "@/components/tasks/TaskListBoard";

export default function InspectionsPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-white text-2xl font-bold">Inspections</h1>
            <TaskListBoard defaultQuery="inspect" />
        </div>
    );
}
