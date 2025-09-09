import { redirect } from "next/navigation";

export default function AppIndex() {
    // Send users to the main dashboard when visiting /app
    redirect("/app/dashboard");
}
