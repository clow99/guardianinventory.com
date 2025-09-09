"use client";
import TaskListBoard from "@/components/tasks/TaskListBoard";

export default function TasksPage() {
    return (
        <div className="h-full mx-auto pb-[100px] space-y-4">
            <h1 className="text-white text-2xl font-bold">Tasks</h1>
            <TaskListBoard />
        </div>
    );
}
