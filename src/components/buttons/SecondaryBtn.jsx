export default function SecondaryBtn({ label, href, icon: Icon, onClick }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-2 p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
            {Icon && <Icon className="w-5 h-5" />}
            {label}
        </Link>
    );
}
