import { Request, Response } from "express";

const inviteMember = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        // logic to send invitation email (OTP or link)

        return res.status(200).json({
            success: true,
            message: `Invitation sent to ${email}`
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}

const reInviteMember = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        // logic to resend invitation email

        return res.status(200).json({
            success: true,
            message: `Invitation resent to ${email}`
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
        });
    }
}

// router.post(
//     "/workspaces/invite/:token",
//     verifyJwtToken,
//     inviteMember
// )
// router.post(
//     "/workspaces/:id/re-invite",
//     verifyJwtToken,
//     reInviteMember
// );

export {
    inviteMember,
    reInviteMember
}