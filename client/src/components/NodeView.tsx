import { useEffect, useId, useRef, useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import Mermaid from "mermaid";
import { Button } from "./Button";
import { LuSquareCode as Code } from "react-icons/lu";
import { LuPlay as Preview } from "react-icons/lu";
import { LuCopy } from "react-icons/lu";
import * as Popover from "@radix-ui/react-popover";
import TableGridSelector from "./TableGridSelector";
import { uploadImage } from "../lib/upload";
import { toast } from "sonner";
import ImageSelector from "./ImageSelector";


export function MermaidView({ node, updateAttributes }: NodeViewProps) {
    const [mode, setMode] = useState<"edit" | "preview">("edit");
    const ref = useRef<HTMLDivElement | null>(null)
    const id = useId();


    useEffect(() => {
        if (mode !== "preview") return;
        if (!ref.current || !node.attrs.code) return;

        const render = async () => {
            requestAnimationFrame(async () => {
                const { svg } = await Mermaid.render(id, node.attrs.code)
                ref.current!.innerHTML = svg
            })
        }

        render();

    }, [mode, node.attrs.code, id])


    return (
        <NodeViewWrapper>
            <div className="w-full min-h-30 flex flex-col gap-1 bg-foreground text-primary border border-border px-3 py-2 my-4 rounded-lg overflow-hidden">
                <div className="w-full flex items-center justify-between">
                    <span className="text-xs text-muted ">Mermaid</span>
                    <div>
                        <Button
                            variant="ghost"
                            className="p-1"
                            title="copy diagram"
                            onClick={() => {
                                navigator.clipboard.writeText(node.attrs.code);
                                toast.info("Diagram code copied")
                            }}
                        >
                            <LuCopy className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            className="p-1"
                            title="edit diagram"
                            onClick={() => setMode("edit")}
                        >
                            <Code className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            className="p-1"
                            title="preview diagram"
                            onClick={() => setMode("preview")}
                        >
                            <Preview className="size-4" />
                        </Button>
                    </div>
                </div>

                {
                    mode === "edit" && (
                        <textarea
                            id={id}
                            name="Mermaid code"
                            value={node.attrs.code}
                            placeholder="{SAMPLE}"
                            className="w-full field-sizing-content resize-none text-xs py-2 overflow-hidden font-normal font-mono border-none outline-none leading-snug"
                            onChange={(e) =>
                                updateAttributes({ code: e.target.value })
                            }
                        />
                    )
                }
                {
                    mode === "preview" && (
                        <div
                            ref={ref}
                            className="h-full flex justify-center py-2 [&>svg]:max-w-full"
                        />
                    )
                }
            </div>
        </NodeViewWrapper>
    )
}


export function TableView({ editor, getPos }: NodeViewProps) {

    const addTable = (rows: number, cols: number) => {
        const pos = getPos()

        if (pos !== undefined) {
            editor.chain().focus().deleteRange({ from: pos, to: pos + 1 }).insertTable({
                rows,
                cols,
                withHeaderRow: true,
            }).run()
        }
    }

    return (
        <NodeViewWrapper>
            <Popover.Root>
                <Popover.Trigger asChild>
                    <Button
                        variant="outlined"
                        size="sm"
                        title="Insert table"
                    >
                        Insert table
                    </Button>
                </Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content
                        side="bottom"
                        align="center"
                        sideOffset={6}
                        className="bg-foreground rounded-xl border border-border shadow-lg z-999"
                    >
                        <TableGridSelector
                            onSelect={(rows, cols) => {
                                addTable(rows, cols)
                            }}
                        />
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        </NodeViewWrapper>
    )
}

export function ImageView({ node, updateAttributes }: NodeViewProps) {

    const handleImageUpload = async (source: string | File) => {
        if (source instanceof File) {
            try {
                const { secure_url } = await uploadImage(source)
                updateAttributes({ src: secure_url })

            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : "Unable to upload image"
                )
            }
            return
        }

        if (typeof source === "string") {
            updateAttributes({ src: source })
        }
    }

    if (!node.attrs.src) {
        return (
            <NodeViewWrapper>
                <Popover.Root>
                    <Popover.Trigger asChild>
                        <Button
                            variant="outlined"
                            size="sm"
                            title="Insert image"
                        >
                            Insert image
                        </Button>
                    </Popover.Trigger>
                    <Popover.Portal>
                        <Popover.Content
                            side="bottom"
                            align="center"
                            sideOffset={5}
                            className="w-80 bg-secondry rounded-xl border border-border shadow-lg z-999"
                        >
                            <ImageSelector
                                onSelect={handleImageUpload}
                            />
                        </Popover.Content>
                    </Popover.Portal>
                </Popover.Root>
            </NodeViewWrapper>
        )
    }

    return (
        <NodeViewWrapper>
            <img
                src={node.attrs.src}
                style={{ width: node.attrs.width || "auto" }}
                className="max-w-full rounded-lg"
            />
        </NodeViewWrapper>
    )
}