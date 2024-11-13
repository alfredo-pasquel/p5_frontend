# Needle Drop Vinyl Web Platform

## Project Overview
Needle Drop is a community-driven platform designed for vinyl enthusiasts. Users can buy, sell, trade, and share their vinyl record collections. The platform fosters a vibrant community where collectors can connect, exchange recommendations, and discover new music.

## Features
- **User Authentication**: Secure login and sign-up functionality.
- **Spotify Integration**: Preview albums directly on the platform.
- **Dynamic Wishlists**: Save and get notified when your desired records are listed.
- **User Profiles**: Showcase collections, track trades, and engage with other collectors.
- **Recommendations**: Personalized album suggestions based on user preferences.
- **Messaging System**: Communicate directly with other users for trades and discussions.

## Technologies Used
### Frontend
- **React**: For building the user interface.
- **React Router**: For navigation and routing.
- **Material UI**: For consistent, modern design and styling.
- **Axios**: For making HTTP requests.
- **Socket.IO Client**: For real-time updates.

### Development Tools
- **Vite**: For fast builds and development server.
- **ESLint**: For maintaining code quality.
- **Node.js**: Version 18.17.0, as specified in the project.

## Project Structure
```plaintext
.
├── public/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Application pages
│   │   ├── Home.jsx      # Home page
│   │   ├── ProfilePage.jsx  # User profile
│   │   ├── SignUpPage.jsx   # Sign-up page
│   │   ├── ListRecordPage.jsx # Create new record listing
│   │   ├── ListingPage.jsx   # View individual record
│   │   ├── MessageDetailPage.jsx # Messaging page
│   ├── utils/            # Utility functions (e.g., Spotify API)
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.html        # HTML template
├── package.json          # Project dependencies and scripts
└── README.md             # Project documentation
```

## Getting Started
### Prerequisites
- **Node.js** (v18.17.0 or higher)
- **npm** (comes with Node.js)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/needle-drop.git
   cd needle-drop
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Project
- Start the development server:
  ```bash
  npm run dev
  ```
- Open the app in your browser at `http://localhost:3000`.

### Building for Production
To create a production build:
```bash
npm run build
```
Preview the production build:
```bash
npm run preview
```

## Environment Variables
Ensure the following environment variables are set:
- **`VITE_API_URL`**: Backend API base URL.
- **`SPOTIFY_CLIENT_ID`**: For Spotify API integration.
- **`SPOTIFY_CLIENT_SECRET`**: For Spotify API authentication.

## Backend Repository
This project requires a backend server for handling data. Refer to the [Needle Drop Backend Repository](https://github.com/alfredo-pasquel/p5_backend) for setup instructions.

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## Contact
For questions or suggestions:
- **Email**: [alfredo.pasquel@gmail.com](mailto:alfredo.pasquel@gmail.com)
- **LinkedIn**: [Alfredo Pasquel](https://www.linkedin.com/in/alfredo-pasquel/)
```