# 🌤️ Weather App

A beautiful, responsive Node.js weather application that displays current weather data for any city worldwide.

## Features

- 🌍 **Global Weather Data** - Get weather for any city
- 🎨 **Modern UI** - Beautiful gradient design with smooth animations
- 📱 **Responsive** - Works perfectly on desktop and mobile
- ⚡ **Fast & Lightweight** - Quick loading and minimal dependencies
- 🔄 **Real-time Data** - Live weather information from Open-Meteo API (no API key required)
- 🔍 **Enhanced Search** - Support for city, state/province, and country with abbreviation expansion
- 🌐 **Smart Location Matching** - Disambiguates cities with same names (London, UK vs London, ON)

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/BobOuelletteNBA/weather.git
   cd weather
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the app:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   - Go to `http://localhost:3000`
   - Enter any city name and get instant weather data!

## Enhanced Search Features

- **Basic Search:** "London"
- **City + State:** "London, Ontario" 
- **City + Country:** "Paris, France"
- **Full Specification:** "Saint John, NB, Canada"
- **Abbreviation Support:** NB → New Brunswick, TX → Texas, etc.

## Development

For development with auto-restart:
```bash
npm run dev
```

## API Endpoints

- `GET /` - Main weather app page
- `GET /api/weather/:city` - Get weather data for a specific city

## Technologies Used

- **Backend:** Node.js, Express.js
- **Frontend:** Vanilla JavaScript, CSS3, HTML5
- **API:** Open-Meteo API (completely free, no API key required)
- **Styling:** Modern CSS with gradients and animations
- **Geocoding:** Open-Meteo Geocoding API

## Project Structure

```
weather/
├── public/
│   ├── index.html      # Main HTML page
│   ├── style.css       # Styles and animations
│   └── script.js       # Frontend JavaScript
├── server.js           # Express server
├── package.json        # Dependencies and scripts
├── .env               # Environment variables
└── README.md          # This file
```

## License

MIT License - feel free to use this project for learning and development!