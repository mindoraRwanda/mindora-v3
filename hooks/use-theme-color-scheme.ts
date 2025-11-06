import { ThemeContext } from '@/contexts/ThemeContext';
import { useContext } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export function useThemeColorScheme(): 'light' | 'dark' {
    const systemColorScheme = useSystemColorScheme();

    // Try to get theme context, but don't fail if it's not available
    let themeMode: 'light' | 'dark' | 'system' = 'system';

    try {
        const context = useContext(ThemeContext);
        if (context) {
            themeMode = context.themeMode;
        }
    } catch (error) {
        // Context not available, use system default
    }

    if (themeMode === 'system') {
        return systemColorScheme === 'dark' ? 'dark' : 'light';
    }

    return themeMode;
}