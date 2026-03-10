import type React from 'react';

export const icon = (Icon: React.ComponentType<{ className?: string }>) => (
  <Icon className="h-6 w-6" />
);
