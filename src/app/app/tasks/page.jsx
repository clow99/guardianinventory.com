import TaskPage from "@/components/tasks/TaskPage";
import SessionWrapperClient from "@/components/SessionWrapperClient";

export default function Home() {
    return (
        <SessionWrapperClient>
            <div className="h-full p-6 mx-auto pb-[100px]">
                <TaskPage />
            </div>
        </SessionWrapperClient>
    );
}
