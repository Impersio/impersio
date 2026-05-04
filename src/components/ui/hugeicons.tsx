export const HugeiconsIcon = ({ icon: Icon, size = 24, className = '', ...props }: any) => {
  if (!Icon) return null;
  
  // If it's an object with paths (like from core-free-icons)
  if (typeof Icon === 'object' && Icon.paths) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        {Icon.paths.map((path: any, index: number) => (
          <path
            key={index}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.strokeWidth || 1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    );
  }

  // If it's a React component
  if (typeof Icon === 'function') {
    return <Icon size={size} className={className} {...props} />;
  }

  return null;
};
