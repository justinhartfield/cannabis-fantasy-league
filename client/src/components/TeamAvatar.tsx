import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TeamAvatarProps {
  avatarUrl?: string | null;
  teamName: string;
  userName?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * TeamAvatar Component
 * Displays user avatar next to team names with fallback to initials
 */
export function TeamAvatar({ avatarUrl, teamName, userName, size = "md", className }: TeamAvatarProps) {
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  const displayName = userName || teamName;
  const initials = getInitials(displayName);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={avatarUrl || undefined} alt={displayName} />
      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
