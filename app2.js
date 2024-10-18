const apiKey = "725905bd5835f85bb7e5a1608363e619";

async function fetchWeatherForecast(city) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
  );
  const data = await response.json();
  return data;
}

async function fetchWeatherDetails(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );
    const data = await response.json();
    return data;
  } catch (error) {}
}

function renderWeatherForecastData(data, city) {
  const cityNameElement = document.getElementById("city-name");
  const forecastBody = document.getElementById("forecast-body");

  const dailyTemperatures = [];
  const weatherConditions = {};
  const forecastDates = [];

  console.log(data.list);

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

  cityNameElement.textContent = city;

  renderBarChart(dailyTemperatures, data.list);
  renderDoughnutChart(weatherConditions);
  renderLineChart(dailyTemperatures, data.list);
}

async function init(city) {
  const weatherData = await fetchWeatherForecast(city);
  renderWeatherForecastData(weatherData, city);
}

window.onload = () => {
  const searchForm = document.querySelector("#searchform");

  const handleSearch = (e) => {
    e.preventDefault();
    const cityQuery = document.querySelector("#cityinput").value;

    window.localStorage.setItem("city", cityQuery);
    window.location.reload();
  };
  searchForm.addEventListener("submit", handleSearch);

  const city = window.localStorage.getItem("city") || "Islamabad";
  init(city);

  // bot part

  const form = document.querySelector(".typing-form");

  const chatlist = document.querySelector(".chat-list");

  const API_KEY = "AIzaSyAVTbR2vLjjLVfcBTzMBGQYetARKcCT8Fc";
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

  const generateAPIResponse = async (text) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text }],
            },
          ],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);
      const apiResponse = data?.candidates[0].content.parts[0].text.replace(
        /\*\*(.*?)\*\*/g,
        "$1"
      );
      return apiResponse;
    } catch (error) {
      console.log(error);
      alert("Something went wrong!");
    }
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const question = document.querySelector(".typing-input");

    const questionWrapper = document.createElement("div");

    const questionElem = document.createElement("p");
    questionWrapper.classList.add("question");
    questionElem.textContent = question.value || "";
    questionWrapper.appendChild(questionElem);

    chatlist.appendChild(questionWrapper);

    if (question.value?.includes("weather")) {
      const city = localStorage.getItem("city") || "Islamabad";
      const data = await fetchWeatherDetails(city);

      const weatherElm = document.createElement("div");
      weatherElm.classList.add("weather");

      weatherElm.innerHTML = `
        <img width='90' src='https://openweathermap.org/img/wn/${
          data?.weather[0]?.icon
        }@2x.png'/>
        <br/>

        <p>${data?.weather[0]?.main}</p>
        <p>City: ${data?.name}</p>
        <p>Temperature: ${data?.main?.temp + "°C"}</p>
        <p>Wind: ${data?.wind?.speed}</p>
        <p>Humidity: ${data?.main?.humidity}</p>
      `;

      chatlist.appendChild(weatherElm); 
      question.value = ""; 
      return; 
    }

    const geminiResponse = await generateAPIResponse(question.value || "");

    const answerWrapper = document.createElement("div");
    const answerElem = document.createElement("p");
    answerWrapper.classList.add("answer");
    answerElem.textContent = geminiResponse || "";
    answerWrapper.appendChild(answerElem);

    chatlist.appendChild(answerWrapper);

    question.value = "";
  });
};
