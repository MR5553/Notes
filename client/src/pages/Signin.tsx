import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "../components/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema } from "../lib/schema";
import { useAuth } from "../store/auth.store";
import type z from "zod";
import { Field } from "../components/Field";
import SocialSignIn from "../components/SocialSignIn";
import { RiAtLine } from "react-icons/ri";


type SigninForm = z.infer<typeof schema.signin>;

export default function Signin() {
    const { Signin } = useAuth();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isValid, isDirty, isSubmitting }
    } = useForm<SigninForm>({
        resolver: zodResolver(schema.signin),
        mode: "onChange",
    });


    const onSubmit = async ({ email, password }: SigninForm) => {
        const user = await Signin(email, password);

        if (!user?.verified) {
            return navigate(`/verifyemail/${user?.email}`, { replace: true });
        }
        navigate("/app")
    };


    return (
        <section className="max-w-md min-h-dvh grid place-content-center gap-8 mx-auto px-4">
            <header>
                <title>Sign in</title>
                <h1 className="text-3xl font-bold tracking-wider">
                    Welcome back👋
                </h1>
                <p className="text-sm text-secondary leading-relaxed mt-2">
                    Sign in to continue creating and showcasing your ideas effortlessly.
                </p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <Field>
                    <Field.Label>Email</Field.Label>
                    <Field.Control>
                        <Field.Icon children={<RiAtLine />} />
                        <Field.Input
                            type="email"
                            placeholder="john@gmail.com"
                            {...register("email")}
                        />
                    </Field.Control>

                    {errors.email && (
                        <Field.Message type="error" children={errors.email.message} />
                    )}
                </Field>

                <Field>
                    <Field.Label>Password</Field.Label>
                    <Field.Password
                        placeholder="John@12345"
                        {...register("password")}
                    />

                    {errors.password && (
                        <Field.Message type="error" children={errors.password.message} />
                    )}

                    {!errors.password &&
                        <Link to="/forget-password" className="inline text-sm font-medium text-blue-500 ml-auto">
                            forget password
                        </Link>
                    }
                </Field>

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
                <span className="text-xs text-muted">AUTHORIZE WITH</span>
                <div className="flex-1 h-[1.5px] bg-linear-to-r via-neutral-600 to-transparent" />
            </div>

            <SocialSignIn />

            <p className="text-center text-sm text-secondary leading-relaxed">
                Don't have an account?{" "}
                <Link
                    to="/sign-up"
                    className="underline underline-offset-4 text-primary ml-1"
                >
                    Sign up
                </Link>
            </p>
        </section>
    )
}