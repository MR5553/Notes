import { useEffect, useMemo, useState, type HTMLAttributes } from "react";
import * as Popover from "@radix-ui/react-popover";
import { useDebounce } from "../hook/useDebounce";
import Loader from "./Loader";
import { Field } from "./Field";


type EmojiSkin = {
    native: string;
};

type Emoji = {
    id: string;
    name: string;
    keywords: string[];
    skins: EmojiSkin[];
};

type Category = {
    id: string;
    emojis: string[];
};

type EmojiData = {
    emojis: Record<string, Emoji>;
    categories: Category[];
};

interface PickerProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
    onSelect: (emoji: string) => void;
}

export default function Picker({ children, onSelect, ...props }: PickerProps) {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<EmojiData | null>(null);
    const [search, setSearch] = useState("");

    const debouncedSearch = useDebounce(search);
    const q = debouncedSearch.toLowerCase();

    const Categories = useMemo(() => {
        if (!data) return [];

        return data.categories.map((category) => {
            const emojis = category.emojis
                .map((id) => data.emojis[id])
                .filter(Boolean)
                .filter((emoji) => !q || emoji.name.toLowerCase().includes(q) || emoji.keywords.some((k) => k.toLowerCase().includes(q)));

            return emojis.length ? { id: category.id, emojis } : null;
        }).filter(Boolean) as { id: string; emojis: Emoji[] }[];
    }, [data, q]);

    useEffect(() => {
        (async function () {
            fetch("https://cdn.jsdelivr.net/npm/@emoji-mart/data")
                .then((res) => res.json())
                .then(setData)
                .catch(() => setData(null));
        })()
    }, []);


    if (!data) return <Loader />

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                {children}
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    side="bottom"
                    align="center"
                    sideOffset={6}
                    className="z-50 w-sm"
                >
                    <div className="max-w-md w-82 max-h-96 bg-secondry flex flex-col gap-2 p-2 rounded-xl border border-border" {...props}>
                        <Field>
                            <Field.Control>
                                <Field.Input
                                    name="Search icon"
                                    id="icon"
                                    placeholder="Search emojis..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </Field.Control>
                        </Field>

                        {data &&
                            <div className="flex flex-col overflow-y-auto scrollbar">
                                {Categories.map((category) => (
                                    <div key={category.id}>
                                        <span className="text-xs text-muted px-2 capitalize">
                                            {category.id}
                                        </span>

                                        <div
                                            className="grid gap-1"
                                            style={{
                                                gridTemplateColumns:
                                                    "repeat(auto-fill, minmax(2em, 1fr))",
                                            }}
                                        >
                                            {category.emojis.map((emoji) => {
                                                const native = emoji.skins[0]?.native;
                                                if (!native) return null;

                                                return (
                                                    <button
                                                        key={emoji.id}
                                                        type="button"
                                                        aria-label={emoji.name}
                                                        title={emoji.name}
                                                        className="text-2xl cursor-pointer rounded hover:bg-layer-4"
                                                        onClick={() => {
                                                            onSelect(native);
                                                            setOpen(false);
                                                        }}
                                                    >
                                                        {native}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}