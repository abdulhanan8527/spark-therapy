import { ReactNode } from 'react';

interface MobileFrameProps {
  children: ReactNode;
  color?: string;
}

export function MobileFrame({ children, color = 'bg-blue-600' }: MobileFrameProps) {
  return (
    <div className="flex justify-center py-8">
      <div className="w-[375px] bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-800">
        {/* Status Bar */}
        <div className={`${color} text-white px-6 py-2 flex justify-between items-center text-xs`}>
          <span>9:41</span>
          <div className="flex gap-1 items-center">
            <div className="w-4 h-3 border border-white rounded-sm" />
            <div className="w-4 h-3 border border-white rounded-sm">
              <div className="w-full h-1/2 bg-white" />
            </div>
            <div className="w-4 h-3 border border-white rounded-sm">
              <div className="w-full h-full bg-white" />
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
