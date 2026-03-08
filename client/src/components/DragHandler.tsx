import DragHandle from "@tiptap/extension-drag-handle-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type { Editor } from "@tiptap/react";
import { Button, ButtonVariants } from "./Button";
import { ActionItems, HIGHLIGHT_COLORS, TEXT_COLORS } from "../lib/constant";
import { HiChevronRight as Chevron } from "react-icons/hi";
import { HiMiniPlus as Plus } from "react-icons/hi2";
import { HiOutlineDocumentDuplicate as Duplicate } from "react-icons/hi";
import { TbExternalLink as Link } from "react-icons/tb";
import { LuTrash2 as Trash } from "react-icons/lu";
import { RxDragHandleDots2 as Drag } from "react-icons/rx";
import { RiPaintBrushLine as Paint } from "react-icons/ri";
import { BiFont as FontColor } from "react-icons/bi";
import { HiMiniArrowUturnRight as TurnRight } from "react-icons/hi2";
import { HiOutlineClipboard as Clipboard } from "react-icons/hi";


const Options = {
    enabled: true,
    rules: [],
    defaultRules: true,
    allowedContainers: undefined,
    edgeDetection: {
        edges: ["left", "top"] as ("left" | "top" | "right" | "bottom")[],
        threshold: 20,
        strength: 500
    }
};


export default function DragHandler({ editor }: { editor: Editor }) {
    return (
        <DragHandle
            editor={editor}
            nestedOptions={Options}
            className="smooth z-99 cursor-grab"
        >
            <div className="flex items-center gap-1 pr-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insert(editor)}
                    className="px-0 py-0 text-primary rounded"
                >
                    <Plus className="size-4" />
                </Button>

                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="px-0 py-0 text-primary rounded"
                        >
                            <Drag className="size-4" />
                        </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content
                        sideOffset={8}
                        side="right"
                        align="start"
                        className="w-50 flex flex-col gap-1 p-1.5 bg-foreground rounded-xl border border-border outline-none shadow-lg"
                    >
                        <DropdownMenu.Sub
                        >
                            <DropdownMenu.SubTrigger
                                className={ButtonVariants({
                                    variant: "ghost",
                                    size: "sm",
                                    className: "w-full px-0 py-0 rounded"
                                })}
                            >
                                <Paint className="size-4" /> Colors
                                <Chevron className="ml-auto" />
                            </DropdownMenu.SubTrigger>

                            <DropdownMenu.SubContent
                                sideOffset={9}
                                className="min-w-50 max-h-70 bg-foreground border border-border overflow-y-auto rounded-xl outline-none shadow-lg scrollbar"
                            >
                                <span className="text-xs text-muted px-2">
                                    Text Colors
                                </span>

                                <div className="flex flex-col gap-2 p-2">
                                    {TEXT_COLORS.map(({ color, label }) => (
                                        <DropdownMenu.Item
                                            key={color}
                                            title={label}
                                            onSelect={() =>
                                                editor.chain().focus().setColor(color).run()
                                            }
                                            className={ButtonVariants({
                                                variant: "ghost",
                                                size: "sm",
                                                className: "gap-2 justify-start"
                                            })}
                                        >
                                            <FontColor size={18} style={{ color }} />
                                            {label}
                                        </DropdownMenu.Item>
                                    ))}
                                </div>

                                <span className="text-xs text-muted px-2">
                                    Background Colors
                                </span>

                                <div className="flex flex-col gap-2 p-2">
                                    {HIGHLIGHT_COLORS.map(({ color, label }) => (
                                        <DropdownMenu.Item
                                            key={color}
                                            title={label}
                                            onSelect={() =>
                                                editor.chain().focus().setHighlight({ color }).run()
                                            }
                                            className={ButtonVariants({
                                                variant: "ghost",
                                                size: "sm",
                                                className: "gap-2 justify-start"
                                            })}
                                        >
                                            <span className="size-4.5 border border-muted rounded-md" style={{ background: color }} />
                                            {label}
                                        </DropdownMenu.Item>
                                    ))}
                                </div>
                            </DropdownMenu.SubContent>
                        </DropdownMenu.Sub>
                        <DropdownMenu.Sub>
                            <DropdownMenu.SubTrigger
                                className={ButtonVariants({
                                    variant: "ghost",
                                    size: "sm",
                                    className: "w-full px-0 py-0"
                                })}
                            >
                                <TurnRight className="size-4" /> Turn into
                                <Chevron className="ml-auto" />
                            </DropdownMenu.SubTrigger>

                            <DropdownMenu.SubContent
                                sideOffset={9}
                                className="min-w-50 max-h-70 bg-foreground border border-border overflow-y-auto rounded-xl outline-none shadow-lg scrollbar"
                            >
                                <div className="flex flex-col gap-1 p-2">
                                    {ActionItems.map((group) => (
                                        <div key={group.label} className="flex flex-col">
                                            <span className="text-xs text-muted mb-1 px-px">
                                                {group.label}
                                            </span>

                                            {group.items.map((item) => (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    key={item.title}
                                                    onClick={() => item.command({ editor })}
                                                    className="justify-start gap-2 text-primary my-px rounded-md"
                                                >
                                                    <item.icon className="size-4" />
                                                    <span className="text-sm">{item.title}</span>
                                                </Button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </DropdownMenu.SubContent>
                        </DropdownMenu.Sub>

                        <DropdownMenu.Separator className="h-px bg-layer-4" />

                        <DropdownMenu.Item
                            onClick={() => duplicate(editor)}
                            className={ButtonVariants({
                                variant: "ghost",
                                size: "sm",
                                className: "w-full px-0 py-0"
                            })}
                        >
                            <Duplicate className="size-4" /> Duplicate node
                        </DropdownMenu.Item>

                        <DropdownMenu.Item
                            onClick={() => getLink(editor)}
                            className={ButtonVariants({
                                variant: "ghost",
                                size: "sm",
                                className: "w-full px-0 py-0"
                            })}
                        >
                            <Link className="size-4" /> Copy link
                        </DropdownMenu.Item>

                        <DropdownMenu.Item
                            onClick={() => copy(editor)}
                            className={ButtonVariants({
                                variant: "ghost",
                                size: "sm",
                                className: "w-full px-0 py-0"
                            })}
                        >
                            <Clipboard className="size-4" /> Copy to clipboard
                        </DropdownMenu.Item>

                        <DropdownMenu.Separator className="h-px bg-layer-4" />

                        <DropdownMenu.Item
                            onClick={() => deleting(editor)}
                            className={ButtonVariants({
                                variant: "ghost",
                                size: "sm",
                                className: "w-full px-0 py-0 rounded hover:text-red-600"
                            })}
                        >
                            <Trash className="size-4" /> Delete
                        </DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
            </div>
        </DragHandle>
    )
}


const getRange = (editor: Editor) => {
    const { selection } = editor.state;
    const { $from } = selection;
    const depth = 1;
    return {
        pos: $from.before(depth),
        end: $from.after(depth),
        node: $from.node(depth)
    };
};

const insert = (editor: Editor) => {
    const { end } = getRange(editor);
    editor.chain().focus().insertContentAt(end, {
        type: "paragraph",
        content: [{ type: "text", text: "/" }]
    }).run();
};

const duplicate = (editor: Editor) => {
    const { end, node } = getRange(editor);
    editor.chain().focus().insertContentAt(end, node.toJSON()).run();
};

const deleting = (editor: Editor) => {
    const { pos, end } = getRange(editor);
    editor.chain().focus().deleteRange({ from: pos, to: end }).run();
};

const copy = async (editor: Editor) => {
    const { node } = getRange(editor);
    await navigator.clipboard.writeText(node.textContent || "");
};

const getLink = (editor: Editor) => {
    const { $from } = editor.state.selection;
    const pos = $from.before(1);

    const url = `${window.location.origin}${window.location.pathname}#block-${pos}`;
    navigator.clipboard.writeText(url);
}