import React from 'react';
import { Stack } from 'expo-router';

const PublicLayout = () => {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="index"
               >
            </Stack.Screen>

            <Stack.Screen
                name="child-auth"
                >
            </Stack.Screen>
            <Stack.Screen
                name="parent-login"
               >
            </Stack.Screen>

            <Stack.Screen
                name="parent-signup"
                >
            </Stack.Screen>

            <Stack.Screen
                name="user-permission"
                >
            </Stack.Screen>

            <Stack.Screen
                name="child-login"
                >
            </Stack.Screen>
        </Stack>
    );
};

export default PublicLayout;
