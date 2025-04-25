import clsx from 'clsx';

export type VariantClass = string;

export function Badge({
  className,
  children,
  color,
}: {
  color: VariantClass;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-white rounded-full border border-gray-300 dark:border-gray-600',
        color,
        className
      )}
    >
      {children}
    </span>
  );
}
