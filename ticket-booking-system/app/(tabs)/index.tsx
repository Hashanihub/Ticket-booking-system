import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from "react-native";

// --- TYPE DEFINITIONS ---
type User = {
  id: string;
  name: string;
  email: string;
  type: "admin" | "user";
} | null;

type EventItem = {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  price: number;
  category: string;
  description: string;
  image: string;
};

type CartItem = {
  id: string;
  event: EventItem;
  ticketType: string;
  quantity: number;
  total: number;
};

// --- API HELPERS ---
const API_BASE_URL = "http://localhost:5001/api";

// Save token function (call this after login)
export const saveToken = (token: string) => {
  localStorage.setItem('token', token);
};

// Get token function
const getToken = () => {
  return localStorage.getItem('token') || '';
};

// Main API call function
export const apiCall = async (endpoint: string, options: any = {}) => {
  try {
    // Add headers
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    // Fetch call
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

    // Handle errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('API call failed:', error.message || error);
    throw error;
  }
};

// --- SCREEN COMPONENTS (MOVED OUTSIDE) ---

const HomeScreen = ({ setCurrentScreen, backendConnected, testBackendConnection }: any) => (
  <View style={styles.screenContainer}>
    <Text style={styles.title}>🎫 Event Ticket Booking</Text>
    <Text style={styles.subtitle}>Book your favorite events seamlessly</Text>
    
    <TouchableOpacity style={styles.button} onPress={() => setCurrentScreen("events")}>
      <Text style={styles.buttonText}>Browse Events</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.button} onPress={() => setCurrentScreen("login")}>
      <Text style={styles.buttonText}>User Login</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.buttonSecondary} onPress={() => setCurrentScreen("signup")}>
      <Text style={styles.buttonTextSecondary}>Sign Up</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.adminButton} onPress={() => setCurrentScreen("adminLogin")}>
      <Text style={styles.adminButtonText}>Admin Login</Text>
    </TouchableOpacity>
  </View>
);

const LoginScreen = ({ loginData, handleLoginChange, handleLogin, loading, setCurrentScreen }: any) => (
  <View style={styles.screenContainer}>
    <Text style={styles.title}>🔐 User Login</Text>
    <TextInput
      style={styles.input}
      placeholder="Email"
      value={loginData.email}
      onChangeText={(text) => handleLoginChange('email', text)}
      keyboardType="email-address"
      autoCapitalize="none"
    />
    <TextInput
      style={styles.input}
      placeholder="Password"
      secureTextEntry
      value={loginData.password}
      onChangeText={(text) => handleLoginChange('password', text)}
    />
    <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
      <Text style={styles.buttonText}>{loading ? "Loading..." : "Login"}</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => setCurrentScreen("signup")}>
      <Text style={styles.linkText}>Don't have an account? Sign up</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => setCurrentScreen("home")}>
      <Text style={styles.linkText}>Back to Home</Text>
    </TouchableOpacity>
  </View>
);

const AdminLoginScreen = ({ adminLoginData, handleAdminLoginChange, handleAdminLogin, loading, setCurrentScreen }: any) => (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>👨‍💼 Admin Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Admin Email"
        value={adminLoginData.email}
        onChangeText={(text) => handleAdminLoginChange('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Admin Password"
        secureTextEntry
        value={adminLoginData.password}
        onChangeText={(text) => handleAdminLoginChange('password', text)}
      />
      <Text style={styles.demoText}>Admin panel</Text>
      <TouchableOpacity style={styles.adminButton} onPress={handleAdminLogin} disabled={loading}>
        <Text style={styles.adminButtonText}>{loading ? "Loading..." : "Admin Login"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setCurrentScreen("home")}>
        <Text style={styles.linkText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
);

const SignupScreen = ({ signupData, handleSignupChange, handleSignup, loading, setCurrentScreen }: any) => (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>📝 Create Account</Text>
      <TextInput style={styles.input} placeholder="Full Name" value={signupData.name} onChangeText={(text) => handleSignupChange('name', text)} />
      <TextInput style={styles.input} placeholder="Email" value={signupData.email} onChangeText={(text) => handleSignupChange('email', text)} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Phone Number" value={signupData.phone} onChangeText={(text) => handleSignupChange('phone', text)} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={signupData.password} onChangeText={(text) => handleSignupChange('password', text)} />
      <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry value={signupData.confirmPassword} onChangeText={(text) => handleSignupChange('confirmPassword', text)} />
      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Creating Account..." : "Create Account"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setCurrentScreen("login")}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setCurrentScreen("home")}>
        <Text style={styles.linkText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
);

const AdminScreen = ({ eventForm, handleEventFormChange, addEvent, events, setCurrentScreen }: any) => (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>👨‍💼 Admin Panel</Text>
      <Text style={styles.sectionTitle}>Add New Event</Text>
      <TextInput style={styles.input} placeholder="Event Name" value={eventForm.name} onChangeText={(text) => handleEventFormChange('name', text)} />
      <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={eventForm.date} onChangeText={(text) => handleEventFormChange('date', text)} />
      <TextInput style={styles.input} placeholder="Time (HH:MM)" value={eventForm.time} onChangeText={(text) => handleEventFormChange('time', text)} />
      <TextInput style={styles.input} placeholder="Location" value={eventForm.location} onChangeText={(text) => handleEventFormChange('location', text)} />
      <TextInput style={styles.input} placeholder="Price" value={eventForm.price} onChangeText={(text) => handleEventFormChange('price', text)} keyboardType="numeric" />
      <TextInput style={[styles.input, { height: 80 }]} placeholder="Description" value={eventForm.description} onChangeText={(text) => handleEventFormChange('description', text)} multiline />
      <TouchableOpacity style={styles.button} onPress={addEvent}>
        <Text style={styles.buttonText}>Add Event</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Current Events ({events.length})</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <Text style={styles.eventName}>{item.name}</Text>
            <Text>Date: {item.date} | Price: ${item.price}</Text>
            <Text>Location: {item.location}</Text>
          </View>
        )}
        style={{ maxHeight: 200 }}
      />
      <TouchableOpacity style={styles.buttonSecondary} onPress={() => setCurrentScreen("events")}>
        <Text style={styles.buttonTextSecondary}>View Events Page</Text>
      </TouchableOpacity>
    </View>
);

const EventsScreen = ({ events, user, addToCart, setCurrentScreen }: any) => (
  <View style={styles.screenContainer}>
    <View style={styles.eventsHeader}>
      <Text style={styles.title}>📅 Available Events ({events.length})</Text>
      <TouchableOpacity onPress={() => setCurrentScreen("home")}>
        <Text style={styles.backButton}>← Back</Text>
      </TouchableOpacity>
    </View>
    {events.length === 0 ? (
      <Text style={styles.emptyText}>No events available</Text>
    ) : (
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <Text style={styles.eventEmoji}>{item.image}</Text>
            <Text style={styles.eventName}>{item.name}</Text>
            <Text style={styles.eventDetails}>📅 {item.date} | 🕒 {item.time}</Text>
            <Text style={styles.eventDetails}>📍 {item.location}</Text>
            <Text style={styles.eventPrice}>💰 ${item.price} ({item.category})</Text>
            <Text style={styles.eventDescription}>{item.description}</Text>
            {user && user.type === "user" && (
              <TouchableOpacity style={styles.bookButton} onPress={() => addToCart(item)}>
                <Text style={styles.bookButtonText}>Book Tickets</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    )}
  </View>
);

const CartScreen = ({ cart, handleBooking, setCurrentScreen }: any) => (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>🛒 Your Cart</Text>
      {cart.length === 0 ? (
        <Text style={styles.emptyText}>Your cart is empty</Text>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Text style={styles.cartItemName}>{item.event.name}</Text>
                <Text>{item.quantity} x ${item.event.price} ({item.ticketType})</Text>
                <Text>Total: ${item.total}</Text>
              </View>
            )}
          />
          <Text style={styles.totalText}>
            Total: ${cart.reduce((sum: number, item: CartItem) => sum + item.total, 0)}
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleBooking}>
            <Text style={styles.buttonText}>Confirm Booking</Text>
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity style={styles.buttonSecondary} onPress={() => setCurrentScreen("events")}>
        <Text style={styles.buttonTextSecondary}>Back to Events</Text>
      </TouchableOpacity>
    </View>
);

const ConfirmationScreen = ({ bookingId, setCurrentScreen }: any) => (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>✅ Booking Confirmed!</Text>
      <Text style={{ textAlign: "center", marginTop: 20, fontSize: 16 }}>
        Your booking ID: {bookingId}
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => setCurrentScreen("events")}>
        <Text style={styles.buttonText}>Back to Events</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonSecondary} onPress={() => setCurrentScreen("home")}>
        <Text style={styles.buttonTextSecondary}>Back to Home</Text>
      </TouchableOpacity>
    </View>
);


// --- MAIN APP COMPONENT ---
export default function Index() {
  const [currentScreen, setCurrentScreen] = useState<
    "home" | "events" | "login" | "signup" | "admin" | "cart" | "confirmation" | "adminLogin"
  >("home");
  const [user, setUser] = useState<User>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [adminLoginData, setAdminLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: ""
  });
  const [eventForm, setEventForm] = useState({
    name: "", date: "", time: "", location: "", price: "", description: "", category: "regular"
  });

  const testBackendConnection = async () => {
    try {
      await apiCall('/health');
      setBackendConnected(true);
      console.log('✅ Backend connected successfully');
      return true;
    } catch (error) {
      setBackendConnected(false);
      console.log('❌ Backend connection failed');
      return false;
    }
  };

  const loadEvents = async () => {
    try {
      const result = await apiCall('/events');
      if (result.success && result.data) {
        const transformedEvents = result.data.map((event: any) => ({
          id: event.id.toString(),
          name: event.name,
          date: event.date.split('T')[0],
          time: event.time,
          location: event.location,
          price: event.ticket_price_regular || event.price || 0,
          category: event.category || 'regular',
          description: event.description,
          image: event.image || '🎭'
        }));
        setEvents(transformedEvents);
        return;
      }
    } catch (error) {
      console.log("Using mock data due to backend connection issue");
    }
    setEvents([
      { id: "1", name: "Summer Music Festival", date: "2024-08-15", time: "18:00", location: "Central Park", price: 50, category: "VIP", description: "Annual summer music festival featuring top artists", image: "🎵" },
      { id: "2", name: "Tech Conference 2024", date: "2024-09-20", time: "09:00", location: "Convention Center", price: 120, category: "Regular", description: "Latest trends in technology and innovation", image: "💻" },
      { id: "3", name: "Basketball Championship", date: "2024-07-30", time: "20:00", location: "City Arena", price: 75, category: "VIP", description: "National basketball championship finals", image: "🏀" }
    ]);
  };

  useEffect(() => {
    const initializeApp = async () => {
      await testBackendConnection();
      await loadEvents();
    };
    initializeApp();
  }, []);

  const handleLoginChange = (field: string, value: string) => setLoginData(prev => ({ ...prev, [field]: value }));
  const handleAdminLoginChange = (field: string, value: string) => setAdminLoginData(prev => ({ ...prev, [field]: value }));
  const handleSignupChange = (field: string, value: string) => setSignupData(prev => ({ ...prev, [field]: value }));
  const handleEventFormChange = (field: string, value: string) => setEventForm(prev => ({ ...prev, [field]: value }));

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) return Alert.alert("Error", "Please enter both email and password");
    setLoading(true);
    try {
      const result = await apiCall('/auth/login', { method: 'POST', body: JSON.stringify(loginData) });
      if (result.success && result.data) {
        setUser({ id: result.data.id.toString(), name: result.data.name, email: result.data.email, type: result.data.role });
        setCurrentScreen("events");
        Alert.alert("Success", "Login successful!");
      } else {
        Alert.alert("Error", result.message || "Login failed");
      }
    } catch (error) {
      Alert.alert("Error", "Cannot connect to server. Using demo mode.");
      setUser({ id: "1", name: "Demo User", email: loginData.email, type: "user" });
      setCurrentScreen("events");
    }
    setLoading(false);
  };

  const handleAdminLogin = async () => {
    if (!adminLoginData.email || !adminLoginData.password) return Alert.alert("Error", "Please enter both email and password");
    setLoading(true);
    try {
      const result = await apiCall('/auth/login', { method: 'POST', body: JSON.stringify(adminLoginData) });
      if (result.success && result.data && result.data.role === 'admin') {
        setUser({ id: result.data.id.toString(), name: result.data.name, email: result.data.email, type: result.data.role });
        setCurrentScreen("admin");
        Alert.alert("Success", "Admin login successful!");
      } else {
        Alert.alert("Error", result.message || "Invalid admin credentials");
      }
    } catch (error) {
      Alert.alert("Error", "Cannot connect to server. Using demo mode.");
      if (adminLoginData.email === "admin@eventbook.com" && adminLoginData.password === "admin123") {
        setUser({ id: "admin1", name: "Admin", email: "admin@eventbook.com", type: "admin" });
        setCurrentScreen("admin");
        Alert.alert("Success", "Admin login successful!");
      } else {
        Alert.alert("Error", "Invalid admin credentials");
      }
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!signupData.name || !signupData.email || !signupData.password || !signupData.confirmPassword) return Alert.alert("Error", "Please fill all fields");
    if (signupData.password !== signupData.confirmPassword) return Alert.alert("Error", "Passwords do not match");
    if (signupData.password.length < 6) return Alert.alert("Error", "Password must be at least 6 characters");
    setLoading(true);
    try {
      const result = await apiCall('/auth/register', { method: 'POST', body: JSON.stringify(signupData) });
      if (result.success && result.data) {
        setUser({ id: result.data.id.toString(), name: result.data.name, email: result.data.email, type: result.data.role });
        setCurrentScreen("events");
        Alert.alert("Success", "Account created successfully!");
        setSignupData({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
      } else {
        Alert.alert("Error", result.message || "Registration failed");
      }
    } catch (error) {
      Alert.alert("Success", "Account created successfully!");
      setUser({ id: Date.now().toString(), name: signupData.name, email: signupData.email, type: "user" });
      setCurrentScreen("events");
      setSignupData({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen("home");
    setCart([]);
    setLoginData({ email: "", password: "" });
    setAdminLoginData({ email: "", password: "" });
  };

  const addEvent = async () => {
    if (!eventForm.name || !eventForm.date || !eventForm.price) return Alert.alert("Error", "Please fill at least Name, Date, and Price");
    const newEvent = {
      name: eventForm.name, description: eventForm.description, date: eventForm.date, time: eventForm.time,
      location: eventForm.location, venue: eventForm.location,
      ticketPrice: { regular: Number(eventForm.price), vip: Number(eventForm.price) * 1.5 },
      category: eventForm.category, organizerId: user?.id || 1
    };
    try {
      const result = await apiCall('/events', { method: 'POST', body: JSON.stringify(newEvent) });
      if (result.success && result.data) {
        const frontendEvent: EventItem = {
          id: result.data.id.toString(), name: result.data.name, date: result.data.date.split('T')[0], time: result.data.time,
          location: result.data.location, price: result.data.ticket_price_regular, category: result.data.category,
          description: result.data.description, image: result.data.image || '🎭'
        };
        setEvents([...events, frontendEvent]);
        setEventForm({ name: "", date: "", time: "", location: "", price: "", description: "", category: "regular" });
        Alert.alert("Success", "Event added successfully!");
      }
    } catch (error) {
      const newEventWithId: EventItem = { ...eventForm, id: Date.now().toString(), price: Number(eventForm.price), image: "🎭" };
      setEvents([...events, newEventWithId]);
      setEventForm({ name: "", date: "", time: "", location: "", price: "", description: "", category: "regular" });
      Alert.alert("Success", "Event added successfully!");
    }
  };

  const addToCart = (event: EventItem, ticketType = "regular", quantity = 1) => {
    const cartItem: CartItem = { id: Date.now().toString(), event, ticketType, quantity, total: Number(event.price) * quantity };
    setCart([...cart, cartItem]);
    Alert.alert("Added to Cart", `${quantity} ${ticketType} ticket(s) for ${event.name}`);
  };

  const handleBooking = async () => {
    if (cart.length === 0) return Alert.alert("Error", "Cart is empty");
    const bookingData = {
      event: cart[0].event.id,
      tickets: cart.map(item => ({ type: item.ticketType, quantity: item.quantity, price: item.event.price }))
    };
    try {
      const result = await apiCall('/bookings', { method: 'POST', body: JSON.stringify(bookingData) });
      if (result.success && result.data) {
        const newBookingId = result.data.bookingReference || result.data.id;
        setCurrentBookingId(newBookingId);
        setCart([]);
        setCurrentScreen("confirmation");
        Alert.alert("Booking Confirmed!", `Your booking ID: ${newBookingId}`);
      }
    } catch (error) {
      const newBookingId = Date.now().toString();
      setCurrentBookingId(newBookingId);
      setCart([]);
      setCurrentScreen("confirmation");
      Alert.alert("Booking Confirmed!", `Your booking ID: ${newBookingId} `);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <HomeScreen setCurrentScreen={setCurrentScreen} backendConnected={backendConnected} testBackendConnection={testBackendConnection} />;
      case "events":
        return <EventsScreen events={events} user={user} addToCart={addToCart} setCurrentScreen={setCurrentScreen} />;
      case "login":
        return <LoginScreen loginData={loginData} handleLoginChange={handleLoginChange} handleLogin={handleLogin} loading={loading} setCurrentScreen={setCurrentScreen} />;
      case "adminLogin":
        return <AdminLoginScreen adminLoginData={adminLoginData} handleAdminLoginChange={handleAdminLoginChange} handleAdminLogin={handleAdminLogin} loading={loading} setCurrentScreen={setCurrentScreen} />;
      case "signup":
        return <SignupScreen signupData={signupData} handleSignupChange={handleSignupChange} handleSignup={handleSignup} loading={loading} setCurrentScreen={setCurrentScreen} />;
      case "admin":
        return <AdminScreen eventForm={eventForm} handleEventFormChange={handleEventFormChange} addEvent={addEvent} events={events} setCurrentScreen={setCurrentScreen} />;
      case "cart":
        return <CartScreen cart={cart} handleBooking={handleBooking} setCurrentScreen={setCurrentScreen} />;
      case "confirmation":
        return <ConfirmationScreen bookingId={currentBookingId} setCurrentScreen={setCurrentScreen} />;
      default:
        return <HomeScreen setCurrentScreen={setCurrentScreen} backendConnected={backendConnected} testBackendConnection={testBackendConnection} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎟️ TicketBook</Text>
        <View style={styles.headerRight}>
          <Text style={[styles.connectionDot, backendConnected ? styles.connectedDot : styles.disconnectedDot]}>•</Text>
          {user && (
            <View style={styles.headerButtons}>
              <Text style={styles.userWelcome}>Welcome, {user.name}</Text>
              <TouchableOpacity onPress={() => setCurrentScreen("events")}><Text style={styles.navText}>Events</Text></TouchableOpacity>
              {user.type === "user" && (<TouchableOpacity onPress={() => setCurrentScreen("cart")}><Text style={styles.navText}>Cart ({cart.length})</Text></TouchableOpacity>)}
              <TouchableOpacity onPress={handleLogout}><Text style={styles.navText}>Logout</Text></TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          {renderScreen()}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
    container: { flex:1, backgroundColor: "#f5f5f5" },
    header: { 
      flexDirection: "row", 
      justifyContent: "space-between", 
      alignItems: "center", 
      padding: 10, 
      paddingVertical: 30,  // reduced vertical padding
      paddingHorizontal: 30, // optional, slightly less horizontal padding
      backgroundColor: "#fff", 
      borderBottomWidth: 2, 
      borderBottomColor: "#ddd" 
    },
    headerTitle: { fontSize: 24, fontWeight: "bold", color: "#333" },
    headerRight: { flexDirection: "row", alignItems: "center" },
    headerButtons: { flexDirection: "row", alignItems: "center", gap: 3 },
    userWelcome: { fontSize: 14, color: "#666", marginRight: 10 },
    navText: { fontSize: 12, color: "#007AFF", fontWeight: "500" },
    connectionDot: { fontSize: 24, marginRight: 10 },
    connectedDot: { color: "#34C759" },
    disconnectedDot: { color: "#FF3B30" },
    content: { flex: 1 },
    screenContainer: { padding: 20, flex: 1 },
    eventsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    backButton: { fontSize: 16, color: "#007AFF", fontWeight: "500" },
    title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#333" },
    subtitle: { fontSize: 16, textAlign: "center", marginBottom: 10, color: "#666" },
    connectionStatus: { marginBottom: 20, alignItems: 'center' },
    statusText: { fontSize: 14, fontWeight: "500" },
    statusConnected: { color: "#34C759" },
    statusDisconnected: { color: "#FF9500" },
    sectionTitle: { fontSize: 20, fontWeight: "bold", marginVertical: 15, color: "#333" },
    button: { backgroundColor: "#007AFF", padding: 15, borderRadius: 10, alignItems: "center", marginVertical: 10 },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    buttonSecondary: { backgroundColor: "transparent", padding: 15, borderRadius: 10, alignItems: "center", borderWidth: 2, borderColor: "#007AFF", marginVertical: 10 },
    buttonTextSecondary: { color: "#007AFF", fontSize: 16, fontWeight: "bold" },
    adminButton: { backgroundColor: "#FF3B30", padding: 15, borderRadius: 10, alignItems: "center", marginVertical: 10 },
    adminButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    testButton: { backgroundColor: "#5856D6", padding: 10, borderRadius: 10, alignItems: "center", marginVertical: 10 },
    testButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
    input: { borderWidth: 1, borderColor: "#ddd", padding: 15, borderRadius: 10, marginVertical: 10, backgroundColor: "#fff" },
    eventCard: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginVertical: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    eventEmoji: { fontSize: 40, textAlign: "center", marginBottom: 10 },
    eventName: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
    eventDetails: { fontSize: 14, color: "#666", marginBottom: 3 },
    eventPrice: { fontSize: 16, fontWeight: "bold", color: "#007AFF", marginVertical: 5 },
    eventDescription: { fontSize: 14, color: "#888", marginTop: 5 },
    bookButton: { backgroundColor: "#34C759", padding: 10, borderRadius: 5, alignItems: "center", marginTop: 10 },
    bookButtonText: { color: "#fff", fontWeight: "bold" },
    cartItem: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginVertical: 5 },
    cartItemName: { fontSize: 16, fontWeight: "bold" },
    emptyText: { textAlign: "center", fontSize: 16, color: "#666", marginTop: 50 },
    totalText: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginVertical: 15 },
    linkText: { color: "#007AFF", textAlign: "center", marginTop: 15, fontSize: 14 },
    demoText: { textAlign: "center", fontSize: 12, color: "#666", fontStyle: "italic", marginBottom: 15 }
});