import * as React from 'react';
import {Slot} from '@radix-ui/react-slot';
import {Loader2} from 'lucide-react';
import {cva, type VariantProps} from 'class-variance-authority';

import {cn} from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      children,
      loading = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';

    if (asChild) {
      const {children: children_, ...rest} = (
        children as React.ReactElement<React.PropsWithChildren>
      ).props;
      const Root = (children as React.ReactElement).type;

      return (
        <Comp
          className={cn(
            'relative inline-block',
            buttonVariants({variant, size, className}),
          )}
          ref={ref}
          {...props}>
          <Root {...rest}>
            <span>
              {loading && (
                <span className="absolute inset-0 flex justify-center items-center">
                  <Loader2 className="size-[1em] animate-spin" />
                </span>
              )}
              <span className={loading ? 'opacity-0' : ''}>{children_}</span>
            </span>
          </Root>
        </Comp>
      );
    }

    return (
      <Comp ref={ref} {...props} className="relative inline-block w-full">
        {loading && (
          <span
            className={cn(
              'inline-flex',
              buttonVariants({variant, size, className}),
              'absolute inset-0 flex justify-center items-center',
            )}>
            <Loader2 className="size-[1em] animate-spin" />
          </span>
        )}
        <span
          className={cn(
            'inline-flex',
            buttonVariants({variant, size, className}),
            loading ? 'opacity-0' : '',
          )}>
          {children}
        </span>
      </Comp>
    );
  },
);

Button.displayName = 'Button';

export {Button, buttonVariants};
