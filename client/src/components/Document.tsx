import { useState } from "react";
import { useParams } from "react-router-dom";
import * as Popover from "@radix-ui/react-popover";
import type { Node, Page } from "../types";
import { Button } from "./Button";
import { cn } from "../lib/utils";
import { HiOutlineDocumentDuplicate as Duplicate } from "react-icons/hi";
import { HiMiniArrowUturnRight as TurnRight } from "react-icons/hi2";
import { TbEditCircle as Rename } from "react-icons/tb";
import { TbExternalLink as Link } from "react-icons/tb";
import { RiFileListFill as File } from "react-icons/ri";
import { HiChevronRight as Chevron } from "react-icons/hi";
import { LuTrash2 as Trash } from "react-icons/lu";
import { HiMiniPlus as Plus } from "react-icons/hi2";
import { MdMoreHoriz as More } from "react-icons/md";
import { TiStarOutline as Star } from "react-icons/ti";
import { TbStarOff as StarOff } from "react-icons/tb";
import { usePages } from "../store/usePage";
import { Field } from "./Field";
import { toast } from "sonner";


type DocumentProps = {
    page: Node;
    level: number;
    onSelect: (page: Node) => void;
    expanded: Set<string>;
    toggleExpand: (id: string) => void;
};

const INDENT = 18;

export default function Document({ page, level, expanded, toggleExpand, onSelect }: DocumentProps) {
    const { createPage } = usePages();
    const { pageId } = useParams();
    const isExpanded = expanded.has(page.id);
    const hasNode = page.nodes.length > 0;

    return (
        <>
            <div
                role="button"
                style={{ paddingLeft: level * INDENT + 6 }}
                className={cn("w-full min-h-6 inline-flex items-center justify-start gap-1 hover:bg-secondry rounded-md text-sm text-primary font-medium transition-colors cursor-pointer py-1 pr-2 group", page.id === pageId && "bg-secondry-foreground")}
                onClick={() => onSelect(page)}
            >
                <Button
                    variant="ghost"
                    size="icon_sm"
                    title="Add a page inside"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(page.id);
                    }}
                >
                    <div className="relative size-4 flex items-center justify-center">
                        <Chevron
                            className={cn(
                                "absolute size-4 transition-all duration-300 opacity-0 group-hover:opacity-100",
                                isExpanded && "rotate-90"
                            )}
                        />
                        <span className="absolute transition-all duration-150 opacity-100 group-hover:opacity-0">
                            {page.icon ?? <File className="size-4" />}
                        </span>
                    </div>
                </Button>

                <span className="w-full h-full text-start truncate text-sm">{page.title}</span>

                <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100">
                    <DocumentAction page={page} />

                    <Button
                        variant="ghost"
                        size="icon_sm"
                        title="Add a page inside"
                        onClick={() => createPage(page.id, page.isFavorite)}
                    >
                        <Plus className="size-4" />
                    </Button>
                </div>
            </div>

            {(hasNode && isExpanded) && (
                page.nodes.map(node => (
                    <Document
                        key={node.id}
                        page={node}
                        level={level + 1}
                        expanded={expanded}
                        toggleExpand={toggleExpand}
                        onSelect={onSelect}
                    />
                ))
            )}

            {(!hasNode && isExpanded) && (
                <span
                    className="min-h-6 text-xs text-muted py-1"
                    style={{ paddingLeft: (level + 1) * INDENT + 6 }}
                >
                    No pages inside
                </span>
            )}
        </>
    )
}

function DocumentAction({ page }: { page: Page }) {
    const { pages, movePage, updatePage, duplicatePage, deletePage } = usePages();
    const [open, setOpen] = useState(false);
    const [rename, setRename] = useState<string>("")

    const url = `${import.meta.env.VITE_CLIENT_URL}/app/page/${page.id}`

    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <Button
                    variant="ghost"
                    size="icon_sm"
                    title="More"
                    onClick={(e) => e.stopPropagation()}
                >
                    <More className="size-4" />
                </Button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    side="right"
                    align="start"
                    sideOffset={6}
                    className="w-40 bg-secondry flex flex-col gap-1 rounded-md border border-border shadow-lg z-99 p-1"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updatePage(page.id, { isFavorite: !page.isFavorite })}
                    >
                        {page.isFavorite ? <StarOff className="size-4" /> : <Star className="size-4" />}
                        {page.isFavorite ? "Remove from favorite" : "Add to favorites"}
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            navigator.clipboard.writeText(url);
                            toast.info("Link copied.")
                        }}
                    >
                        <Link className="size-4" /> Copy link
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => duplicatePage(page.id)}
                    >
                        <Duplicate className="size-4" /> Duplicate
                    </Button>

                    <Popover.Root>
                        <Popover.Trigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                            >
                                <Rename className="size-4" /> Rename
                            </Button>
                        </Popover.Trigger>
                        <Popover.Portal>
                            <Popover.Content
                                side="right"
                                align="start"
                                sideOffset={6}
                                className="w-60 max-h-60 bg-secondry flex flex-col gap-2 rounded-md border border-border overflow-y-auto shadow-lg z-999 p-2 scrollbar"
                            >
                                <Field>
                                    <Field.Control>
                                        <Field.Input
                                            name="Rename"
                                            type="text"
                                            value={rename}
                                            placeholder="Enter title"
                                            onChange={(e) => setRename(e.target.value)}
                                        />
                                    </Field.Control>
                                </Field>

                                <Button
                                    variant="default"
                                    size="sm"
                                    className="justify-center"
                                    onClick={() => {
                                        updatePage(page.id, { title: rename });
                                        setOpen(false);
                                    }}
                                >
                                    Update now
                                </Button>
                            </Popover.Content>
                        </Popover.Portal>
                    </Popover.Root>

                    <Popover.Root open={open} onOpenChange={setOpen}>
                        <Popover.Trigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                            >
                                <TurnRight className="size-4" /> Move to
                            </Button>
                        </Popover.Trigger>
                        <Popover.Portal>
                            <Popover.Content
                                side="right"
                                align="start"
                                sideOffset={6}
                                className="w-60 max-h-60 bg-secondry flex flex-col gap-1 rounded-md border border-border overflow-y-auto shadow-lg z-999 p-1.5 scrollbar"
                            >
                                {!!page.parent && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start truncate"
                                        onClick={() => {
                                            movePage(page.id);
                                            setOpen(false);
                                        }}
                                    >
                                        Move to root
                                    </Button>
                                )}

                                {!pages.filter(p => p.id !== page.id).length && (
                                    <span className="text-xs text-gray-400 px-2">
                                        No such page inside
                                    </span>
                                )}

                                {pages.filter(p => p.id !== page.id).map(p => (
                                    <Button
                                        key={p.id}
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start truncate"
                                        onClick={() => {
                                            movePage(page.id, p.id);
                                            setOpen(false);
                                        }}
                                    >
                                        {p.icon} {p.title}
                                    </Button>
                                ))}
                            </Popover.Content>
                        </Popover.Portal>
                    </Popover.Root>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="hover:text-red-600"
                        onClick={() => deletePage(page.id)}
                    >
                        <Trash className="size-4" /> Move to trash
                    </Button>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root >
    )
}