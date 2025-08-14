document.addEventListener('DOMContentLoaded', function() {
    const cityInput = document.getElementById('cityInput');
    const stateInput = document.getElementById('stateInput');
    const countryInput = document.getElementById('countryInput');
    const countryManualInput = document.getElementById('countryManualInput');
    const searchBtn = document.getElementById('searchBtn');
    const loading = document.getElementById('loading');
    const weatherCard = document.getElementById('weatherCard');
    const errorMessage = document.getElementById('errorMessage');
    
    // State/Province data for different countries
    const stateProvinceData = {
        'Canada': [
            'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
            'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
            'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'
        ],
        'United States': [
            'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
            'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
            'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
            'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
            'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
            'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma',
            'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
            'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
            'West Virginia', 'Wisconsin', 'Wyoming'
        ],
        'Australia': [
            'Australian Capital Territory', 'New South Wales', 'Northern Territory',
            'Queensland', 'South Australia', 'Tasmania', 'Victoria', 'Western Australia'
        ],
        'United Kingdom': [
            'England', 'Scotland', 'Wales', 'Northern Ireland'
        ],
        'Germany': [
            'Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen',
            'Hamburg', 'Hesse', 'Lower Saxony', 'Mecklenburg-Vorpommern',
            'North Rhine-Westphalia', 'Rhineland-Palatinate', 'Saarland',
            'Saxony', 'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia'
        ],
        'India': [
            'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
            'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
            'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
            'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
            'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
        ],
        'Brazil': [
            'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal',
            'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul',
            'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí',
            'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia',
            'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins'
        ],
        'Mexico': [
            'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
            'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato',
            'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos',
            'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo',
            'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala',
            'Veracruz', 'Yucatán', 'Zacatecas'
        ]
    };
    
    // Weather data elements
    const cityName = document.getElementById('cityName');
    const weatherIcon = document.getElementById('weatherIcon');
    const temp = document.getElementById('temp');
    const weatherDesc = document.getElementById('weatherDesc');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('windSpeed');
    
    // Event listeners
    searchBtn.addEventListener('click', handleSearch);
    countryInput.addEventListener('change', handleCountryChange);
    
    // Add enter key support for all input fields
    [cityInput, stateInput, countryInput, countryManualInput].forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    });
    
    // Handle country selection change
    function handleCountryChange() {
        const selectedCountry = countryInput.value;
        
        if (selectedCountry === 'Other') {
            // Show manual input for country
            countryInput.style.display = 'none';
            countryManualInput.style.display = 'block';
            countryManualInput.focus();
            // Disable state input when using manual country
            stateInput.disabled = true;
            stateInput.innerHTML = '<option value="">State/Province (optional)</option>';
        } else if (selectedCountry === '') {
            // No country selected
            stateInput.disabled = true;
            stateInput.innerHTML = '<option value="">State/Province (optional)</option>';
            countryInput.style.display = 'block';
            countryManualInput.style.display = 'none';
        } else {
            // Country selected from dropdown
            countryInput.style.display = 'block';
            countryManualInput.style.display = 'none';
            populateStates(selectedCountry);
        }
    }
    
    // Populate state/province dropdown based on selected country
    function populateStates(country) {
        const states = stateProvinceData[country];
        
        if (states && states.length > 0) {
            stateInput.disabled = false;
            stateInput.innerHTML = '<option value="">State/Province (optional)</option>';
            
            states.forEach(state => {
                const option = document.createElement('option');
                option.value = state;
                option.textContent = state;
                stateInput.appendChild(option);
            });
        } else {
            // No states available for this country
            stateInput.disabled = true;
            stateInput.innerHTML = '<option value="">State/Province (optional)</option>';
        }
    }
    
    // Handle manual country input
    countryManualInput.addEventListener('blur', function() {
        if (countryManualInput.value.trim() === '') {
            // If manual input is empty, go back to dropdown
            countryInput.style.display = 'block';
            countryManualInput.style.display = 'none';
            countryInput.value = '';
            handleCountryChange();
        }
    });
    
    async function handleSearch() {
        const city = cityInput.value.trim();
        const state = stateInput.value.trim();
        // Get country from either dropdown or manual input
        const country = countryManualInput.style.display === 'block' 
            ? countryManualInput.value.trim() 
            : countryInput.value.trim();
        
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
    handleCountryChange(); // This will populate the state dropdown
    handleSearch();
});