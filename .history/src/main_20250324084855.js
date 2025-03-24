import './style.css'

const state = {
  currentLocation: 'Stockholm', // Default location
  currentUnit: 'metric',       // Celsius by default ('us' for Fahrenheit)
  isLoading: false,
  weatherData: null,
  errorMessage: ''
};

const locationForm = document.getElementById('location-form');
const locationInput = document.getElementById('location-input');
const errorMessageEl = document.getElementById('error-message');
const loadingEl = document.getElementById('loading');
const currentTempEl = document.getElementById('current-temp');
const currentConditionsEl = document.getElementById('current-conditions');
const forecastListEl = document.getElementById('forecast-list');
const unitToggleBtn = document.getElementById('unit-toggle');

async function fetchWeather(location, unit) {
  const API_KEY = 'ELPP4YC3AJ7F4NE3SJF5MXJTA';
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=${unit}&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Location not found or API error');
    }
    const data = await response.json();
    return processWeatherData(data);
  } catch (error) {
    throw error;
  }
}

function processWeatherData(data) {
  const current = {
    temp: data.currentConditions.temp,
    conditions: data.currentConditions.conditions
  };
  const forecast = data.days.slice(0, 5).map(day => ({
    date: day.datetime,
    high: day.tempmax,
    low: day.tempmin,
    conditions: day.conditions
  }));
  return { current, forecast };
}

function updateUI() {
  if (state.weatherData) {
    const { current, forecast } = state.weatherData;
    const unitSymbol = state.currentUnit === 'metric' ? '°C' : '°F';
    currentTempEl.textContent = `Temperature: ${current.temp}${unitSymbol}`;
    currentConditionsEl.textContent = `Conditions: ${current.conditions}`;

    forecastListEl.innerHTML = ''; // Clear previous forecast
    forecast.forEach(day => {
      const dayEl = document.createElement('div');
      dayEl.classList.add('forecast-day');
      dayEl.innerHTML = `
        <h3>${day.date}</h3>
        <p>High: ${day.high}${unitSymbol}</p>
        <p>Low: ${day.low}${unitSymbol}</p>
        <p>${day.conditions}</p>
      `;
      forecastListEl.appendChild(dayEl);
    });
  }
}


function showLoading() {
  state.isLoading = true;
  loadingEl.style.display = 'block';
}

function hideLoading() {
  state.isLoading = false;
  loadingEl.style.display = 'none';
}

function displayError(message) {
  state.errorMessage = message;
  errorMessageEl.textContent = message;
}

function clearError() {
  state.errorMessage = '';
  errorMessageEl.textContent = '';
}

async function fetchAndUpdate() {
  showLoading();
  clearError();
  try {
    const data = await fetchWeather(state.currentLocation, state.currentUnit);
    state.weatherData = data;
    updateUI();
  } catch (error) {
    displayError(error.message);
    state.weatherData = null;
  } finally {
    hideLoading();
  }
}

locationForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const newLocation = locationInput.value.trim();
  if (newLocation) {
    state.currentLocation = newLocation;
    fetchAndUpdate();
  }
});

unitToggleBtn.addEventListener('click', () => {
  state.currentUnit = state.currentUnit === 'metric' ? 'us' : 'metric';
  unitToggleBtn.textContent = state.currentUnit === 'metric' ? 'Switch to Fahrenheit' : 'Switch to Celsius';
  fetchAndUpdate();
});

fetchAndUpdate();