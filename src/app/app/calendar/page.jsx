import PageCalendar from "@/components/calendar/PageCalendar";

export default function Home() {
    return (
        <div className="flex flex-col gap-3">
            <div>
                <PageCalendar />
            </div>
        </div>
    );
}
