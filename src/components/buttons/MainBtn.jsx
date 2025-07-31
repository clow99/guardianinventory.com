import Link from "next/link";

export default function MainBtn({ label, href, icon: Icon, onClick }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="bg-orange-500/80 whitespace-nowrap text-white rounded px-4 py-2 text-sm hover:bg-orange-500 transition cursor-pointer"
        >
            {label}
        </Link>
    );
}
