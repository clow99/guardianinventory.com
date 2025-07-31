import { NextResponse } from "next/server";
import { updateEmployee, getEmployeeById } from "@/lib/employeeHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { employee_id, ...updates } = body;

        if (!employee_id) {
            return NextResponse.json(
                { success: false, error: "employee_id is required." },
                { status: 400 }
            );
        }
        // Only allow updating non-empty fields
        const fields = Object.keys(updates).filter(
            (k) =>
                updates[k] !== undefined &&
                updates[k] !== null &&
                updates[k] !== ""
        );
        if (fields.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "At least one field to update is required.",
                },
                { status: 400 }
            );
        }

        await updateEmployee(employee_id, updates);
        const employee = await getEmployeeById(employee_id);

        return NextResponse.json({ success: true, data: employee });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error updating employee.",
            },
            { status: 500 }
        );
    }
}
