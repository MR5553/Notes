import { useRef, useState, type ChangeEvent } from "react";
import { Button } from "./Button";
import Tabs from "./Tab";
import { Field } from "./Field";


interface ImageSelectorProps {
    onSelect: (image: string | File) => void;
}

export default function ImageSelector({ onSelect }: ImageSelectorProps) {
    const [link, setLink] = useState("");
    const ref = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onSelect(file);
        }
    };

    const handleLinkSubmit = () => {
        if (link.trim()) {
            onSelect(link);
        }
    };

    return (
        <Tabs defaultValue="Upload">
            <Tabs.List>
                <Tabs.Trigger value="Upload">Upload</Tabs.Trigger>
                <Tabs.Trigger value="Link">Link</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="Upload">
                <Button
                    variant="default"
                    size="sm"
                    className="w-full py-2 justify-center"
                    title="Upload image from device"
                    onClick={() => ref.current?.click()}
                >
                    Upload local image
                </Button>

                <input
                    ref={ref}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </Tabs.Content>

            <Tabs.Content value="Link">
                <div className="flex flex-col gap-2">
                    <Field>
                        <Field.Control>
                            <Field.Input
                                name="Image url"
                                type="text"
                                value={link}
                                placeholder="Paste an image link..."
                                onChange={(e) => setLink(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleLinkSubmit()}
                            />
                        </Field.Control>
                    </Field>

                    <Button
                        variant="default"
                        size="sm"
                        className="w-full py-2 justify-center"
                        title="Upload image from device"
                        onClick={handleLinkSubmit}
                    >
                        Upload image
                    </Button>
                </div >
            </Tabs.Content>
        </Tabs>
    )
}