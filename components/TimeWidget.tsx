import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { WidgetData } from '../types';

interface TimeWidgetProps {
  data: WidgetData['data'];
}

export const TimeWidget: React.FC<TimeWidgetProps> = ({ data }) => {
  return (
    <div className="w-full max-w-2xl bg-surface border border-border rounded-2xl p-6 mb-8 animate-fade-in select-none">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-6 md:gap-8">
          {/* Time Display */}
          <div className="text-5xl md:text-6xl font-medium tracking-tight font-sans text-primary">
            {data.time}
          </div>
          
          {/* Divider (Optional, visual separation) */}
          <div className="h-12 w-[1px] bg-border hidden sm:block"></div>
          
          {/* Date & Location */}
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium text-primary flex items-center gap-2">
              {data.date} <span className="text-muted font-normal">{data.timezone}</span>
            </div>
            <div className="text-sm text-muted">
              {data.location}
            </div>
          </div>
        </div>
        
        {/* Menu Icon */}
        <button className="text-muted hover:text-primary transition-colors p-1 -mr-2 -mt-2">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};