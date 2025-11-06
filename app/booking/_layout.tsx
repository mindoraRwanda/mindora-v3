import { Stack } from 'expo-router';

export default function BookingLayout() {
    return (
        <Stack>
            <Stack.Screen name="[doctorId]" options={{ headerShown: false }} />
        </Stack>
    );
}