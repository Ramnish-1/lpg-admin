
import { Package } from 'lucide-react';

const CylinderIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
        <path d="M3 5v14a9 3 0 0 0 18 0V5"></path>
        <path d="M3 12a9 3 0 0 0 18 0"></path>
    </svg>
);


export function LoginAnimation() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50 overflow-hidden">
      <div className="animate-cylinder-blast">
        <CylinderIcon className="h-32 w-32 text-primary" />
      </div>
    </div>
  );
}
