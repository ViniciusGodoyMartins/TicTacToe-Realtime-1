import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,        // sem barra de titulo
          contentStyle: { backgroundColor: "#0a0a0f" },
          animation: "slide_from_right",
        }}
      />
    </>
  );
}
// app/index.tsx
export { default } from "../src/screens/HomeScreen";

// app/lobby.tsx
export { default } from "../src/screens/LobbyScreen";

// app/game.tsx
export { default } from "../src/screens/GameScreen";
