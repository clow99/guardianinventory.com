import { NextResponse } from "next/server";
import { deleteEmployee, getEmployeeById } from "@/lib/employeeHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        const { employee_id } = body;

        if (!employee_id) {
            return NextResponse.json(
                { success: false, error: "employee_id is required." },
                { status: 400 }
            );
        }

        await deleteEmployee(employee_id);
        const employee = await getEmployeeById(employee_id); // Might return null if filtering out deleted

        return NextResponse.json({ success: true, data: employee });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error deleting employee.",
            },
            { status: 500 }
        );
    }
}
