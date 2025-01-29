import { Camera } from "expo-camera";
import { Audio } from "expo-av";
import { useEffect } from "react";

export const useRequestPermission = () => {
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        await Camera.requestCameraPermissionsAsync();
        await Audio.requestPermissionsAsync();
      } catch (error) {
        console.error("Error requesting permissions:", error);
      }
    };
    requestPermissions();
  }, []);
};
