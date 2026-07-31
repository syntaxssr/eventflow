"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftRightIcon, LogOutIcon, SettingsIcon, UserIcon } from "lucide-react"
import { toast } from "sonner"

import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ROUTES } from "@/constants/app"
import { useLocale } from "@/i18n"
import { getFullName } from "@/lib/user"
import { useAppDispatch, useAppState, useCurrentUser } from "@/store"

export function UserMenu({ showName = true }: { showName?: boolean }) {
  const { t, locale } = useLocale()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const users = useAppState().users
  const currentUser = useCurrentUser()

  if (!currentUser) return null

  const handleSwitchUser = (userId: string) => {
    if (userId === currentUser.id) return
    dispatch({ type: "auth/switchUser", userId })
    const nextUser = users.find((user) => user.id === userId)
    if (nextUser) {
      toast.success(`${t("auth.switchedTo")}: ${getFullName(nextUser, locale)}`)
    }
  }

  const handleSignOut = () => {
    dispatch({ type: "auth/signOut" })
    router.replace(ROUTES.login)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={showName ? "default" : "icon"}
          className={showName ? "gap-2 px-1.5" : undefined}
          aria-label={t("shell.userMenu")}
          data-testid="user-menu"
        >
          <UserAvatar user={currentUser} size="xs" />
          {showName ? (
            <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">
              {getFullName(currentUser, locale)}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3">
            <UserAvatar user={currentUser} size="default" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {getFullName(currentUser, locale)}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {currentUser.position[locale]}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {currentUser.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger data-testid="switch-user-trigger">
            <ArrowLeftRightIcon className="size-4" aria-hidden="true" />
            {t("auth.switchUser")}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="w-64">
              <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
                {t("auth.switchUserHint")}
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={currentUser.id}
                onValueChange={handleSwitchUser}
              >
                {users.map((user) => (
                  <DropdownMenuRadioItem key={user.id} value={user.id}>
                    <div className="flex min-w-0 items-center gap-2">
                      <UserAvatar user={user} size="xs" />
                      <div className="min-w-0">
                        <p className="truncate text-sm">
                          {getFullName(user, locale)}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {user.position[locale]}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={ROUTES.profile}>
            <UserIcon className="size-4" aria-hidden="true" />
            {t("shell.myProfile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={ROUTES.notificationSettings}>
            <SettingsIcon className="size-4" aria-hidden="true" />
            {t("shell.notificationSettings")}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={handleSignOut} data-testid="sign-out">
          <LogOutIcon className="size-4" aria-hidden="true" />
          {t("auth.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
