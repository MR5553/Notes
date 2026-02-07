import { Button } from "../components/Button";
import { useState, type FormEvent } from "react";
import Otp from "../components/Otp";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import useTimer from "../hook/timer";
import { useAuth } from "../store/auth.store";


export default function VerifyEmail() {
    const { VerifyEmail, ResendOtp } = useAuth();
    const [otp, setOtp] = useState<string>("");
    const { state } = useLocation();
    const { timer, running, limitReached } = useTimer({ duration: 90, maxCount: 3 })

    const { email } = useParams();
    const navigate = useNavigate();


    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await VerifyEmail(otp, email!);
        const user = useAuth.getState().user;

        if (!user.verified) return;

        navigate(state?.from ?? "/", { replace: true });
    };


    return (
        <section className="max-w-md min-h-dvh mx-auto grid place-content-center gap-4">
            <form onSubmit={handleSubmit} className="grid gap-5">
                <header>
                    <h1 className="text-3xl font-bold tracking-wider">
                        Confirm your email
                    </h1>
                    <p className="text-sm text-neutral-500 leading-relaxed mt-2 text-wrap">
                        A 6-digit verification code has been sent to <span className="text-neutral-800"> {email}</span> .Please enter the code below to continue
                    </p>
                </header>

                <Otp
                    name="otp"
                    length={6}
                    onOtpChange={(value) => setOtp(value)}
                />

                <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={otp?.length !== 6}
                >
                    Continue
                </Button>
            </form>

            <p className="text-center text-sm text-neutral-500 leading-relaxed mt-2 text-wrap">
                Didn't get the code?
                <Button
                    variant="link"
                    className="w-min text-neutral-800 px-1"
                    onClick={() => ResendOtp(email!)}
                    disabled={running || limitReached}
                >
                    {running ? timer : limitReached ? "Limit Reached" : "Resend"}
                </Button>
            </p>

            <Link to="/sign-in" className="flex items-center gap-2 mx-auto text-neutral-800">
                <i className="ri-arrow-left-long-line text-xl" />
                back to sign-in
            </Link>
        </section>
    )
}