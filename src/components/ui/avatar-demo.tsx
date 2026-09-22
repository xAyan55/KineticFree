import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AvatarDemo() {
  return (
    <div className="flex items-center gap-4">
      {/* Primary demo avatar with fallback */}
      <Avatar>
        <AvatarImage
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
          alt="@shadcn"
        />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>

      {/* Fallback demonstration */}
      <Avatar>
        <AvatarImage src="" alt="Fallback user" />
        <AvatarFallback>KH</AvatarFallback>
      </Avatar>
    </div>
  );
}

export default AvatarDemo;
