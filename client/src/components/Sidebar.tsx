import { NavLink } from "react-router-dom";
import { Folder, Favorites } from "./Folder";
import { Button, ButtonVariants, } from "./Button";
import { RiHome5Line as Home } from "react-icons/ri";
import { LuSettings as Setting } from "react-icons/lu";
import { RiUser3Line as User } from "react-icons/ri";
import { TbLogout as Signout } from "react-icons/tb";
import { RiTranslate2 as Language } from "react-icons/ri";
import { LuTrash2 as Trash } from "react-icons/lu";
import Search from "./Search";
import { useAuth } from "../store/auth.store";
import { Avatar } from "./Avatar";
import Theme from "./Theme";


export default function Sidebar() {
    const { user, SignOut } = useAuth();

    return (
        <aside className="w-full h-dvh left-0 top-0 flex flex-col gap-1 bg-foreground border-r border-border">
            <div className="flex items-center gap-2 p-2">
                <Avatar size="md">
                    <Avatar.Image
                        src={user.avatar}
                        alt={user.name}
                    />
                    <Avatar.Fallback children={user.name} />
                </Avatar>

                <div className="block text-left">
                    <p className="text-sm text-primary font-medium truncate capitalize">
                        {user.name}
                    </p>
                    <p className="text-xs text-muted truncate">
                        {user.email}
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-1 p-2">
                <NavLink
                    to="/app/account"
                    className={({ isActive }) => ButtonVariants({ variant: "ghost", className: isActive && "bg-secondry" })}
                    end
                >
                    <User className="size-4" /> Acccount
                </NavLink>

                <NavLink
                    to="/app"
                    className={({ isActive }) => ButtonVariants({ variant: "ghost", className: isActive && "bg-secondry" })}
                    end
                >
                    <Home className="size-4" /> Home
                </NavLink>

                <NavLink
                    to="/app/setting"
                    className={({ isActive }) => ButtonVariants({ variant: "ghost", className: isActive && "bg-secondry" })}
                    end
                >
                    <Setting className="size-4" /> Settings
                </NavLink>

                <NavLink
                    to="/app/archived"
                    className={({ isActive }) => ButtonVariants({ variant: "ghost", className: isActive && "bg-secondry" })}
                    end
                >
                    <Trash className="size-4" /> Archived pages
                </NavLink>

                <Search />
            </div>

            <div className="flex flex-1 flex-col gap-4 border-y border-border overflow-y-auto p-2 scrollbar">
                <Favorites />
                <Folder />
            </div>

            <div className="flex flex-col gap-1 p-2">
                <Theme />
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                >
                    <Language size={16} /> Language
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="hover:text-red-600"
                    onClick={() => SignOut()}
                >
                    <Signout size={16} /> Sign out
                </Button>
            </div>
        </aside>
    )
}