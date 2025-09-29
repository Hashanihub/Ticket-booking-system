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
  KeyboardAvoidingView,
  Modal,
  Platform,
  Animated, // Added Animated
  Easing // Added Easing
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

// --- OFFLINE MOCK DATA ---
const MOCK_EVENTS: EventItem[] = [
  { 
    id: "1", 
    name: "Summer Music Festival", 
    date: "2024-08-15", 
    time: "18:00", 
    location: "Central Park", 
    price: 50, 
    category: "VIP", 
    description: "Annual summer music festival featuring top artists", 
    image: "🎵" 
  },
  { 
    id: "2", 
    name: "Tech Conference 2024", 
    date: "2024-09-20", 
    time: "09:00", 
    location: "Convention Center", 
    price: 120, 
    category: "Regular", 
    description: "Latest trends in technology and innovation", 
    image: "💻" 
  },
  { 
    id: "3", 
    name: "Basketball Championship", 
    date: "2024-07-30", 
    time: "20:00", 
    location: "City Arena", 
    price: 75, 
    category: "VIP", 
    description: "National basketball championship finals", 
    image: "🏀" 
  }
];

// --- ANIMATED COMPONENTS ---
const FadeInView = ({ children, delay = 0, style }: any) => {
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      delay: delay,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease)
    }).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity: fadeAnim }]}>
      {children}
    </Animated.View>
  );
};

const SlideUpView = ({ children, delay = 0, style }: any) => {
  const slideAnim = useState(new Animated.Value(50))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.2))
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: delay,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { 
      transform: [{ translateY: slideAnim }],
      opacity: fadeAnim
    }]}>
      {children}
    </Animated.View>
  );
};

const BounceView = ({ children, delay = 0, style }: any) => {
  const bounceAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 400,
        delay: delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5))
      }),
      Animated.timing(bounceAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const scale = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1]
  });

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      {children}
    </Animated.View>
  );
};

// --- SIMPLE STORAGE ---
const storage = {
  async setItem(key: string, value: string) {
    try {
      if (typeof window !== 'undefined') {
        window[key] = value;
      }
    } catch (error) {
      console.log('Storage set error:', error);
    }
  },
  
  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof window !== 'undefined') {
        return window[key] || null;
      }
      return null;
    } catch (error) {
      console.log('Storage get error:', error);
      return null;
    }
  }
};

// --- SIMPLE API SIMULATION ---
const apiCall = async (endpoint: string, options: any = {}) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  switch (endpoint) {
    case '/health':
      return { success: true, message: 'Mock server is healthy' };
      
    case '/events':
      if (options.method === 'POST') {
        const newEvent = {
          id: Date.now().toString(),
          ...options.body,
          price: Number(options.body.price)
        };
        MOCK_EVENTS.push(newEvent);
        return { success: true, data: newEvent };
      }
      if (options.method === 'PUT') {
        const eventId = endpoint.split('/')[2];
        const eventIndex = MOCK_EVENTS.findIndex(e => e.id === eventId);
        if (eventIndex !== -1) {
          MOCK_EVENTS[eventIndex] = { ...MOCK_EVENTS[eventIndex], ...options.body };
          return { success: true, data: MOCK_EVENTS[eventIndex] };
        }
      }
      if (options.method === 'DELETE') {
        const eventId = endpoint.split('/')[2];
        const eventIndex = MOCK_EVENTS.findIndex(e => e.id === eventId);
        if (eventIndex !== -1) {
          MOCK_EVENTS.splice(eventIndex, 1);
          return { success: true };
        }
      }
      return { success: true, data: MOCK_EVENTS };
      
    case '/auth/login':
      const { email, password } = options.body;
      if (email === "admin@eventbook.com" && password === "admin123") {
        return {
          success: true,
          data: {
            id: "admin1",
            name: "Admin",
            email: email,
            role: "admin",
            token: "mock-admin-token"
          }
        };
      } else {
        return {
          success: true,
          data: {
            id: "1",
            name: "Demo User",
            email: email,
            role: "user",
            token: "mock-user-token"
          }
        };
      }
      
    case '/auth/register':
      return {
        success: true,
        data: {
          id: Date.now().toString(),
          name: options.body.name,
          email: options.body.email,
          role: "user",
          token: "mock-new-user-token"
        }
      };
      
    case '/bookings':
      return {
        success: true,
        data: {
          id: Date.now().toString(),
          bookingReference: `BK${Date.now()}`
        }
      };
      
    default:
      return { success: true, data: null };
  }
};

// --- ANIMATED SCREEN COMPONENTS ---

const HomeScreen = ({ setCurrentScreen, backendConnected, testBackendConnection }: any) => (
  <View style={styles.screenContainer}>
    <BounceView delay={200}>
      <Text style={styles.title}>🎫 Event Ticket Booking</Text>
    </BounceView>
    
    <FadeInView delay={400}>
      <Text style={styles.subtitle}>Book your favorite events seamlessly</Text>
    </FadeInView>

    <SlideUpView delay={600} style={styles.buttonContainer}>
      <TouchableOpacity style={styles.button} onPress={() => setCurrentScreen("events")}>
        <Text style={styles.buttonText}>Browse Events</Text>
      </TouchableOpacity>
    </SlideUpView>

    <SlideUpView delay={700} style={styles.buttonContainer}>
      <TouchableOpacity style={styles.button} onPress={() => setCurrentScreen("login")}>
        <Text style={styles.buttonText}>User Login</Text>
      </TouchableOpacity>
    </SlideUpView>

    <SlideUpView delay={800} style={styles.buttonContainer}>
      <TouchableOpacity style={styles.buttonSecondary} onPress={() => setCurrentScreen("signup")}>
        <Text style={styles.buttonTextSecondary}>Sign Up</Text>
      </TouchableOpacity>
    </SlideUpView>

    <SlideUpView delay={900} style={styles.buttonContainer}>
      <TouchableOpacity style={styles.adminButton} onPress={() => setCurrentScreen("adminLogin")}>
        <Text style={styles.adminButtonText}>Admin Login</Text>
      </TouchableOpacity>
    </SlideUpView>
  </View>
);

const LoginScreen = ({ loginData, handleLoginChange, handleLogin, loading, setCurrentScreen }: any) => (
  <View style={styles.screenContainer}>
    <BounceView>
      <Text style={styles.title}>🔐 User Login</Text>
    </BounceView>
    
    <SlideUpView delay={200}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={loginData.email}
        onChangeText={(text) => handleLoginChange('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
    </SlideUpView>

    <SlideUpView delay={300}>
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={loginData.password}
        onChangeText={(text) => handleLoginChange('password', text)}
      />
    </SlideUpView>

    <SlideUpView delay={400}>
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Loading..." : "Login"}</Text>
      </TouchableOpacity>
    </SlideUpView>

    <FadeInView delay={500}>
      <TouchableOpacity onPress={() => setCurrentScreen("signup")}>
        <Text style={styles.linkText}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setCurrentScreen("home")}>
        <Text style={styles.linkText}>Back to Home</Text>
      </TouchableOpacity>
    </FadeInView>
  </View>
);

const AdminLoginScreen = ({ adminLoginData, handleAdminLoginChange, handleAdminLogin, loading, setCurrentScreen }: any) => (
  <View style={styles.screenContainer}>
    <BounceView>
      <Text style={styles.title}>👨‍💼 Admin Login</Text>
    </BounceView>
    
    <SlideUpView delay={200}>
      <TextInput
        style={styles.input}
        placeholder="Admin Email"
        value={adminLoginData.email}
        onChangeText={(text) => handleAdminLoginChange('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
    </SlideUpView>

    <SlideUpView delay={300}>
      <TextInput
        style={styles.input}
        placeholder="Admin Password"
        secureTextEntry
        value={adminLoginData.password}
        onChangeText={(text) => handleAdminLoginChange('password', text)}
      />
    </SlideUpView>

    <FadeInView delay={350}>
      <Text style={styles.demoText}>Demo: admin@eventbook.com / admin123</Text>
    </FadeInView>

    <SlideUpView delay={400}>
      <TouchableOpacity style={styles.adminButton} onPress={handleAdminLogin} disabled={loading}>
        <Text style={styles.adminButtonText}>{loading ? "Loading..." : "Admin Login"}</Text>
      </TouchableOpacity>
    </SlideUpView>

    <FadeInView delay={500}>
      <TouchableOpacity onPress={() => setCurrentScreen("home")}>
        <Text style={styles.linkText}>Back to Home</Text>
      </TouchableOpacity>
    </FadeInView>
  </View>
);

const SignupScreen = ({ signupData, handleSignupChange, handleSignup, loading, setCurrentScreen }: any) => (
  <View style={styles.screenContainer}>
    <BounceView>
      <Text style={styles.title}>📝 Create Account</Text>
    </BounceView>
    
    <SlideUpView delay={200}>
      <TextInput style={styles.input} placeholder="Full Name" value={signupData.name} onChangeText={(text) => handleSignupChange('name', text)} />
    </SlideUpView>

    <SlideUpView delay={250}>
      <TextInput style={styles.input} placeholder="Email" value={signupData.email} onChangeText={(text) => handleSignupChange('email', text)} keyboardType="email-address" autoCapitalize="none" />
    </SlideUpView>

    <SlideUpView delay={300}>
      <TextInput style={styles.input} placeholder="Phone Number" value={signupData.phone} onChangeText={(text) => handleSignupChange('phone', text)} keyboardType="phone-pad" />
    </SlideUpView>

    <SlideUpView delay={350}>
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={signupData.password} onChangeText={(text) => handleSignupChange('password', text)} />
    </SlideUpView>

    <SlideUpView delay={400}>
      <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry value={signupData.confirmPassword} onChangeText={(text) => handleSignupChange('confirmPassword', text)} />
    </SlideUpView>

    <SlideUpView delay={450}>
      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Creating Account..." : "Create Account"}</Text>
      </TouchableOpacity>
    </SlideUpView>

    <FadeInView delay={500}>
      <TouchableOpacity onPress={() => setCurrentScreen("login")}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setCurrentScreen("home")}>
        <Text style={styles.linkText}>Back to Home</Text>
      </TouchableOpacity>
    </FadeInView>
  </View>
);

// Event Edit Modal Component with Animation
const EventEditModal = ({ 
  visible, 
  onClose, 
  eventForm, 
  handleEventFormChange, 
  handleSaveEvent, 
  isEditing,
  loading 
}: any) => {
  const [modalAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.spring(modalAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        friction: 8,
        tension: 40
      }).start();
    } else {
      modalAnim.setValue(0);
    }
  }, [visible]);

  const scale = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1]
  });

  const opacity = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.modalOverlay, { opacity }]}>
        <Animated.View style={[styles.modalContent, { transform: [{ scale }] }]}>
          <BounceView>
            <Text style={styles.modalTitle}>
              {isEditing ? "✏️ Edit Event" : "➕ Add New Event"}
            </Text>
          </BounceView>
          
          <ScrollView style={styles.modalScrollView}>
            <FadeInView delay={100}>
              <TextInput 
                style={styles.input} 
                placeholder="Event Name" 
                value={eventForm.name} 
                onChangeText={(text) => handleEventFormChange('name', text)} 
              />
            </FadeInView>
            
            <FadeInView delay={150}>
              <TextInput 
                style={styles.input} 
                placeholder="Date (YYYY-MM-DD)" 
                value={eventForm.date} 
                onChangeText={(text) => handleEventFormChange('date', text)} 
              />
            </FadeInView>

            {/* Add similar FadeInView wrappers for other inputs */}
            <FadeInView delay={200}>
              <TextInput 
                style={styles.input} 
                placeholder="Time (HH:MM)" 
                value={eventForm.time} 
                onChangeText={(text) => handleEventFormChange('time', text)} 
              />
            </FadeInView>

            <FadeInView delay={250}>
              <TextInput 
                style={styles.input} 
                placeholder="Location" 
                value={eventForm.location} 
                onChangeText={(text) => handleEventFormChange('location', text)} 
              />
            </FadeInView>

            <FadeInView delay={300}>
              <TextInput 
                style={styles.input} 
                placeholder="Price" 
                value={eventForm.price} 
                onChangeText={(text) => handleEventFormChange('price', text)} 
                keyboardType="numeric" 
              />
            </FadeInView>

            <FadeInView delay={350}>
              <TextInput 
                style={styles.input} 
                placeholder="Category" 
                value={eventForm.category} 
                onChangeText={(text) => handleEventFormChange('category', text)} 
              />
            </FadeInView>

            <FadeInView delay={400}>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                placeholder="Description" 
                value={eventForm.description} 
                onChangeText={(text) => handleEventFormChange('description', text)} 
                multiline 
                numberOfLines={4}
              />
            </FadeInView>

            <FadeInView delay={450}>
              <TextInput 
                style={styles.input} 
                placeholder="Emoji (🎵, 💻, 🏀)" 
                value={eventForm.image} 
                onChangeText={(text) => handleEventFormChange('image', text)} 
              />
            </FadeInView>
          </ScrollView>

          <View style={styles.modalButtons}>
            <SlideUpView delay={500}>
              <TouchableOpacity style={styles.buttonSecondary} onPress={onClose}>
                <Text style={styles.buttonTextSecondary}>Cancel</Text>
              </TouchableOpacity>
            </SlideUpView>
            
            <SlideUpView delay={550}>
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleSaveEvent} 
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Saving..." : (isEditing ? "Update Event" : "Add Event")}
                </Text>
              </TouchableOpacity>
            </SlideUpView>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const AdminScreen = ({ 
  eventForm, 
  handleEventFormChange, 
  addEvent, 
  events, 
  setCurrentScreen, 
  editEvent,
  deleteEvent,
  isEditModalVisible,
  setIsEditModalVisible,
  editingEvent,
  handleUpdateEvent,
  eventLoading 
}: any) => (
  <View style={styles.screenContainer}>
    <BounceView>
      <Text style={styles.title}>👨‍💼 Admin Panel</Text>
    </BounceView>
    
    <SlideUpView delay={200}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => {
          handleEventFormChange('name', '');
          handleEventFormChange('date', '');
          handleEventFormChange('time', '');
          handleEventFormChange('location', '');
          handleEventFormChange('price', '');
          handleEventFormChange('category', 'regular');
          handleEventFormChange('description', '');
          handleEventFormChange('image', '🎭');
          setIsEditModalVisible(true);
        }}
      >
        <Text style={styles.buttonText}>+ Add New Event</Text>
      </TouchableOpacity>
    </SlideUpView>

    <FadeInView delay={300}>
      <Text style={styles.sectionTitle}>Current Events ({events ? events.length : 0})</Text>
    </FadeInView>
    
    {!events || events.length === 0 ? (
      <FadeInView delay={400}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No events available. Add your first event!</Text>
          <Text style={styles.emptySubtext}>Click "Add New Event" button above to get started.</Text>
        </View>
      </FadeInView>
    ) : (
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <SlideUpView delay={index * 100}>
            <View style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <BounceView>
                  <Text style={styles.eventEmoji}>{item.image}</Text>
                </BounceView>
                <View style={styles.eventActions}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => editEvent(item)}
                  >
                    <Text style={styles.editButtonText}>✏️ Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deleteEvent(item.id)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.eventName}>{item.name}</Text>
              <Text style={styles.eventDetails}>📅 {item.date} | 🕒 {item.time}</Text>
              <Text style={styles.eventDetails}>📍 {item.location}</Text>
              <Text style={styles.eventPrice}>💰 ${item.price} | Category: {item.category}</Text>
              <Text style={styles.eventDescription}>{item.description}</Text>
            </View>
          </SlideUpView>
        )}
        style={styles.eventsList}
      />
    )}

    <EventEditModal
      visible={isEditModalVisible}
      onClose={() => setIsEditModalVisible(false)}
      eventForm={eventForm}
      handleEventFormChange={handleEventFormChange}
      handleSaveEvent={editingEvent ? handleUpdateEvent : addEvent}
      isEditing={!!editingEvent}
      loading={eventLoading}
    />

    <SlideUpView delay={500}>
      <TouchableOpacity style={styles.buttonSecondary} onPress={() => setCurrentScreen("events")}>
        <Text style={styles.buttonTextSecondary}>View Events Page</Text>
      </TouchableOpacity>
    </SlideUpView>
  </View>
);

const EventsScreen = ({ events, user, addToCart, setCurrentScreen }: any) => (
  <View style={styles.screenContainer}>
    <View style={styles.eventsHeader}>
      <BounceView>
        <Text style={styles.title}>📅 Available Events ({events.length})</Text>
      </BounceView>
      <SlideUpView delay={200}>
        <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen("home")}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </SlideUpView>
    </View>
    
    {events.length === 0 ? (
      <FadeInView>
        <Text style={styles.emptyText}>No events available. Check back later!</Text>
      </FadeInView>
    ) : (
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <SlideUpView delay={index * 150}>
            <View style={styles.eventCard}>
              <BounceView>
                <Text style={styles.eventEmoji}>{item.image}</Text>
              </BounceView>
              <Text style={styles.eventName}>{item.name}</Text>
              <Text style={styles.eventDetails}>📅 {item.date} | 🕒 {item.time}</Text>
              <Text style={styles.eventDetails}>📍 {item.location}</Text>
              <Text style={styles.eventPrice}>💰 ${item.price} ({item.category})</Text>
              <Text style={styles.eventDescription}>{item.description}</Text>
              {user && user.type === "user" && (
                <BounceView delay={300}>
                  <TouchableOpacity style={styles.bookButton} onPress={() => addToCart(item)}>
                    <Text style={styles.bookButtonText}>Book Tickets</Text>
                  </TouchableOpacity>
                </BounceView>
              )}
            </View>
          </SlideUpView>
        )}
      />
    )}
  </View>
);

const CartScreen = ({ cart, handleBooking, setCurrentScreen }: any) => (
  <View style={styles.screenContainer}>
    <BounceView>
      <Text style={styles.title}>🛒 Your Cart</Text>
    </BounceView>
    
    {cart.length === 0 ? (
      <FadeInView delay={200}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
      </FadeInView>
    ) : (
      <>
        <FlatList
          data={cart}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <SlideUpView delay={index * 100}>
              <View style={styles.cartItem}>
                <Text style={styles.cartItemName}>{item.event.name}</Text>
                <Text style={styles.cartItemDetails}>
                  {item.quantity} x ${item.event.price} ({item.ticketType})
                </Text>
                <Text style={styles.cartItemTotal}>Total: ${item.total}</Text>
              </View>
            </SlideUpView>
          )}
        />
        
        <SlideUpView delay={300}>
          <Text style={styles.totalText}>
            Total: ${cart.reduce((sum: number, item: CartItem) => sum + item.total, 0)}
          </Text>
        </SlideUpView>

        <BounceView delay={400}>
          <TouchableOpacity style={styles.button} onPress={handleBooking}>
            <Text style={styles.buttonText}>Confirm Booking</Text>
          </TouchableOpacity>
        </BounceView>
      </>
    )}
    
    <SlideUpView delay={500}>
      <TouchableOpacity style={styles.buttonSecondary} onPress={() => setCurrentScreen("events")}>
        <Text style={styles.buttonTextSecondary}>Back to Events</Text>
      </TouchableOpacity>
    </SlideUpView>
  </View>
);

const ConfirmationScreen = ({ bookingId, setCurrentScreen }: any) => (
  <View style={styles.screenContainer}>
    <BounceView>
      <Text style={styles.title}>✅ Booking Confirmed!</Text>
    </BounceView>
    
    <FadeInView delay={300}>
      <Text style={styles.confirmationText}>
        Your booking ID: {bookingId}
      </Text>
    </FadeInView>

    <FadeInView delay={500}>
      <Text style={styles.thankYouText}>Thank you for your purchase!</Text>
    </FadeInView>

    <SlideUpView delay={600}>
      <TouchableOpacity style={styles.button} onPress={() => setCurrentScreen("events")}>
        <Text style={styles.buttonText}>Back to Events</Text>
      </TouchableOpacity>
    </SlideUpView>

    <SlideUpView delay={700}>
      <TouchableOpacity style={styles.buttonSecondary} onPress={() => setCurrentScreen("home")}>
        <Text style={styles.buttonTextSecondary}>Back to Home</Text>
      </TouchableOpacity>
    </SlideUpView>
  </View>
);

// --- MAIN APP COMPONENT ---
export default function Index() {
  const [currentScreen, setCurrentScreen] = useState<
    "home" | "events" | "login" | "signup" | "admin" | "cart" | "confirmation" | "adminLogin"
  >("home");
  const [user, setUser] = useState<User>(null);
  const [events, setEvents] = useState<EventItem[]>(MOCK_EVENTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [eventLoading, setEventLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Form states
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [adminLoginData, setAdminLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: ""
  });
  const [eventForm, setEventForm] = useState({
    name: "", date: "", time: "", location: "", price: "", description: "", category: "regular", image: "🎭"
  });

  // Screen transition animation
  const [screenAnim] = useState(new Animated.Value(1));

  const handleScreenChange = (screen: any) => {
    Animated.timing(screenAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentScreen(screen);
      Animated.timing(screenAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  // Always connected in offline mode
  const testBackendConnection = async () => {
    setBackendConnected(true);
    return true;
  };

  const loadEvents = async () => {
    try {
      const result = await apiCall('/events');
      if (result.success && result.data) {
        setEvents(result.data);
      }
    } catch (error) {
      setEvents(MOCK_EVENTS);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      await testBackendConnection();
      await loadEvents();
    };
    initializeApp();
  }, []);

  // Form handlers
  const handleLoginChange = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  const handleAdminLoginChange = (field: string, value: string) => {
    setAdminLoginData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignupChange = (field: string, value: string) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
  };

  const handleEventFormChange = (field: string, value: string) => {
    setEventForm(prev => ({ ...prev, [field]: value }));
  };

  // Authentication handlers
  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      return Alert.alert("Error", "Please enter both email and password");
    }
    
    setLoading(true);
    try {
      const result = await apiCall('/auth/login', { 
        method: 'POST', 
        body: loginData 
      });
      
      if (result.success && result.data) {
        setUser({ 
          id: result.data.id.toString(), 
          name: result.data.name, 
          email: result.data.email, 
          type: result.data.role || "user" 
        });
        handleScreenChange("events");
        Alert.alert("Success", "Login successful!");
      }
    } catch (error: any) {
      setUser({ 
        id: "1", 
        name: "Demo User", 
        email: loginData.email, 
        type: "user" 
      });
      handleScreenChange("events");
    }
    setLoading(false);
  };

  const handleAdminLogin = async () => {
    if (!adminLoginData.email || !adminLoginData.password) {
      return Alert.alert("Error", "Please enter both email and password");
    }
    
    setLoading(true);
    try {
      const result = await apiCall('/auth/login', { 
        method: 'POST', 
        body: adminLoginData 
      });
      
      if (result.success && result.data && result.data.role === 'admin') {
        setUser({ 
          id: result.data.id.toString(), 
          name: result.data.name, 
          email: result.data.email, 
          type: "admin" 
        });
        handleScreenChange("admin");
        Alert.alert("Success", "Admin login successful!");
      } else {
        Alert.alert("Error", "Invalid admin credentials");
      }
    } catch (error: any) {
      if (adminLoginData.email === "admin@eventbook.com" && adminLoginData.password === "admin123") {
        setUser({ id: "admin1", name: "Admin", email: "admin@eventbook.com", type: "admin" });
        handleScreenChange("admin");
        Alert.alert("Success", "Admin login successful!");
      } else {
        Alert.alert("Error", "Invalid admin credentials");
      }
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!signupData.name || !signupData.email || !signupData.password || !signupData.confirmPassword) {
      return Alert.alert("Error", "Please fill all fields");
    }
    if (signupData.password !== signupData.confirmPassword) {
      return Alert.alert("Error", "Passwords do not match");
    }
    if (signupData.password.length < 6) {
      return Alert.alert("Error", "Password must be at least 6 characters");
    }
    
    setLoading(true);
    try {
      const result = await apiCall('/auth/register', { 
        method: 'POST', 
        body: signupData 
      });
      
      if (result.success && result.data) {
        setUser({ 
          id: result.data.id.toString(), 
          name: result.data.name, 
          email: result.data.email, 
          type: result.data.role || "user" 
        });
        handleScreenChange("events");
        Alert.alert("Success", "Account created successfully!");
        setSignupData({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
      }
    } catch (error: any) {
      setUser({ 
        id: Date.now().toString(), 
        name: signupData.name, 
        email: signupData.email, 
        type: "user" 
      });
      handleScreenChange("events");
      setSignupData({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    setUser(null);
    handleScreenChange("home");
    setCart([]);
    setLoginData({ email: "", password: "" });
    setAdminLoginData({ email: "", password: "" });
  };

  // Event management handlers
  const addEvent = async () => {
    if (!eventForm.name || !eventForm.date || !eventForm.price) {
      return Alert.alert("Error", "Please fill at least Name, Date, and Price");
    }
    
    setEventLoading(true);
    try {
      const newEventData = {
        name: eventForm.name, 
        description: eventForm.description, 
        date: eventForm.date, 
        time: eventForm.time,
        location: eventForm.location, 
        price: Number(eventForm.price),
        category: eventForm.category, 
        image: eventForm.image || '🎭'
      };

      const result = await apiCall('/events', { 
        method: 'POST', 
        body: newEventData 
      });
      
      if (result.success && result.data) {
        const newEvent: EventItem = {
          id: result.data.id.toString(), 
          ...newEventData,
          price: Number(eventForm.price)
        };
        setEvents([...events, newEvent]);
        setEventForm({ name: "", date: "", time: "", location: "", price: "", description: "", category: "regular", image: "🎭" });
        setIsEditModalVisible(false);
        Alert.alert("Success", "Event added successfully!");
      }
    } catch (error: any) {
      const newEvent: EventItem = { 
        id: Date.now().toString(), 
        name: eventForm.name,
        date: eventForm.date,
        time: eventForm.time,
        location: eventForm.location,
        price: Number(eventForm.price),
        category: eventForm.category,
        description: eventForm.description,
        image: eventForm.image || "🎭"
      };
      setEvents([...events, newEvent]);
      setEventForm({ name: "", date: "", time: "", location: "", price: "", description: "", category: "regular", image: "🎭" });
      setIsEditModalVisible(false);
      Alert.alert("Success", "Event added successfully!");
    }
    setEventLoading(false);
  };

  // Edit event functionality
  const editEvent = (event: EventItem) => {
    setEditingEvent(event);
    setEventForm({
      name: event.name,
      date: event.date,
      time: event.time,
      location: event.location,
      price: event.price.toString(),
      description: event.description,
      category: event.category,
      image: event.image
    });
    setIsEditModalVisible(true);
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;
    
    if (!eventForm.name || !eventForm.date || !eventForm.price) {
      return Alert.alert("Error", "Please fill at least Name, Date, and Price");
    }

    setEventLoading(true);
    try {
      const updatedEventData = {
        name: eventForm.name,
        description: eventForm.description,
        date: eventForm.date,
        time: eventForm.time,
        location: eventForm.location,
        price: Number(eventForm.price),
        category: eventForm.category,
        image: eventForm.image || '🎭'
      };

      const result = await apiCall(`/events/${editingEvent.id}`, { 
        method: 'PUT', 
        body: updatedEventData 
      });
      
      if (result.success) {
        const updatedEvents = events.map(event => 
          event.id === editingEvent.id ? { ...event, ...updatedEventData } : event
        );
        setEvents(updatedEvents);
        setEventForm({ name: "", date: "", time: "", location: "", price: "", description: "", category: "regular", image: "🎭" });
        setEditingEvent(null);
        setIsEditModalVisible(false);
        Alert.alert("Success", "Event updated successfully!");
      }
    } catch (error: any) {
      const updatedEvents = events.map(event => 
        event.id === editingEvent.id ? { 
          ...event, 
          name: eventForm.name,
          date: eventForm.date,
          time: eventForm.time,
          location: eventForm.location,
          price: Number(eventForm.price),
          description: eventForm.description,
          category: eventForm.category,
          image: eventForm.image
        } : event
      );
      setEvents(updatedEvents);
      setEventForm({ name: "", date: "", time: "", location: "", price: "", description: "", category: "regular", image: "🎭" });
      setEditingEvent(null);
      setIsEditModalVisible(false);
      Alert.alert("Success", "Event updated successfully!");
    }
    setEventLoading(false);
  };

  const deleteEvent = async (eventId: string) => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const result = await apiCall(`/events/${eventId}`, {
                method: 'DELETE'
              });

              if (result.success) {
                setEvents(events.filter(event => event.id !== eventId));
                Alert.alert("Success", "Event deleted successfully!");
              }
            } catch (error: any) {
              setEvents(events.filter(event => event.id !== eventId));
              Alert.alert("Success", "Event deleted successfully!");
            }
          }
        }
      ]
    );
  };

  const addToCart = (event: EventItem, ticketType = "regular", quantity = 1) => {
    const cartItem: CartItem = { 
      id: Date.now().toString(), 
      event, 
      ticketType, 
      quantity, 
      total: Number(event.price) * quantity 
    };
    setCart([...cart, cartItem]);
    Alert.alert("Added to Cart", `${quantity} ${ticketType} ticket(s) for ${event.name}`);
  };

  const handleBooking = async () => {
    if (cart.length === 0) return Alert.alert("Error", "Cart is empty");
    
    try {
      const bookingData = {
        eventId: cart[0].event.id,
        tickets: cart.map(item => ({ 
          type: item.ticketType, 
          quantity: item.quantity, 
          price: item.event.price 
        }))
      };

      const result = await apiCall('/bookings', { 
        method: 'POST', 
        body: bookingData 
      });
      
      if (result.success && result.data) {
        const newBookingId = result.data.bookingReference || result.data.id || Date.now().toString();
        setCurrentBookingId(newBookingId);
        setCart([]);
        handleScreenChange("confirmation");
        Alert.alert("Booking Confirmed!", `Your booking ID: ${newBookingId}`);
      }
    } catch (error: any) {
      const newBookingId = Date.now().toString();
      setCurrentBookingId(newBookingId);
      setCart([]);
      handleScreenChange("confirmation");
      Alert.alert("Booking Confirmed!", `Your booking ID: ${newBookingId}`);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <HomeScreen setCurrentScreen={handleScreenChange} backendConnected={backendConnected} testBackendConnection={testBackendConnection} />;
      case "events":
        return <EventsScreen events={events} user={user} addToCart={addToCart} setCurrentScreen={handleScreenChange} />;
      case "login":
        return <LoginScreen loginData={loginData} handleLoginChange={handleLoginChange} handleLogin={handleLogin} loading={loading} setCurrentScreen={handleScreenChange} />;
      case "adminLogin":
        return <AdminLoginScreen adminLoginData={adminLoginData} handleAdminLoginChange={handleAdminLoginChange} handleAdminLogin={handleAdminLogin} loading={loading} setCurrentScreen={handleScreenChange} />;
      case "signup":
        return <SignupScreen signupData={signupData} handleSignupChange={handleSignupChange} handleSignup={handleSignup} loading={loading} setCurrentScreen={handleScreenChange} />;
      case "admin":
        return <AdminScreen 
          eventForm={eventForm} 
          handleEventFormChange={handleEventFormChange} 
          addEvent={addEvent} 
          events={events} 
          setCurrentScreen={handleScreenChange}
          editEvent={editEvent}
          deleteEvent={deleteEvent}
          isEditModalVisible={isEditModalVisible}
          setIsEditModalVisible={setIsEditModalVisible}
          editingEvent={editingEvent}
          handleUpdateEvent={handleUpdateEvent}
          eventLoading={eventLoading}
        />;
      case "cart":
        return <CartScreen cart={cart} handleBooking={handleBooking} setCurrentScreen={handleScreenChange} />;
      case "confirmation":
        return <ConfirmationScreen bookingId={currentBookingId} setCurrentScreen={handleScreenChange} />;
      default:
        return <HomeScreen setCurrentScreen={handleScreenChange} backendConnected={backendConnected} testBackendConnection={testBackendConnection} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BounceView>
          <Text style={styles.headerTitle}>🎟️ TicketBook</Text>
        </BounceView>
        <View style={styles.headerRight}>
          <FadeInView>
            <Text style={[styles.connectionDot, styles.connectedDot]}>🟢</Text>
          </FadeInView>
          {user && (
            <View style={styles.headerButtons}>
              <FadeInView>
                <Text style={styles.userWelcome}>Welcome, {user.name}</Text>
              </FadeInView>
              <SlideUpView>
                <TouchableOpacity onPress={() => handleScreenChange("events")}>
                  <Text style={styles.navText}>Events</Text>
                </TouchableOpacity>
              </SlideUpView>
              {user.type === "user" && (
                <SlideUpView delay={100}>
                  <TouchableOpacity onPress={() => handleScreenChange("cart")}>
                    <Text style={styles.navText}>Cart ({cart.length})</Text>
                  </TouchableOpacity>
                </SlideUpView>
              )}
              <SlideUpView delay={200}>
                <TouchableOpacity onPress={handleLogout}>
                  <Text style={styles.navText}>Logout</Text>
                </TouchableOpacity>
              </SlideUpView>
            </View>
          )}
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <Animated.View style={{ flex: 1, opacity: screenAnim }}>
          <ScrollView style={styles.content} contentContainerStyle={{ flexGrow: 1 }}>
            {renderScreen()}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f5f5f5" 
  },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    backgroundColor: "#fff", 
    borderBottomWidth: 1, 
    borderBottomColor: "#ddd",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#333" 
  },
  headerRight: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  headerButtons: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 12 
  },
  userWelcome: { 
    fontSize: 12, 
    color: "#666", 
    marginRight: 8 
  },
  navText: { 
    fontSize: 12, 
    color: "#007AFF", 
    fontWeight: "500",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  connectionDot: { 
    fontSize: 16, 
    marginRight: 8 
  },
  connectedDot: { 
    color: "#34C759" 
  },
  disconnectedDot: { 
    color: "#FF3B30" 
  },
  content: { 
    flex: 1 
  },
  screenContainer: { 
    padding: 16, 
    flex: 1 
  },
  buttonContainer: {
    marginVertical: 8
  },
  eventsHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 16 
  },
  backButton: {
    padding: 8
  },
  backButtonText: { 
    fontSize: 16, 
    color: "#007AFF", 
    fontWeight: "500" 
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginBottom: 16, 
    color: "#333" 
  },
  subtitle: { 
    fontSize: 16, 
    textAlign: "center", 
    marginBottom: 8, 
    color: "#666" 
  },
  connectionStatus: { 
    marginBottom: 16, 
    alignItems: 'center' 
  },
  statusText: { 
    fontSize: 14, 
    fontWeight: "500",
    marginBottom: 8
  },
  statusConnected: { 
    color: "#34C759" 
  },
  statusDisconnected: { 
    color: "#FF9500" 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginVertical: 12, 
    color: "#333"
  },
  button: { 
    backgroundColor: "#007AFF", 
    padding: 14, 
    borderRadius: 8, 
    alignItems: "center", 
    marginVertical: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  buttonSecondary: { 
    backgroundColor: "transparent", 
    padding: 14, 
    borderRadius: 8, 
    alignItems: "center", 
    borderWidth: 1, 
    borderColor: "#007AFF", 
    marginVertical: 8 
  },
  buttonTextSecondary: { 
    color: "#007AFF", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  adminButton: { 
    backgroundColor: "#FF3B30", 
    padding: 14, 
    borderRadius: 8, 
    alignItems: "center", 
    marginVertical: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  adminButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  testButton: { 
    backgroundColor: "#5856D6", 
    padding: 10, 
    borderRadius: 8, 
    alignItems: "center", 
    marginVertical: 8 
  },
  testButtonText: { 
    color: "#fff", 
    fontSize: 14, 
    fontWeight: "bold" 
  },
  input: { 
    borderWidth: 1, 
    borderColor: "#ddd", 
    padding: 12, 
    borderRadius: 8, 
    marginVertical: 8, 
    backgroundColor: "#fff",
    fontSize: 16
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  eventCard: { 
    backgroundColor: "#fff", 
    padding: 16, 
    borderRadius: 8, 
    marginVertical: 8, 
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12
  },
  eventEmoji: { 
    fontSize: 36,
    marginBottom: 8
  },
  eventName: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginBottom: 8,
    color: "#333"
  },
  eventDetails: { 
    fontSize: 14, 
    color: "#666", 
    marginBottom: 4 
  },
  eventPrice: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#007AFF", 
    marginVertical: 8 
  },
  eventDescription: { 
    fontSize: 14, 
    color: "#888", 
    marginTop: 8,
    fontStyle: "italic"
  },
  eventActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8
  },
  editButton: {
    backgroundColor: "#FFA500",
    padding: 4,
    borderRadius: 10,
    flex: 1
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 12
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    padding: 4,
    borderRadius: 10,
    flex: 1
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 12
  },
  bookButton: { 
    backgroundColor: "#34C759", 
    padding: 12, 
    borderRadius: 6, 
    alignItems: "center", 
    marginTop: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  bookButtonText: { 
    color: "#fff", 
    fontWeight: "bold",
    fontSize: 14
  },
  cartItem: { 
    backgroundColor: "#fff", 
    padding: 12, 
    borderRadius: 8, 
    marginVertical: 6,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1
  },
  cartItemName: { 
    fontSize: 16, 
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4
  },
  cartItemDetails: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2
  },
  cartItemTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007AFF"
  },
  emptyText: { 
    textAlign: "center", 
    fontSize: 16, 
    color: "#666", 
    marginTop: 40,
    fontStyle: "italic"
  },
  totalText: { 
    fontSize: 18, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginVertical: 16,
    color: "#333"
  },
  linkText: { 
    color: "#007AFF", 
    textAlign: "center", 
    marginTop: 12, 
    fontSize: 14
  },
  demoText: { 
    textAlign: "center", 
    fontSize: 12, 
    color: "#666", 
    fontStyle: "italic", 
    marginBottom: 12 
  },
  confirmationText: {
    textAlign: "center", 
    marginTop: 16, 
    fontSize: 16,
    color: "#333"
  },
  thankYouText: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    fontStyle: "italic"
  },
  eventsList: {
    maxHeight: 400,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginVertical: 20
  },
  emptySubtext: {
    textAlign: "center", 
    fontSize: 14, 
    color: "#999", 
    fontStyle: "italic"
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#333"
  },
  modalScrollView: {
    maxHeight: 400
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12
  },
});