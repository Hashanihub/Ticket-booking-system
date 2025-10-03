Ticket-booking-system (backend + frontend+)

Structure:

backend   -> Node.js + Express server (file-based JSON storage) - prefers port 5001
frontend  -> React app (source in frontend/src)
mobile    -> Expo Go app (mobile client)

How to run locally (Windows PowerShell):

Frontend ---> cd Ticket-booking-system
              cd frontend
              npm install 
              npm start

Backend prefers port 4000;
Backend ---> cd backend
             node server.js

Opens at http://localhost:8081 (React dev server).
To serve via backend, run: npm run build and copy build into backend/frontend/build

Mobile (Expo)

Install expo CLI if you don't have it: npm install -g expo-cli cd event-booking-complete-mobile/mobile npm install expo start
For Android emulator use API base exp://10.253.3.83:8081 (already set in mobile screens).

Default accounts (seeded on first backend run):

Admin: admin@eventbook.com / admin123

Notes:

The backend uses simple file-based JSON storage in backend/data/
Mobile uses 10.0.2.2 to reach host machine when using Android emulator. Change to your machine IP for physical device.
