import { forwardRef, useState, useRef, useImperativeHandle, useEffect } from "react";
import { ReactRenderer } from "@tiptap/react";
import type { SuggestionProps, SuggestionKeyDownProps, SuggestionOptions } from "@tiptap/suggestion";
import { autoUpdate, computePosition, flip, offset, shift } from "@floating-ui/dom";
import { cn } from "../lib/utils";
import type { Commands, SuggestionItem } from "../types";
import { Button } from "./Button";


type CommandListRef = {
    onKeyDown: (props: SuggestionKeyDownProps) => boolean;
};


export const Suggestion = forwardRef<CommandListRef, Commands>(({ items, command }, ref) => {
    const ITEMS = items.flatMap(group => group.items);
    const [selection, setSelection] = useState(0);
    const refs = useRef<(HTMLButtonElement | null)[]>([]);
    let currentIndex = -1;


    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }) => {
            if (!ITEMS.length) return false;

            if (event.key === "ArrowUp") {
                event.preventDefault();
                setSelection(prev => (prev + ITEMS.length - 1) % ITEMS.length);
                return true;
            }

            if (event.key === "ArrowDown") {
                event.preventDefault();
                setSelection(prev => (prev + 1) % ITEMS.length);
                return true;
            }

            if (event.key === "Enter") {
                event.preventDefault();
                command(ITEMS[selection]);
                return true;
            }

            return false;
        },
    }));

    useEffect(() => { setSelection(0) }, [items]);

    useEffect(() => {
        const element = refs.current[selection];
        element?.scrollIntoView({ block: "center" });
    }, [selection]);


    return (
        <div className="relative w-52 max-h-70 bg-secondry border border-border overflow-y-auto rounded-xl shadow-lg scrollbar">
            <div className="relative flex flex-col gap-1 px-2 py-2">
                {items.map((group, gIndex) => (
                    <div
                        key={gIndex}
                        className="flex flex-col"
                    >
                        <span className="text-xs text-muted mb-2 px-px">
                            {group.label}
                        </span>

                        {group.items.map((Item) => {
                            currentIndex++;
                            const index = currentIndex;

                            return (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    key={Item.title}
                                    ref={(el) => { refs.current[index] = el }}
                                    onClick={() => command(Item)}
                                    className={cn("justify-start gap-2 text-muted my-px rounded-md", { "bg-secondry-foreground text-primary": index === selection })}
                                >
                                    <Item.icon className="size-4" />
                                    <span className="text-sm">{Item.title}</span>
                                </Button>
                            )
                        })}

                    </div>
                ))}
            </div>
        </div>
    );
});


export const RenderItems: SuggestionOptions<SuggestionItem>["render"] = () => {
    let component: ReactRenderer<CommandListRef> | null = null;
    let popup: HTMLElement | null = null;
    let cleanup: (() => void) | null = null;
    let currentProps: SuggestionProps<SuggestionItem> | null = null;

    const createPopup = () => {
        const element = document.createElement("div");
        Object.assign(element.style, {
            position: "absolute",
            zIndex: "9999",
            visibility: "hidden",
            opacity: "0",
            transition: "opacity 0.15s ease-out",
        });
        document.body.appendChild(element);
        return element;
    };

    const destroy = () => {
        cleanup?.();
        popup?.remove();
        component?.destroy();
        cleanup = null;
        popup = null;
        component = null;
    };

    return {
        onStart: (props: SuggestionProps<SuggestionItem>) => {
            destroy();
            currentProps = props;

            if (!props.clientRect) return;

            component = new ReactRenderer(Suggestion, {
                editor: props.editor,
                props: {
                    ...props,
                    command: (item: SuggestionItem) => {
                        props.command(item);
                    }
                },
            });


            popup = createPopup();
            popup.appendChild(component.element);

            const virtualElement = {
                getBoundingClientRect: () =>
                    currentProps?.clientRect?.() ?? new DOMRect(0, 0, 0, 0),
            };

            const updatePosition = () => {
                if (!popup) return;

                computePosition(virtualElement, popup, {
                    placement: "bottom-start",
                    middleware: [offset(10), flip(), shift()],
                }).then(({ x, y }) => {
                    Object.assign(popup!.style, {
                        left: `${x}px`,
                        top: `${y}px`,
                        visibility: "visible",
                        opacity: "1",
                    });
                });
            };

            updatePosition();
            cleanup = autoUpdate(virtualElement, popup, updatePosition);
        },

        onUpdate: (props: SuggestionProps<SuggestionItem>) => {
            currentProps = props;

            component?.updateProps({
                ...props,
                props: {
                    ...props,
                    command: (item: SuggestionItem) => {
                        props.command(item);
                    }
                },
            });
        },

        onKeyDown: (props: SuggestionKeyDownProps) => {
            if (props.event.key === "Escape") {
                destroy();
                return true;
            }

            return component?.ref?.onKeyDown(props) ?? false;
        },

        onExit: () => {
            destroy();
        },
    };
};