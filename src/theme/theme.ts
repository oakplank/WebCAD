export const lightTheme = {
  colors: {
    background: '#ffffff',
    surface: '#ffffff',
    toolbar: '#f5f5f5',
    primary: '#2196f3',
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
    icon: '#000000',
    border: '#eeeeee',
    menuHover: '#f5f5f5',
    menuActive: '#e3f2fd',
    danger: '#ff4444',
    dangerHover: '#ff0000',
  },
};

export const darkTheme = {
  colors: {
    background: '#1e1e1e',
    surface: '#2d2d2d',
    toolbar: '#2d2d2d',
    primary: '#64b5f6',
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    icon: '#ffffff',
    border: '#404040',
    menuHover: '#3d3d3d',
    menuActive: '#0d47a1',
    danger: '#f44336',
    dangerHover: '#d32f2f',
  },
};

export type Theme = typeof lightTheme;