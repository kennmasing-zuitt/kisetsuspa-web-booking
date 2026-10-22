import SignIn from "@/mods/session/components/SignIn";
import { GuestOnly } from "@/mods/session/components/RequireSession";

export default function SignInPage() {
    return (
        <GuestOnly>
            <SignIn />
        </GuestOnly>
    );
}
