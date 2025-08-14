document.addEventListener('DOMContentLoaded', function() {
    const cityInput = document.getElementById('cityInput');
    const stateInput = document.getElementById('stateInput');
    const countryInput = document.getElementById('countryInput');
    const searchBtn = document.getElementById('searchBtn');
    const loading = document.getElementById('loading');
    const weatherCard = document.getElementById('weatherCard');
    const errorMessage = document.getElementById('errorMessage');
    
    // Weather data elements
    const cityName = document.getElementById('cityName');
    const weatherIcon = document.getElementById('weatherIcon');
    const temp = document.getElementById('temp');
    const weatherDesc = document.getElementById('weatherDesc');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('windSpeed');
    
    // Event listeners
    searchBtn.addEventListener('click', handleSearch);
    
    // Add enter key support for all input fields
    [cityInput, stateInput, countryInput].forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    });
    
    async function handleSearch() {
        const city = cityInput.value.trim();
        const state = stateInput.value.trim();
        const country = countryInput.value.trim();
        
        if (!city) {
            showError('Please enter a city name');
            return;
        }
        
        showLoading();
        
        try {
            // Build search query with optional state and country
            let searchQuery = city;
            if (state) searchQuery += `, ${state}`;
            if (country) searchQuery += `, ${country}`;
            
            const response = await fetch(`/api/weather/${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch weather data');
            }
            
            displayWeather(data);
        } catch (error) {
            console.error('Error fetching weather:', error);
            showError(error.message || 'Failed to fetch weather data. Please try again.');
        }
    }
    
    function displayWeather(data) {
        hideAll();
        
        // Update weather card with data - include admin area if available
        let locationText = data.city;
        if (data.admin1) {
            locationText += `, ${data.admin1}`;
        }
        locationText += `, ${data.country}`;
        
        cityName.textContent = locationText;
        temp.textContent = data.temperature;
        weatherDesc.textContent = data.description;
        humidity.textContent = data.humidity;
        windSpeed.textContent = data.windSpeed;
        
        // Set weather icon
        weatherIcon.src = `https://cdn.weatherapi.com/weather/64x64/day/${data.icon}.png`;
        weatherIcon.alt = data.description;
        
        weatherCard.classList.remove('hidden');
    }
    
    function showLoading() {
        hideAll();
        loading.classList.remove('hidden');
    }
    
    function showError(message) {
        hideAll();
        errorMessage.querySelector('p').textContent = message;
        errorMessage.classList.remove('hidden');
    }
    
    function hideAll() {
        loading.classList.add('hidden');
        weatherCard.classList.add('hidden');
        errorMessage.classList.add('hidden');
    }
    
    // Load default city on page load
    cityInput.value = 'London';
    countryInput.value = 'United Kingdom';
    handleSearch();
});