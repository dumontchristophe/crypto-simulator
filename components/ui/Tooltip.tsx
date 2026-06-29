export default function Tooltip({ tip }: { tip: string }) {
    return (
        <span className="relative group inline-flex">
            <span className="flex h-3.5 w-3.5 cursor-help shrink-0 items-center justify-center rounded-full border border-blue-sky/30 bg-blue-sky/10 text-[9px] italic text-blue-light">i</span>
            <span className="pointer-events-none absolute left-0 top-full z-50 mt-2 w-72 rounded-none rounded-tr-2xl rounded-bl-2xl border border-blue-sky/20 bg-[#111d33] p-4 text-xs font-light text-white opacity-0 shadow-2xl transition-opacity group-hover:opacity-100">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-blue-sky/30 bg-blue-sky/10 text-[11px] italic text-blue-light">i</span>
                <span className="mt-3 block">{tip}</span>
            </span>
        </span>
    )
}
