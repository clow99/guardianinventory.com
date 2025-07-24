import AppearanceForm from "@/components/forms/AppearanceForm";
import { cookies } from "next/headers";

export default function SettingsPage() {
    const cookieStore = cookies();
    const accentColour = cookieStore.get("accent-color")?.value || "#f97316";

    return (
        <div>
            <AppearanceForm initialColor={accentColour} />
        </div>
    );
}
