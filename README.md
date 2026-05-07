
# Laptop-Friendly Places

> Discover the best cafés, libraries, co-working spaces, and restaurants for productive work — anywhere you go.

Built for remote workers, students, freelancers, and digital nomads who need reliable Wi-Fi, charging outlets, and a quiet place to get things done.

---

## Features

* **Place Discovery** — Search and explore laptop-friendly venues with detailed amenity info
* **Interactive Map** — Visualize nearby spots powered by Leaflet / Maps API
* **Favorites** — Save and manage your go-to workspaces
* **Contributor System** — Submit and suggest new places to the community
* **Admin Dashboard** — Manage listings, users, and submissions
* **Authentication** — Secure login with protected routes
* **Dark Mode** — Easy on the eyes during late-night sessions
* **Fully Responsive** — Seamless experience across desktop, tablet, and mobile
* **Smooth Animations** — Polished transitions powered by Framer Motion

---

## Tech Stack

| Technology         | Purpose                         |
| ------------------ | ------------------------------- |
| React.js           | Frontend framework              |
| Vite               | Build tool                      |
| React Router DOM   | Client-side routing             |
| Zustand            | Global state management         |
| Context API        | Shared application context      |
| Axios              | HTTP client for API requests    |
| Framer Motion      | Animations and page transitions |
| Leaflet / Maps API | Interactive map integration     |
| CSS3               | Component and layout styling    |

---

## Project Structure

```
src/
├── assets/            # Static assets (images, icons, fonts)
├── components/        # Reusable UI components
│   ├── Auth/          # Login, register, and auth guards
│   ├── map/           # Map view and markers
│   ├── place/         # Place cards, details, and filters
│   └── ui/            # Shared elements (buttons, modals, inputs)
├── context/           # React context providers
├── hooks/             # Custom React hooks
├── pages/             # Route-level page components
│   └── admin/         # Admin dashboard pages
├── routes/            # Route definitions and protected routes
├── services/          # API service layer
├── store/             # Zustand global stores
├── styles/            # Global stylesheets
├── utils/             # Shared helper functions
├── api.js             # Axios instance and API config
├── App.jsx            # Root application component
├── main.jsx           # Application entry point
└── index.css          # Global CSS reset and base styles
```

---

## Architecture

The app follows a clean, scalable frontend architecture suitable for production-level React applications.

**Component Layer** — Reusable, isolated UI elements organized by feature domain to reduce duplication and improve maintainability.

**Page Layer** — Route-level views that compose components into complete application screens.

**State Management** — Zustand handles global state with minimal boilerplate; Context API manages cross-cutting concerns like theme and auth.

**Service Layer** — All API calls are abstracted into dedicated service modules, keeping components clean and logic easy to test.

**Routing Layer** — Centralized route configuration with authentication guards for protected pages.

**Utility Layer** — Shared helper functions kept separate from business logic.

---

## Getting Started

### Prerequisites

* Node.js v18 or higher
* npm v9 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/binyam69dev/laptop-friendly-places-frontend.git

# Navigate into the project
cd laptop-friendly-places-frontend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=your_backend_api_url
VITE_MAP_API_KEY=your_map_api_key
```

### Start the Development Server

```bash
npm run dev
```

---

## Available Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`     | Start the local development server   |
| `npm run build`   | Build the app for production         |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run ESLint to check for code issues  |

---

## API Integration

The frontend communicates with a RESTful backend through the centralized service layer, covering:

* User authentication and session management
* Place discovery, search, and filtering
* Favorites creation and management
* Contributor place submissions
* Admin moderation and operations
* User profile management

---

## Production Build

```bash
npm run build
```

Output is generated in the `dist/` directory, ready for deployment to any static hosting provider.

---

## Developer

**Binyam** — Full Stack Developer

* GitHub: [binyam69dev](https://github.com/binyam69dev)
* Repository: [laptop-friendly-places-frontend](https://github.com/binyam69dev/laptop-friendly-places-frontend)

---

## License

This project is open-source and available for educational, learning, and portfolio purposes.
