export default function Tooltip({ label, children, side = "right" }) {
    // Tooltip positions
    let position =
        side === "right"
            ? "left-full top-1/2 -translate-y-1/2 ml-2"
            : side === "left"
            ? "right-full top-1/2 -translate-y-1/2 mr-2"
            : side === "top"
            ? "bottom-full left-1/2 -translate-x-1/2 mb-2"
            : "top-full left-1/2 -translate-x-1/2 mt-2"; // bottom

    return (
        <div className="relative inline-flex items-center group">
            {children}
            <div
                className={`pointer-events-none absolute ${position} z-20 px-2 py-1 rounded-md bg-neutral-900 text-white text-xs opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-150 whitespace-nowrap shadow-lg`}
            >
                {label}
            </div>
        </div>
    );
}
