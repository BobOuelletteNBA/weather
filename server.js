const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Weather API endpoint
app.get('/api/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    console.log(`Fetching weather for: ${city}`);
    
    // Parse the search query to extract city, state, and country
    const searchParts = city.split(',').map(part => part.trim());
    const cityName = searchParts[0];
    let stateName = searchParts[1] || '';
    const countryName = searchParts[2] || '';
    
    // Map common abbreviations to full names
    const stateAbbreviations = {
      // Canadian provinces
      'AB': 'Alberta', 'BC': 'British Columbia', 'MB': 'Manitoba', 'NB': 'New Brunswick',
      'NL': 'Newfoundland and Labrador', 'NS': 'Nova Scotia', 'ON': 'Ontario', 'PE': 'Prince Edward Island',
      'QC': 'Quebec', 'SK': 'Saskatchewan', 'NT': 'Northwest Territories', 'NU': 'Nunavut', 'YT': 'Yukon',
      // US states (common ones)
      'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California', 'CO': 'Colorado',
      'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
      'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana',
      'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
      'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
      'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
      'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota',
      'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington',
      'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
    };
    
    // Expand abbreviation if found
    if (stateName && stateAbbreviations[stateName.toUpperCase()]) {
      stateName = stateAbbreviations[stateName.toUpperCase()];
      console.log(`Expanded abbreviation: ${searchParts[1]} → ${stateName}`);
    }
    
    console.log(`Parsed search - City: "${cityName}", State: "${stateName}", Country: "${countryName}"`);
    
    // First, get coordinates for the city using a geocoding service
    console.log('Step 1: Getting coordinates...');
    // Search using just the city name for better results
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=10&language=en&format=json`;
    console.log('Geocoding URL:', geoUrl);
    
    const geoResponse = await axios.get(geoUrl);
    console.log('Geocoding response:', JSON.stringify(geoResponse.data, null, 2));
    
    if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
      console.log('No results found for city:', cityName);
      return res.status(404).json({
        error: 'City not found',
        message: 'Please check the city name and try again'
      });
    }
    
    // Smart location matching based on search query
    let location = geoResponse.data.results[0]; // Default to first result
    
    // If we have state or country specified, try to match more precisely
    if (stateName || countryName) {
      console.log('Attempting smart matching with state/country filters...');
      
      let bestMatch = null;
      let bestScore = 0;
      
      // Try to find the best match based on admin areas and country
      for (const result of geoResponse.data.results) {
        const resultCountry = result.country?.toLowerCase() || '';
        const resultAdmin1 = result.admin1?.toLowerCase() || '';
        const resultAdmin2 = result.admin2?.toLowerCase() || '';
        
        let matchScore = 1; // Base score for having the city name
        
        // Check if country matches
        if (countryName) {
          const searchCountry = countryName.toLowerCase();
          if (resultCountry.includes(searchCountry) || searchCountry.includes(resultCountry) ||
              // Handle common country name variations
              (searchCountry.includes('usa') && resultCountry.includes('united states')) ||
              (searchCountry.includes('united states') && resultCountry.includes('usa')) ||
              (searchCountry.includes('uk') && resultCountry.includes('united kingdom')) ||
              (searchCountry.includes('united kingdom') && resultCountry.includes('uk'))) {
            matchScore += 3;
          }
        }
        
        // Check if state/province matches
        if (stateName) {
          const searchState = stateName.toLowerCase();
          if (resultAdmin1.includes(searchState) || searchState.includes(resultAdmin1) ||
              resultAdmin2.includes(searchState) || searchState.includes(resultAdmin2)) {
            matchScore += 2;
          }
        }
        
        // Keep track of the best match
        if (matchScore > bestScore) {
          bestMatch = result;
          bestScore = matchScore;
          console.log(`New best match: ${result.name}, ${result.admin1}, ${result.country} (score: ${matchScore})`);
        }
      }
      
      // Use the best match if we found a good one
      if (bestMatch && bestScore >= 3) {
        location = bestMatch;
        console.log(`Using best match with score ${bestScore}`);
      }
    }
    
    const { latitude, longitude, name, country } = location;
    const admin1 = location.admin1 ? `, ${location.admin1}` : '';
    console.log(`Selected location: ${name}${admin1}, ${country} (${latitude}, ${longitude})`);
    
    // Get weather data using Open-Meteo (completely free, no API key needed)
    console.log('Step 2: Getting weather data...');
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relative_humidity_2m&timezone=auto`;
    console.log('Weather URL:', weatherUrl);
    
    const weatherResponse = await axios.get(weatherUrl);
    console.log('Weather response:', JSON.stringify(weatherResponse.data, null, 2));
    
    const current = weatherResponse.data.current_weather;
    
    // Map weather codes to descriptions and icons
    const weatherCodeMap = {
      0: { description: 'Clear sky', icon: '113' },
      1: { description: 'Mainly clear', icon: '116' },
      2: { description: 'Partly cloudy', icon: '119' },
      3: { description: 'Overcast', icon: '122' },
      45: { description: 'Fog', icon: '248' },
      48: { description: 'Depositing rime fog', icon: '248' },
      51: { description: 'Light drizzle', icon: '263' },
      53: { description: 'Moderate drizzle', icon: '266' },
      55: { description: 'Dense drizzle', icon: '281' },
      61: { description: 'Slight rain', icon: '296' },
      63: { description: 'Moderate rain', icon: '302' },
      65: { description: 'Heavy rain', icon: '308' },
      71: { description: 'Slight snow', icon: '326' },
      73: { description: 'Moderate snow', icon: '332' },
      75: { description: 'Heavy snow', icon: '338' },
      80: { description: 'Slight rain showers', icon: '353' },
      81: { description: 'Moderate rain showers', icon: '356' },
      82: { description: 'Violent rain showers', icon: '359' },
      95: { description: 'Thunderstorm', icon: '386' },
      96: { description: 'Thunderstorm with hail', icon: '389' },
      99: { description: 'Thunderstorm with heavy hail', icon: '392' }
    };
    
    const weatherInfo = weatherCodeMap[current.weathercode] || { description: 'Unknown', icon: '113' };
    
    // Get humidity from hourly data (first hour)
    const humidity = weatherResponse.data.hourly?.relative_humidity_2m?.[0] || 50;
    
    const weatherData = {
      city: name,
      admin1: location.admin1 || '',
      country: country,
      temperature: Math.round(current.temperature),
      description: weatherInfo.description,
      humidity: humidity,
      windSpeed: Math.round(current.windspeed / 3.6 * 10) / 10, // Convert km/h to m/s
      icon: weatherInfo.icon
    };
    
    console.log('Final weather data:', JSON.stringify(weatherData, null, 2));
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API Error:', error.message);
    console.error('Error details:', error.response?.data || error);
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      message: 'Please try again later'
    });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Weather app running on http://localhost:${PORT}`);
});