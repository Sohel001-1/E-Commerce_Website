import React, { useState, useRef, useEffect } from "react";

const SearchableSelect = ({ options, value, onChange, placeholder = "Select...", label, id }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const containerRef = useRef(null);
    const listRef = useRef(null);
    const inputRef = useRef(null);

    const filtered = options.filter((opt) =>
        opt.toLowerCase().includes(search.toLowerCase())
    );

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Scroll highlighted item into view
    useEffect(() => {
        if (listRef.current && highlightIndex >= 0) {
            const items = listRef.current.children;
            if (items[highlightIndex]) {
                items[highlightIndex].scrollIntoView({ block: "nearest" });
            }
        }
    }, [highlightIndex]);

    const selectOption = (opt) => {
        onChange(opt);
        setIsOpen(false);
        setSearch("");
        setHighlightIndex(-1);
    };

    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === "ArrowDown" || e.key === "Enter") {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightIndex((prev) => Math.min(prev + 1, filtered.length - 1));
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightIndex((prev) => Math.max(prev - 1, 0));
                break;
            case "Enter":
                e.preventDefault();
                if (highlightIndex >= 0 && filtered[highlightIndex]) {
                    selectOption(filtered[highlightIndex]);
                }
                break;
            case "Escape":
                setIsOpen(false);
                setSearch("");
                setHighlightIndex(-1);
                break;
            default:
                break;
        }
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Display button — shows current value, click to open */}
            <div
                onClick={() => {
                    setIsOpen((prev) => !prev);
                    setTimeout(() => inputRef.current?.focus(), 0);
                }}
                className={`flex w-full cursor-pointer items-center justify-between rounded border bg-white px-3 py-2 text-sm ${isOpen ? "border-gray-600 ring-1 ring-gray-600" : "border-gray-300"
                    }`}
            >
                <span className={value ? "text-gray-900" : "text-gray-400"}>
                    {value || placeholder}
                </span>
                <svg
                    className={`ml-2 h-4 w-4 shrink-0 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full rounded border border-gray-300 bg-white shadow-lg">
                    {/* Search input */}
                    <div className="border-b border-gray-200 p-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setHighlightIndex(0);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Type to search..."
                            className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
                            autoFocus
                        />
                    </div>

                    {/* Options list */}
                    <ul
                        ref={listRef}
                        className="max-h-48 overflow-y-auto py-1"
                    >
                        {filtered.length > 0 ? (
                            filtered.map((opt, i) => (
                                <li
                                    key={opt}
                                    onClick={() => selectOption(opt)}
                                    className={`cursor-pointer px-3 py-1.5 text-sm transition-colors ${opt === value
                                            ? "bg-blue-50 font-medium text-blue-700"
                                            : i === highlightIndex
                                                ? "bg-gray-100 text-gray-900"
                                                : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    {opt}
                                </li>
                            ))
                        ) : (
                            <li className="px-3 py-2 text-sm text-gray-400 italic">
                                No results found
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
