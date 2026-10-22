import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface BaseProps {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsAnchor = BaseProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

export type SiteButtonProps = ButtonAsButton | ButtonAsAnchor;

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-accent)] text-[var(--color-bg)] font-semibold hover:bg-[var(--color-accent-hover)] active:bg-[var(--color-plum)] active:text-[var(--color-text)] border border-transparent',
  secondary:
    'bg-[var(--color-field)] text-[var(--color-text)] font-medium border border-[var(--color-border)] hover:border-[var(--color-accent-hover)] hover:bg-[var(--color-surface)]',
  ghost:
    'bg-transparent text-[var(--color-muted)] font-medium hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] border border-transparent',
};

export const Button: React.FC<SiteButtonProps> = (props) => {
  const { variant = 'primary', className = '', children, ...rest } = props;
  const sharedClasses = `group inline-flex items-center justify-center gap-2.5 rounded-[2px] px-5 py-2.5 text-sm tracking-[-0.01em] transition-colors duration-150 [&_svg]:transition-transform [&_svg]:duration-150 hover:[&_svg]:translate-x-0.5 disabled:opacity-50 disabled:pointer-events-none ${VARIANT_CLASSES[variant]} ${className}`;

  if ('href' in rest && typeof rest.href === 'string') {
    const anchorProps = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a className={sharedClasses} {...anchorProps}>
        {children}
      </a>
    );
  }

  const buttonProps = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={buttonProps.type ?? 'button'} className={sharedClasses} {...buttonProps}>
      {children}
    </button>
  );
};
