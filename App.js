import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import Home from "./Home"; 

const Stack = createStackNavigator();

// Splash Screen
function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Home");
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.splash}>
      <Image source={require("./assets/done-icon.png")} style={styles.logo} />
      <Text style={styles.splashTitle}>Taskify</Text>
      <Text style={styles.splashTagline}>Organize your day, effortlessly</Text>
      <StatusBar style="light" />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: "#ED1B59",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: { width: 120, height: 120, marginBottom: 20, resizeMode: "contain", },
  splashTitle: { fontSize: 40, fontWeight: "bold", color: "#fff" },
  splashTagline: { fontSize: 16, color: "#fff", marginTop: 10 },
});
