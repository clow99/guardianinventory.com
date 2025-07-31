import TaskPage from "@/components/tasks/TaskPage";
import SessionWrapperClient from "@/components/SessionWrapperClient";

export default function Home() {
    return (
        <SessionWrapperClient>
            <div className="h-full mx-auto pb-[100px]">
                <TaskPage />
            </div>
        </SessionWrapperClient>
    );
}
