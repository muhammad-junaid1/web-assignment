const apiKey = "725905bd5835f85bb7e5a1608363e619";

async function fetchWeatherForecast(city) {
    try {
        
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
  );
  const data = await response.json();
  if(response.status !== 404) {
  return data;
  } else {
    alert("City not found!");
  }
    } catch (error) {
    }
}

async function fetchWeatherDetails(city) {
    try {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
  );
  const data = await response.json();
  return data;
        
    } catch (error) {
        
    
    }
}

function renderWeatherForecastData(data, city) {
  const forecastBody = document.getElementById("forecast-body");

  const dailyTemperatures = [];
  const weatherConditions = {};
  const forecastDates = [];


  data.list.forEach((entry) => {
    const date = entry.dt_txt;
    const temp = entry.main.temp;
    const condition = entry.weather[0].main;

    if (!dailyTemperatures.includes(date)) {
      dailyTemperatures.push(date);
    }

    if (!weatherConditions[condition]) {
      weatherConditions[condition] = 1;
    } else {
      weatherConditions[condition]++;
    }

    const row = document.createElement("tr");
    row.innerHTML = `<td>${date}</td><td>${temp.toFixed(
      1
    )}</td><td class='temp-cond-table'><img src='https://openweathermap.org/img/wn/${
      entry.weather[0]?.icon
    }@2x.png'/>${condition}</td>`;
    forecastBody.appendChild(row);
  });


  renderBarChart(dailyTemperatures, data.list);
  renderDoughnutChart(weatherConditions);
  renderLineChart(dailyTemperatures, data.list);
}

function renderWeatherDetails(data, city) {
      const cityNameElement = document.getElementById("city-name");

  const weatherConditionElement = document.getElementById("weather-condition");
  const weatherConditionImg = document.getElementById("weather-condition-img");
  const temperature = document.getElementById("temperature");
  const wind = document.getElementById("wind");
  const humidity = document.getElementById("humidity");

console.log(data)
  weatherConditionImg.src = `https://openweathermap.org/img/wn/${data?.weather[0]?.icon}@2x.png`;
  weatherConditionElement.textContent = data?.weather[0]?.main;
  cityNameElement.textContent = data?.name;
  temperature.textContent = data?.main?.temp + "°C";
  wind.textContent = data?.wind?.speed;
  humidity.textContent = data?.main?.humidity;
}

function renderBarChart(dates, data) {
  const ctx = document.getElementById("barChart").getContext("2d");
  const temperatures = data.map((entry) => entry.main.temp);
  const tempData = temperatures.slice(0, 5);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: dates.slice(0, 5),
      datasets: [
        {
          label: "Temperature (°C)",
          data: tempData,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
        },
      ],
    },
    options: {
      animation: {
        onComplete: function () {
          this.showTooltip(this.getDatasetMeta(0).data, true);
        },
        delay: (context) => {
          let delay = 0;
          if (
            context.type === "data" &&
            context.mode === "default" &&
            !context.chart.getDatasetMeta(0).hidden
          ) {
            delay = context.dataIndex * 100;
          }
          return delay;
        },
      },
    },
  });
}

function renderDoughnutChart(weatherConditions) {
  const ctx = document.getElementById("doughnutChart").getContext("2d");
  const labels = Object.keys(weatherConditions);
  const data = Object.values(weatherConditions);

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Weather Conditions",
          data: data,
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
          ],
        },
      ],
    },
    options: {
      animation: {
        animateRotate: true,
        onComplete: function () {
          this.showTooltip(this.getDatasetMeta(0).data, true);
        },
        delay: (context) => {
          let delay = 0;
          if (
            context.type === "data" &&
            context.mode === "default" &&
            !context.chart.getDatasetMeta(0).hidden
          ) {
            delay = context.dataIndex * 100;
          }
          return delay;
        },
      },
    },
  });
}

function renderLineChart(dates, data) {
  const ctx = document.getElementById("lineChart").getContext("2d");
  const temperatures = data.map((entry) => entry.main.temp);
  const tempData = temperatures.slice(0, 5);

  new Chart(ctx, {
    type: "line",
    data: {
      labels: dates.slice(0, 5),
      datasets: [
        {
          label: "Temperature (°C)",
          data: tempData,
          borderColor: "rgba(75, 192, 192, 1)",
          fill: false,
          tension: 0.1,
        },
      ],
    },
    options: {
      animation: {
        onComplete: function () {
          this.showTooltip(this.getDatasetMeta(0).data, true);
        },
        duration: 1000,
      },
    },
  });
}

async function init(city) {
  const weatherData = await fetchWeatherForecast(city);
  renderWeatherForecastData(weatherData, city);

  const weatherDetails = await fetchWeatherDetails(city);
  renderWeatherDetails(weatherDetails, city);
}

window.onload = () => {
  const searchForm = document.querySelector("#searchform");

  const handleSearch = (e) => {
    e.preventDefault();
    const cityQuery = document.querySelector("#cityinput").value;

    if(cityQuery?.trim()) {
        window.localStorage.setItem("city", cityQuery);
        window.location.reload();
    }

  };

  searchForm.addEventListener("submit", handleSearch);

  const city = window.localStorage.getItem("city") || "Islamabad";
  init(city);
};
