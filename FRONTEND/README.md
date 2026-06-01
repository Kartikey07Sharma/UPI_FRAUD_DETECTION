# 🚀 Frontend Documentation - UPI Fraud Detection System

This directory contains the frontend implementation of the UPI Fraud Detection System. It is built using modern web technologies to provide a seamless, interactive, and high-performance user experience.

## 🛠 Tech Stack & Language

- **Language**: [JavaScript (React)](https://react.dev/) - Using JSX syntax for component-based UI development.
- **Build Tool**: [Vite](https://vitejs.dev/) - Next-generation frontend tooling for fast development.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework for rapid and modern styling.
- **Components**: [Shadcn/UI](https://ui.shadcn.com/) - High-quality, accessible UI components built on Radix UI.
- **Icons**: [Lucide React](https://lucide.dev/) - Clean and consistent icon set.
- **Networking**: [Axios](https://axios-http.com/) - For making API requests to the Backend and ML services.

---

## 📂 Project Structure & Components

### 🏗 Core Files
- **`main.jsx`**: The entry point of the application. It bootstraps the React app and renders the `App` component into the `root` DOM element.
- **`App.jsx`**: The root component where all routing logic resides. It defines the paths for the Landing page, Dashboard, Analytics, and more.
- **`index.css`**: Global stylesheet containing Tailwind directives and custom design tokens (colors, fonts, glassmorphism effects).

### 🧩 Folders
- **`src/pages/`**: Contains the full-page components (scenes).
- **`src/components/`**: Reusable UI blocks like Sidebars, NavLinks, and Animated Backgrounds.
- **`src/components/ui/`**: Low-level, primitive UI components from Shadcn (Buttons, Inputs, Cards, Toasts).
- **`src/services/`**: API communication logic. `api.js` handles all outgoing requests to the backend server.
- **`src/lib/`**: Contains utility functions like `cn` (class name merger) for dynamic styling.
- **`src/hooks/`**: Custom React hooks (e.g., `use-toast`, `use-mobile`) for shared logic across components.

---

## 🌊 Application Flow & Use Cases

The application follows a logical progression designed for both end-users and administrators:

### 1. 🏠 Landing Page (`Landing.jsx`)
- **First Stop**: Shows a premium, animated hero section explaining what the system does.
- **Call to Action**: Directs users to "Get Started," leading them to the Auth or Simulator.

### 2. 🔐 Authentication (`Auth.jsx`)
- **Use Case**: Secure access control for users and admins.
- **Features**: Login and Registration forms connected to the backend database.

### 3. 📊 Dashboard (`Dashboard.jsx`)
- **Use Case**: A high-level overview of system status.
- **Analytic Insight**: Shows quick stats like "Total Transactions Processed," "Fraud Detected," and "System Health."

### 4. 🧪 Transaction Simulator (`TransactionSimulator.jsx`)
- **Use Case**: The heart of the testing environment.
- **Flow**: Users input transaction details (Amount, Type, IDs) and hit "Analyze."
- **Logic**: It sends data to the **ML Service** via the backend and displays a real-time risk score and fraud prediction.

### 📈 Analytics (`Analytics.jsx`)
- **Use Case**: In-depth data visualization.
- **Visualization**: Uses charts (Bar, Area, Pie) to show fraud trends over time and risk distribution. It helps in spotting patterns that simple logs might miss.

### 🛠 Admin Panel (`AdminPanel.jsx`)
- **Use Case**: System management and monitoring.
- **Features**: User management, detailed audit logs, and configuration settings for the fraud detection thresholds.

---

## 🚀 How to Run Locally

1. **Install Dependencies**:
   ```bash
   npm i
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 💡 Key Design Decisions
- **Assess Component Use**: Every UI element is built using a consistent "UI first" approach. This ensures that even small components like buttons or cards behave identically throughout the app.
- **Glassmorphism**: The UI uses subtle transparency and blur effects to create a modern, premium "FinTech" feel.
- **Hooks & Services Separation**: By keeping API calls in `services/` and logic in `hooks/`, the components remain clean and focused only on rendering.
