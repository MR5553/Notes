import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "../components/Button";
import { cn } from "../lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema } from "../lib/schema";
import { useAuth } from "../store/auth.store";
import type z from "zod";
import Field from "../components/Field";
import OAuth from "../components/OAuth";
import { useWorkspace } from "../store/workspace.store";


type SigninForm = z.infer<typeof schema.signin>;

export default function Signin() {
    const { Signin } = useAuth();
    const { getWorkspaces } = useWorkspace();
    const [visible, setVisible] = useState<boolean>(false);
    const navigate = useNavigate();
    const { state } = useLocation();

    const { register, handleSubmit, formState: { errors, isValid, isDirty, isSubmitting }
    } = useForm<SigninForm>({
        resolver: zodResolver(schema.signin),
        mode: "onChange",
    });


    const onSubmit = async ({ email, password }: SigninForm) => {
        const user = await Signin(email, password);

        if (!user.verified) {
            return navigate(`/verifyemail/${user.email}`, { replace: true });
        }

        const workspaces = await getWorkspaces();

        if (workspaces.length === 0) {
            return navigate("/workspace/create-workspace");
        }

        navigate(state?.from ?? `/workspaces/${workspaces[0].id}`, { replace: true });
    };


    return (
        <section className="max-w-md min-h-dvh grid place-content-center gap-8 mx-auto px-4">
            <header>
                <title>Sign in</title>
                <h1 className="text-3xl font-bold tracking-wider">
                    Welcome back👋
                </h1>
                <p className="text-sm text-neutral-500 leading-relaxed mt-2">
                    Sign in to continue crafting and showcasing your ideas effortlessly.
                </p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
                <div>
                    <Field
                        type="email"
                        placeholder="john@gmail.com"
                        start={<i className="ri-at-line" />}
                        {...register("email")}
                    />
                    {errors.email && (
                        <span className="text-sm text-red-500">{errors.email.message}</span>
                    )}
                </div>

                <div>
                    <Field
                        type={visible ? "text" : "password"}
                        placeholder="exmaple: John@12345"
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
                    <div className="flex justify-between items-cente mt-1">
                        {errors.password &&
                            <span className="text-sm text-red-500">{errors.password.message}</span>
                        }
                        {!errors.password &&
                            <Link to="/forget-password" className="text-sm font-medium text-blue-500 ml-auto">
                                Forget password
                            </Link>
                        }
                    </div>
                </div>

                <Button
                    type="submit"
                    variant="default"
                    size="default"
                    disabled={!isValid || !isDirty || isSubmitting}
                >
                    {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
            </form>

            <div className="flex items-center">
                <div className="flex-1 h-[1.5px] bg-linear-to-r via-neutral-600 to-transparent" />
                <span className="text-xs text-neutral-400">AUTHORIZE WITH</span>
                <div className="flex-1 h-[1.5px] bg-linear-to-r via-neutral-600 to-transparent" />
            </div>

            <OAuth />

            <p className="text-center text-sm text-neutral-400">
                Don't have an account?{" "}
                <Link
                    to="/sign-up"
                    className="underline underline-offset-4 text-black ml-1"
                >
                    Sign up
                </Link>
            </p>
        </section>
    )
}