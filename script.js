document.addEventListener('DOMContentLoaded', () => {
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

  const weatherCards = document.querySelector('.weather-cards');
  const placeholder = document.getElementById("placeholder-message");

  let cityList = [];

  // Reload page on logo click
  document.getElementById('logo').addEventListener('click', () => window.location.reload());

  // Load city list
  fetch("./city.list.json")
    .then(res => res.json())
    .then(data => cityList = data)
    .catch(err => console.error("Error loading city list:", err));

  function fetchWeather(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`)
      .then(res => {
        if (!res.ok) throw new Error("City not found");
        return res.json();
      })
      .then(data => {
        fetchAqi(data.coord.lat, data.coord.lon);
        updateWeatherUI(data);
      })
      .catch(err => alert(err.message));
  }

  function fetchWeatherByLocation(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
      .then(res => {
        if (!res.ok) throw new Error("Unable to fetch location-based weather");
        return res.json();
      })
      .then(data => {
        fetchAqi(lat, lon);
        updateWeatherUI(data);
      })
      .catch(err => alert(err.message));
  }

  function fetchAqi(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`)
      .then(res => res.json())
      .then(data => updateAqiUI(data.list[0].main.aqi))
      .catch(err => console.error("Error fetching AQI:", err));
  }

  function updateWeatherUI(data) {
    if (placeholder) placeholder.style.display = "none";
    if (weatherCards) weatherCards.classList.add('visible');

    cityName.textContent = `City: ${data.name}, ${data.sys.country}`;
    temperature.textContent = `Temperature: ${data.main.temp}°C`;
    conditions.textContent = `Conditions: ${data.weather[0].description}`;
    humidity.textContent = `Humidity: ${data.main.humidity}%`;
    windSpeed.textContent = `Wind Speed: ${data.wind.speed} m/s`;
    if (weatherIcon) weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  }

  function updateAqiUI(aqi) {
    let text = "";
    switch (aqi) {
      case 1: text = "Good"; break;
      case 2: text = "Fair"; break;
      case 3: text = "Moderate"; break;
      case 4: text = "Poor"; break;
      case 5: text = "Very Poor"; break;
      default: text = "Unknown"; break;
    }
    if (aqiValue) aqiValue.textContent = `Air Quality Index: ${text}`;
  }

  // Detect user location
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      pos => fetchWeatherByLocation(pos.coords.latitude, pos.coords.longitude),
      err => console.warn("Geolocation denied or unavailable")
    );
  }

  // City search input
  cityInput.addEventListener("input", () => {
    const query = cityInput.value.toLowerCase().trim();
    suggestionsBox.innerHTML = "";

    if (!query || query.length < 2) {
      suggestionsBox.style.display = "none";
      return;
    }

    const matches = cityList.filter(city => city.name.toLowerCase().includes(query)).slice(0, 10);
    if (matches.length === 0) {
      suggestionsBox.style.display = "none";
      return;
    }

    matches.forEach(match => {
      const div = document.createElement("div");
      div.textContent = `${match.name}, ${match.country}`;
      div.classList.add("list-group-item", "list-group-item-action");
      div.addEventListener("click", () => {
        cityInput.value = match.name;
        suggestionsBox.innerHTML = "";
        suggestionsBox.style.display = "none";
        fetchWeather(match.name);
      });
      suggestionsBox.appendChild(div);
    });

    suggestionsBox.style.display = "block";
  });

  searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
    else alert("Please enter a city name.");
  });
});
