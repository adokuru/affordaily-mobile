import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { theme } from "@/constants/Theme";

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/auth/login" />;

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      tintColor={theme.colors.secondary}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Dashboard</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "house", selected: "house.fill" }}
          md="home"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="checkin">
        <NativeTabs.Trigger.Label>Check In</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "person.badge.plus", selected: "person.badge.plus.fill" }}
          md="person_add"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="checkout">
        <NativeTabs.Trigger.Label>Check Out</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "rectangle.portrait.and.arrow.right", selected: "rectangle.portrait.and.arrow.right.fill" }}
          md="logout"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="rooms">
        <NativeTabs.Trigger.Label>Rooms</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "bed.double", selected: "bed.double.fill" }}
          md="bed"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
