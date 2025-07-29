export default function TaskPage() {
    return (
        <div className="grid grid-cols-3 gap-5 h-full">
            <div className="h-full flex flex-col gap-3">
                <div class="flex flex-row items-center w-full gap-2 2xl:mr-auto">
                    <div class="flex flex-row items-center gap-2">
                        <div class="h-4 w-4 rounded-full bg-red-500/60"></div>
                        <div class="text-neutral-200 font-bold lg:text-lg">
                            Uncompleted Tasks
                        </div>
                    </div>
                    <select class="ml-3 border ml-auto cursor-pointer border-neutral-700 h-8 text-neutral-400 hover:text-neutral-200 ease-in duration-200 rounded px-3 py-1 text-xs">
                        <option value="updated" selected="">
                            Last Updated
                        </option>
                        <option value="created">Created Date</option>
                        <option value="alpha">A-Z</option>
                        <option value="due-asc">Due Date ↑</option>
                        <option value="due-desc">Due Date ↓</option>
                    </select>
                </div>
                <div className="shadow-inner shadow-black bg-neutral-800 rounded h-full border border-neutral-700"></div>
            </div>
            <div className="h-full flex flex-col gap-3">
                <div class="flex flex-row items-center w-full gap-2 2xl:mr-auto">
                    <div class="flex flex-row items-center gap-2">
                        <div class="h-4 w-4 rounded-full bg-yellow-500/70"></div>
                        <div class="text-neutral-200 font-bold lg:text-lg">
                            Awaiting Approval
                        </div>
                    </div>
                    <select class="ml-3 border ml-auto cursor-pointer border-neutral-700 h-8 text-neutral-400 hover:text-neutral-200 ease-in duration-200 rounded px-3 py-1 text-xs">
                        <option value="updated" selected="">
                            Last Updated
                        </option>
                        <option value="created">Created Date</option>
                        <option value="alpha">A-Z</option>
                        <option value="due-asc">Due Date ↑</option>
                        <option value="due-desc">Due Date ↓</option>
                    </select>
                </div>
                <div className="shadow-inner shadow-black bg-neutral-800 rounded h-full border border-neutral-700"></div>
            </div>
            <div className="h-full flex flex-col gap-3">
                <div class="flex flex-row items-center w-full gap-2 2xl:mr-auto">
                    <div class="flex flex-row items-center gap-2">
                        <div class="h-4 w-4 rounded-full bg-green-500/60"></div>
                        <div class="text-neutral-200 font-bold lg:text-lg">
                            Completed
                        </div>
                    </div>
                    <select class="ml-3 border ml-auto cursor-pointer border-neutral-700 h-8 text-neutral-400 hover:text-neutral-200 ease-in duration-200 rounded px-3 py-1 text-xs">
                        <option value="updated" selected="">
                            Last Updated
                        </option>
                        <option value="created">Created Date</option>
                        <option value="alpha">A-Z</option>
                        <option value="due-asc">Due Date ↑</option>
                        <option value="due-desc">Due Date ↓</option>
                    </select>
                </div>
                <div className="shadow-inner shadow-black bg-neutral-800 rounded h-full border border-neutral-700"></div>
            </div>
        </div>
    );
}
