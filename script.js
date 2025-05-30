const apiKey = "2218eadd629e5a29a0039f5267dfd6be";
const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const suggestionsBox = document.getElementById("suggestions");

const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const conditions = document.getElementById("conditions");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const weatherIcon = document.getElementById("weather-icon");
const aqiValue = document.getElementById("aqi-value");
document.getElementById('logo').addEventListener('click', () => {
  window.location.reload();
});
let cityList = [];

fetch("./city.list.json") 
  .then((res) => res.json())
  .then((data) => {
    cityList = data;
    console.log("Cities loaded:", cityList.length); 
  })
  .catch((error) => console.error("Error loading city list:", error));

function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("City not found");
      }
      return response.json();
    })
    .then((data) => {
      const { lat, lon } = data.coord; // Get latitude and longitude for AQI request
      fetchAqi(lat, lon); // Fetch AQI data for this city
      updateWeatherUI(data);
    })
    .catch((error) => {
      alert(error.message);
    });
}

function fetchWeatherByLocation(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Unable to fetch location-based weather");
      }
      return response.json();
    })
    .then((data) => {
      fetchAqi(lat, lon); // Fetch AQI data for this location
      updateWeatherUI(data);
    })
    .catch((error) => {
      alert(error.message);
    });
}

function fetchAqi(lat, lon) {
  const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  fetch(aqiUrl)
    .then((response) => response.json())
    .then((data) => {
      const aqi = data.list[0].main.aqi; // AQI value is returned in a nested structure
      updateAqiUI(aqi); // Update the AQI on the UI
    })
    .catch((error) => {
      console.error("Error fetching AQI:", error);
    });
}

function updateWeatherUI(data) {
  // Hide the placeholder message
  const placeholder = document.getElementById("placeholder-message");
  if (placeholder) placeholder.style.display = "none";

   document.querySelector('.weather-cards').classList.add('visible');
  cityName.textContent = `City: ${data.name}, ${data.sys.country}`;
  temperature.textContent = `Temperature: ${data.main.temp}°C`;
  conditions.textContent = `Conditions: ${data.weather[0].description}`;
  humidity.textContent = `Humidity: ${data.main.humidity}%`;
  windSpeed.textContent = `Wind Speed: ${data.wind.speed} m/s`;

  const iconCode = data.weather[0].icon;
  weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  document.querySelector(".weather-info").classList.add("visible");
}

function updateAqiUI(aqi) {
  let aqiText = "";
  switch (aqi) {
    case 1:
      aqiText = "Good";
      break;
    case 2:
      aqiText = "Fair";
      break;
    case 3:
      aqiText = "Moderate";
      break;
    case 4:
      aqiText = "Poor";
      break;
    case 5:
      aqiText = "Very Poor";
      break;
    default:
      aqiText = "Unknown";
      break;
  }
  
  aqiValue.textContent = `Air Quality Index: ${aqiText}`;
}

// Request the location as soon as the site is loaded
window.onload = () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByLocation(latitude, longitude);
      },
      (error) => {
     
      }
    );
  } else {

  }
};

cityInput.addEventListener("input", () => {
  const query = cityInput.value.toLowerCase().trim();
  suggestionsBox.innerHTML = "";

  if (query.length < 2) {
    suggestionsBox.style.display = "none";
    return;
  }

  const matches = cityList
    .filter((city) => city.name.toLowerCase().includes(query))
    .slice(0, 10);

  if (matches.length === 0) {
    suggestionsBox.style.display = "none";
    return;
  }

  matches.forEach((match) => {
    const suggestion = document.createElement("div");
    suggestion.textContent = `${match.name}, ${match.country}`;
    suggestion.addEventListener("click", () => {
      cityInput.value = match.name;
      suggestionsBox.innerHTML = "";
      suggestionsBox.style.display = "none";
      fetchWeather(match.name);
    });
    suggestionsBox.appendChild(suggestion);
  });

  suggestionsBox.style.display = "block";
});

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    fetchWeather(city);
  } else {
    alert("Please enter a city name.");
  }
});
