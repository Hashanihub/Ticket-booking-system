import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = "http://10.253.3.83:5001/api";

// Token save 
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem('userToken', token);
    console.log('Token saved successfully');
    return true;
  } catch (error) {
    console.log('Error saving token:', error);
    return false;
  }
};

// Token read 
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return token;
  } catch (error) {
    console.log('Error getting token:', error);
    return null;
  }
};

// Token remove 
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('userToken');
    return true;
  } catch (error) {
    console.log('Error removing token:', error);
    return false;
  }
};

// User data save 
export const saveUserData = async (userData) => {
  try {
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    return true;
  } catch (error) {
    console.log('Error saving user data:', error);
    return false;
  }
};

// User data read 
export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.log('Error getting user data:', error);
    return null;
  }
};