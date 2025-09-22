import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Button, Alert } from "react-native";

export default function App() {
  const [events, setEvents] = useState([]);

  // Replace with your backend IP for mobile or localhost for web
  const BACKEND_URL = "http://localhost:5000";

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/events`)
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.log(err));
  }, []);

  const bookTicket = (eventId) => {
    fetch(`${BACKEND_URL}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: 1,
        event_id: eventId,
        ticket_type: "Regular",
        quantity: 1,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        Alert.alert("Booking Success", `Booking ID: ${data.data.event_id}`);
      })
      .catch((err) => console.log(err));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Events</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>{item.date}</Text>
            <Text>${item.ticketPrice}</Text>
            <Button
              title="Book Ticket"
              onPress={() => bookTicket(item.id)}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 50 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  item: { marginBottom: 20, padding: 15, borderWidth: 1, borderColor: "#ccc" },
  name: { fontSize: 18, fontWeight: "bold" },
});