import { Stack } from 'expo-router';

export default function VideoCallLayout() {
    return (
        <Stack>
            <Stack.Screen name="[appointmentId]" options={{ headerShown: false }} />
        </Stack>
    );
}