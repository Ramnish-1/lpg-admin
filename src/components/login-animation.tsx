
import Image from 'next/image';

const CylinderIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <Image src="/leadIcon.png" alt="LEADWAY GAS" width={100} height={100} className="h-32 w-32 text-primary"/>
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
