// Custom test utilities để tránh lỗi detectHostComponentNames
import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';

// Custom render function với error handling
export const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // Wrap với error boundary để catch lỗi detectHostComponentNames
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
  };

  try {
    return render(ui, { wrapper: Wrapper, ...options });
  } catch (error: any) {
    // Nếu lỗi detectHostComponentNames, thử render lại với config khác
    if (error?.message?.includes('detectHostComponentNames') || 
        error?.message?.includes('unmounted test renderer')) {
      // Disable auto-detection và render lại
      const originalRender = require('@testing-library/react-native').render;
      return originalRender(ui, { ...options });
    }
    throw error;
  }
};

// Re-export everything từ @testing-library/react-native
export * from '@testing-library/react-native';

// Override render với custom implementation
export { customRender as render };

