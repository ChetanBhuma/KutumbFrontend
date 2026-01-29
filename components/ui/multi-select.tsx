import * as React from "react";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Option {
    value: string;
    label: string;
}

interface MultiSelectProps {
    options: Option[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    maxCount?: number;
    className?: string;
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select items...",
    className,
    maxCount,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);

    const handleUnselect = (value: string) => {
        onChange(selected.filter((s) => s !== value));
    };

    const handleSelect = (value: string) => {
        if (selected.includes(value)) {
            handleUnselect(value);
        } else {
            if (maxCount && maxCount === 1) {
                onChange([value]); // Replace selection
                setOpen(false); // Close dropdown for single select
            } else {
                if (maxCount && selected.length >= maxCount) {
                    return; // Prevent selection if max reached
                }
                onChange([...selected, value]);
            }
        }
    };

    // Calculate selected options to display labels
    const selectedOptions = selected
        .map((s) => options.find((o) => o.value === s))
        .filter(Boolean) as Option[];

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between h-auto min-h-10 px-3 py-2 hover:bg-background",
                        className
                    )}
                    onClick={() => setOpen(!open)}
                >
                    <div className="flex gap-1 flex-wrap items-center text-left">
                        {selectedOptions.length > 0 ? (
                            selectedOptions.map((option) => (
                                <Badge
                                    key={option.value}
                                    variant="secondary"
                                    className="mr-1 mb-1"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent opening/closing when clicking badge
                                    }}
                                >
                                    {option.label}
                                    <div
                                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleUnselect(option.value);
                                            }
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnselect(option.value);
                                        }}
                                    >
                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </div>
                                </Badge>
                            ))
                        ) : (
                            <span className="text-muted-foreground font-normal">{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandList>
                        <CommandEmpty>No item found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label} // Use label for searching
                                    onSelect={() => {
                                        handleSelect(option.value);
                                        // Optional: close on select?
                                        // setOpen(false); // Creating multi-select usually stays open
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selected.includes(option.value)
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
