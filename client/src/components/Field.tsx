import {
    createContext,
    useContext,
    useId,
    useState,
    type HTMLAttributes,
    type InputHTMLAttributes,
    type ReactNode
} from "react";
import { cn } from "../lib/utils";
import { RiKey2Line as Key } from "react-icons/ri";
import { RiEyeLine as EyeOpen } from "react-icons/ri";
import { RiEyeOffLine as EyeOff } from "react-icons/ri";


type FieldContextType = { id: string }
type FieldInputProps = InputHTMLAttributes<HTMLInputElement>;
interface FieldIconProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}
interface FieldMessageProps extends HTMLAttributes<HTMLParagraphElement> {
    children: ReactNode;
    type?: "description" | "error"
}

const FieldContext = createContext<FieldContextType | null>(null)

function useField() {
    const ctx = useContext(FieldContext)
    if (!ctx) throw new Error("Field components must be inside <Field>")
    return ctx
}


export function Field({ children }: { children: ReactNode }) {
    const id = useId()

    return (
        <FieldContext.Provider value={{ id }}>
            <div className="flex flex-col gap-1">
                {children}
            </div>
        </FieldContext.Provider>
    )
}

export function FieldControl({ children }: { children: ReactNode }) {
    return (
        <div
            className="flex items-center gap-2 w-full rounded-xl bg-layer-2 border border-border-default px-2.5 py-2 hover:border-border-strong focus-within:border-border-strong"
        >
            {children}
        </div>
    )
}

export function FieldLabel({ children }: { children: ReactNode }) {
    const { id } = useField()

    return (
        <label
            htmlFor={id}
            className="text-sm font-medium text-secondary px-1"
        >
            {children}
        </label>
    )
}

export function FieldIcon({ children, ...props }: FieldIconProps) {
    return (
        <div
            role="button"
            title="See password"
            className="flex items-center text-muted shrink-0 cursor-pointer"
            {...props}
        >
            {children}
        </div>
    )
}

export function FieldMessage({ children, type = "description", ...props }: FieldMessageProps) {
    const { id } = useField()

    return (
        <p
            id={`${id}-message`}
            className={cn(
                "text-xs",
                type === "description" && "text-secondary",
                type === "error" && "text-danger"
            )}
            {...props}
        >
            {children}
        </p>
    )
}

export function FieldInput({ name, type, value, placeholder, className, ...props }: FieldInputProps) {
    const { id } = useField()

    return (
        <input
            id={id}
            name={name}
            type={type}
            value={value}
            placeholder={placeholder}
            autoComplete="off"
            className={cn("flex-1 bg-transparent outline-none text-sm text-secondary placeholder:text-muted", className)}
            {...props}
        />
    )
}

export function FieldPassword({ name, value, placeholder, ...props }: FieldInputProps) {
    const { id } = useField()
    const [visible, setVisible] = useState<boolean>(false);

    return (
        <Field>
            <Field.Control>
                <FieldIcon children={<Key />} />
                <FieldInput
                    name={name}
                    type={visible ? "text" : "password"}
                    id={id}
                    value={value}
                    placeholder={placeholder}
                    {...props}
                />
                <FieldIcon onClick={() => setVisible((v) => !v)}>
                    {visible ? <EyeOpen /> : <EyeOff />}
                </FieldIcon>
            </Field.Control>
        </Field>
    )
}

Field.Control = FieldControl
Field.Label = FieldLabel
Field.Icon = FieldIcon
Field.Input = FieldInput
Field.Message = FieldMessage
Field.Password = FieldPassword