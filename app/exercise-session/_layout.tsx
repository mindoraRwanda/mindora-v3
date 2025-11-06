import { Stack } from 'expo-router';

export default function ExerciseSessionLayout() {
    return (
        <Stack>
            <Stack.Screen name="[exerciseId]" options={{ headerShown: false }} />
        </Stack>
    );
}