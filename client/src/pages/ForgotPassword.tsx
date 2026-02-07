import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/Button";
import Field from "../components/Field";
import { api } from "../lib/api";
import { schema } from "../lib/schema";
import { cn } from "../lib/utils";
import { useForm } from "react-hook-form";


export default function ForgotPassword() {
    const [visiblePassword, setVisiblePassword] = useState(false);
    const [visibleConfirmPassword, setVisibleConfirmPassword] = useState(false);

    const { email } = useParams();

    const { register, handleSubmit, formState: { errors, isValid, isDirty, isSubmitting }
    } = useForm({
        resolver: zodResolver(schema.ResetPassword),
        mode: "onChange",
    });


    const onSubmit = async ({ password, confirm }: any) => {
        try {
            const { data } = await api.post("/api/auth/sign-in", { password, confirm });

            if (data.success) {
                toast.success(data.message);
            }

        } catch (error) {
            if (isAxiosError(error) && error.response) {
                toast.error(error.response.data.message);
            }
        }
    };

    return (
        <section className="max-w-md min-h-dvh mx-auto grid place-content-center gap-8 px-4">
            <header>
                <h1 className="text-3xl font-bold tracking-wider">
                    Forget password
                </h1>
                <p className="text-sm text-neutral-500 leading-relaxed mt-2 text-wrap">
                    Enter 6-digit verification code has been sent to <span className="text-neutral-800"> {email}</span> for reset your password
                </p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
                <div>
                    <Field
                        type={visiblePassword ? "text" : "password"}
                        placeholder="John@12345"
                        start={<i className="ri-key-2-line" />}
                        end={
                            <button
                                type="button"
                                onClick={() => setVisiblePassword((v) => !v)}
                                className="cursor-pointer focus:outline-none"
                            >
                                <i
                                    className={cn({
                                        "ri-eye-off-line": !visiblePassword,
                                        "ri-eye-line": visiblePassword,
                                    })}
                                />
                            </button>
                        }
                        {...register("password")}
                    />
                    {errors.password && (
                        <span className="text-sm text-red-500">{errors.password.message}</span>
                    )}
                </div>

                <div>
                    <Field
                        type={visibleConfirmPassword ? "text" : "password"}
                        placeholder="John@12345"
                        start={<i className="ri-key-2-line" />}
                        end={
                            <button
                                type="button"
                                onClick={() => setVisibleConfirmPassword((v) => !v)}
                                className="cursor-pointer focus:outline-none"
                            >
                                <i
                                    className={cn({
                                        "ri-eye-off-line": !visibleConfirmPassword,
                                        "ri-eye-line": visibleConfirmPassword,
                                    })}
                                />
                            </button>
                        }
                        {...register("confirm")}
                    />
                    <div className="flex justify-between items-cente mt-1">
                        {errors.confirm &&
                            <span className="text-sm text-red-500">{errors.confirm.message}</span>
                        }
                    </div>
                </div>

                <Button
                    type="submit"
                    variant="default"
                    size="default"
                    disabled={!isValid || !isDirty || isSubmitting}
                >
                    Continue
                </Button>
            </form>

            <Link to="/sign-in" className="flex items-center gap-2 mx-auto text-neutral-800">
                <i className="ri-arrow-left-long-line text-xl" />
                back to sign-in
            </Link>
        </section>
    )
}