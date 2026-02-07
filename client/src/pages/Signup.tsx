import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { useState } from "react";
import { cn } from "../lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema } from "../lib/schema";
import { useForm } from "react-hook-form";
import { useAuth } from "../store/auth.store";
import Input from "../components/Field";
import type z from "zod";
import OAuth from "../components/OAuth";


type SignupForm = z.infer<typeof schema.signup>;

export default function Signup() {
    const { Signup } = useAuth();
    const [visible, setVisible] = useState<boolean>(false);

    const { register, handleSubmit, formState: { errors, isValid, isDirty, isSubmitting } } = useForm<SignupForm>({
        resolver: zodResolver(schema.signup),
        mode: "onChange",
    });

    const navigate = useNavigate();

    const onSubmit = async ({ name, email, password }: SignupForm) => {
        await Signup(name, email, password);
        const user = useAuth.getState().user;

        if (user && user.email) {
            return navigate(`/verifyemail/${user.email}`, { replace: true });
        }
    };

    return (
        <section className="max-w-md min-h-dvh grid place-content-center gap-8 mx-auto px-4">
            <header>
                <title>Sign up</title>
                <h1 className="text-3xl font-bold tracking-wider">Sign up for Notion</h1>
                <p className="text-sm text-neutral-500 leading-relaxed mt-2">
                    Create your account to start organizing and building your ideas with ease.
                </p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
                <div>
                    <Input
                        type="text"
                        placeholder="John Doe"
                        start={<i className="ri-user-line" />}
                        {...register("name")}
                    />
                    {errors.name && (
                        <span className="text-xs text-red-500">{errors.name.message}</span>
                    )}
                </div>

                <div>
                    <Input
                        type="email"
                        placeholder="john@gmail.com"
                        start={<i className="ri-at-line" />}
                        {...register("email")}
                    />
                    {errors.email && (
                        <span className="text-xs text-red-500">{errors.email.message}</span>
                    )}
                </div>

                <div>
                    <Input
                        type={visible ? "text" : "password"}
                        placeholder="John@12345"
                        start={<i className="ri-key-2-line" />}
                        end={
                            <button
                                type="button"
                                onClick={() => setVisible((v) => !v)}
                                className="cursor-pointer focus:outline-none"
                            >
                                <i
                                    className={cn({
                                        "ri-eye-off-line": !visible,
                                        "ri-eye-line": visible,
                                    })}
                                />
                            </button>
                        }
                        {...register("password")}
                    />
                    {errors.password && (
                        <span className="text-xs text-red-500">{errors.password.message}</span>
                    )}
                </div>

                <Button
                    type="submit"
                    variant="default"
                    size="default"
                    disabled={!isValid || !isDirty || isSubmitting}
                >
                    {isSubmitting ? "Creating..." : "Sign up"}
                </Button>
            </form>

            <div className="flex items-center">
                <div className="flex-1 h-px bg-linear-to-r via-neutral-600 to-transparent" />
                <span className="text-xs text-neutral-400">AUTHORIZE WITH</span>
                <div className="flex-1 h-px bg-linear-to-r via-neutral-600 to-transparent" />
            </div>

            <OAuth />

            <p className="text-center text-sm text-neutral-400">
                Already have an account?
                <Link
                    to="/sign-in"
                    className="underline underline-offset-4 text-black ml-1"
                >
                    Sign in
                </Link>
            </p>
        </section>
    )
}