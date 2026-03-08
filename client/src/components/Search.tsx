import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePages } from "../store/usePage";
import { Button } from "./Button";
import { IoSearchSharp as SearchIcon } from "react-icons/io5"
import { RiCommandLine as Command } from "react-icons/ri";
import { Field } from "./Field";


export default function Search() {
    const { pages } = usePages();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("");

    const Pages = useMemo(() => {
        return pages.filter((p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [pages, searchQuery]);


    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setOpen(true);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);


    return (
        <Dialog.Root open={open} onOpenChange={(value) => setOpen(value)}>
            <Dialog.Trigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    title="Search pages"
                >
                    <SearchIcon className="size-4" /> Search
                    <span
                        className="ml-auto inline-flex items-center gap-px text-xs bg-background px-1 py-px rounded"
                    >
                        <Command /> K
                    </span>
                </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-999 bg-black/40" />
                <Dialog.Content
                    aria-describedby="search pages"
                    title="search pages"
                    className="fixed max-w-md w-full bg-secondry backdrop-blur-2xl rounded-lg shadow-xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-9999 outline outline-border p-2"
                >
                    <Field>
                        <Field.Control>
                            <Field.Icon children={<SearchIcon className="size-4" />} />
                            <Field.Input
                                name="Search document"
                                type="search"
                                value={searchQuery}
                                placeholder="Search document here.."
                                autoComplete="off"
                                autoFocus
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </Field.Control>
                    </Field>

                    <div className="max-h-96 overflow-y-auto scrollbar mt-4">
                        {Pages.map((page) => (
                            <Button
                                variant="ghost"
                                key={page.id}
                                className="w-full py-2 justify-start"
                                onClick={() => {
                                    navigate(`/pages/${page.id}`);
                                    setOpen(false);
                                }}
                            >
                                {page.icon} {page.title}
                            </Button>
                        ))}

                        {Pages.length === 0 && (
                            <p className="text-sm text-muted p-2">
                                No results found
                            </p>
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}