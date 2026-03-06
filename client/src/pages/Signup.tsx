import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema } from "../lib/schema";
import { useForm } from "react-hook-form";
import { useAuth } from "../store/auth.store";
import { Field } from "../components/Field";
import SocialSignIn from "../components/SocialSignIn";
import { RiAtLine } from "react-icons/ri";
import { RiUser3Line as User } from "react-icons/ri";
import type z from "zod";


type SignupForm = z.infer<typeof schema.signup>;

export default function Signup() {
    const { Signup } = useAuth();


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
                <p className="text-sm text-secondary leading-relaxed mt-2">
                    Create your account to start organizing and building your ideas with ease.
                </p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <Field>
                    <Field.Label>Name</Field.Label>
                    <Field.Control>
                        <Field.Icon children={<User />} />
                        <Field.Input
                            type="text"
                            placeholder="John Doe"
                            {...register("name")}
                        />
                    </Field.Control>

                    {errors.name && (
                        <Field.Message type="error" children={errors.name.message} />
                    )}
                </Field>

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
                </Field>

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
                <span className="text-xs text-muted">AUTHORIZE WITH</span>
                <div className="flex-1 h-px bg-linear-to-r via-neutral-600 to-transparent" />
            </div>

            <SocialSignIn />

            <p className="text-center text-sm text-secondary leading-relaxed">
                Already have an account?
                <Link
                    to="/sign-in"
                    className="underline underline-offset-4 text-primary ml-1"
                >
                    Sign in
                </Link>
            </p>
        </section>
    )
}