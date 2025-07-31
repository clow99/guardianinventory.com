import { NextResponse } from "next/server";
import { createEmployee, getEmployeeById } from "@/lib/employeeHelper";

export async function POST(request) {
    try {
        const body = await request.json();
        // Typically need at least user_id, job_title, department
        const { user_id, job_title, department, custom_fields } = body;
        if (!user_id || !job_title) {
            return NextResponse.json(
                {
                    success: false,
                    error: "user_id and job_title are required.",
                },
                { status: 400 }
            );
        }

        const employee_id = await createEmployee({
            user_id,
            job_title,
            department,
            custom_fields,
        });
        const employee = await getEmployeeById(employee_id);

        return NextResponse.json({ success: true, data: employee });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error adding employee.",
            },
            { status: 500 }
        );
    }
}
