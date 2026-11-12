interface ShuttlecockIconProps {
  className?: string;
}

export function ShuttlecockIcon({ className = 'w-6 h-6' }: ShuttlecockIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5 19L9.5 14.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.8 12.2L15.8 3.8C16.6 3.1 17.8 3.2 18.5 3.9L20.1 5.5C20.8 6.2 20.9 7.4 20.2 8.2L11.8 17.2C11 18 9.7 18.1 8.8 17.4L6.6 15.2C5.9 14.3 6 13 6.8 12.2Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M4.2 16.5C3.5 17.2 3.5 18.5 4.3 19.3L4.7 19.7C5.5 20.5 6.8 20.5 7.5 19.8L9.5 17.8L6.2 14.5L4.2 16.5Z"
        fill="currentColor"
      />
      <path
        d="M11 8.5L15.5 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
