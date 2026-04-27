import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils/formatters';
import * as AvatarPrimitive from '@rn-primitives/avatar';
import { Text } from '@/components/ui/text';

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image className={cn('aspect-square size-full', className)} {...props} />;
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        'bg-muted flex size-full flex-row items-center justify-center rounded-full',
        className
      )}
      {...props}
    />
  );
}

type InitialsAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const initialsSize: Record<InitialsAvatarSize, { container: string; text: string }> = {
  xs: { container: 'size-7', text: 'text-xs' },
  sm: { container: 'size-9', text: 'text-sm' },
  md: { container: 'size-11', text: 'text-sm' },
  lg: { container: 'size-14', text: 'text-lg' },
  xl: { container: 'size-20', text: 'text-2xl' },
};

interface InitialsAvatarProps {
  name: string;
  size?: InitialsAvatarSize;
  className?: string;
}

function InitialsAvatar({ name, size = 'md', className }: InitialsAvatarProps) {
  const { container, text } = initialsSize[size];
  return (
    <Avatar className={cn(container, 'bg-primary', className)}>
      <AvatarFallback className="bg-primary">
        <Text className={cn('text-primary-foreground font-semibold', text)}>
          {getInitials(name)}
        </Text>
      </AvatarFallback>
    </Avatar>
  );
}

export { Avatar, AvatarFallback, AvatarImage, InitialsAvatar };
