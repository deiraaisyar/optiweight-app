---

## 📱 Overview
OptiWeight is a mobile application designed to help users manage their weight effectively. It provides features like activity tracking, chatbot assistance, notifications, and user profile management to create a personalized experience.

---

## ✨ Key Features
- **Interactive Chatbot**: Offers health tips and guidance.
- **Activity Calendar**: Tracks daily schedules and activities.
- **Notifications**: Reminds users of important tasks or events.
- **User Profiles**: Stores user data for a personalized experience.
- **Firebase Integration**: Utilizes Firebase for authentication, hosting, and backend services.

---

## 🛠️ Tech Stack
- **Frontend**: React Native
- **Backend**: Node.js with Express
- **Database**: Firebase Firestore
- **Hosting**: Firebase Hosting
- **Authentication**: Firebase Authentication
- **Languages**: TypeScript
- **Others**: Docker for local deployment

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/deiraaisyar/optiweight-app.git
cd optiweight-app
```

### 2. Install Dependencies
For both frontend and backend:
```bash
npm install
```

### 3. Run the Application
- **Frontend**:
  ```bash
  npm start
  ```
- **Backend**:
  ```bash
  cd backend
  npm run dev
  ```

### 4. Build APK
To generate an APK file:
```bash
cd android
./gradlew assembleDebug
```
The APK will be located at app-debug.apk.

---

## 🐳 Docker Deployment

### Build and Run with Docker
1. **Build the Docker Image**:
   ```bash
   docker build -t optiweight-backend .
   ```
2. **Run the Docker Container**:
   ```bash
   docker run -p 5000:5000 optiweight-backend
   ```

---

## 📂 Project Structure
```
optiweight/
├── android/         # Android configuration
├── backend/         # Backend API
│   ├── src/         # Backend source code
│   └── Dockerfile   # Docker configuration for backend
├── frontend/        # React Native source code
├── .env             # Environment variables
└── README.md        # Project documentation
```

---

## 🔐 Authentication and Security
- Firebase Authentication is used for user login and registration.
- User data is securely stored in Firebase Firestore.
- Sensitive files like `serviceAccountKey.json` are excluded from the repository.

---

## 📱 Application Features
1. **Chatbot**: Provides health-related tips and guidance.
2. **Calendar**: Tracks user activities and schedules.
3. **Notifications**: Sends reminders for important events.
4. **Profile Management**: Stores user data for a personalized experience.

---

## 🤝 Contributing
We welcome contributions! Feel free to fork the repository, create a branch, and submit a Pull Request. You can also open an Issue for any bugs or feature requests.

---

## 📄 License
This project is licensed under the MIT License.

---

## 🙏 Acknowledgements
Thank you to all contributors and users who have supported the development of OptiWeight. 🚀

---

## 👥 Contributors

We would like to thank the following contributors for their efforts in building OptiWeight:

- [Farhan Adiwidya Pradana](https://github.com/Farscent) - Hustler
- [Muhammad Keenan Basyir]() - Hipster
- [Dhimas Putra Sulistio](https://github.com/muddglobb) - Hacker (Frontend Developer)
- [Deira Aisya Refani](https://github.com/deiraaisyar) - Hacker (Backend Developer)

Feel free to join us and contribute to this project! 🚀

---

Feel free to adjust this content to better suit your project! 😊