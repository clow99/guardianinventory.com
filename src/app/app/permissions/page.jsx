import { redirect } from "next/navigation";

export default function PermissionsIndex() {
    redirect("/app/permissions/view");
}

