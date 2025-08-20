let appFrame = document.getElementById("weather-wrap");
let pageBody = document.getElementById("allOfIt");
let mainBody = document.getElementById("outer-weather-wrap");
let searchbar = document.getElementById("search");


searchbar.addEventListener ("focus", (event) => {
    appFrame.style.transition = "all 1s";
    appFrame.style.backdropFilter = "blur(10px)";
}, true)

searchbar.addEventListener("blur", () => {
    appFrame.style.backdropFilter = "blur(0px)";
})

// removing content on purpose when window size < 1200
addEventListener("resize", (event) => {
    if (pageBody.scrollWidth < 1200) {
        appFrame.style.display = "none";
    }
    else if (pageBody.scrollWidth > 1200 && appFrame.style.display === "none") {
        appFrame.style.display = "flex";
    }
})

searchbar.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        fetchWeather();
        console.log(e.key);
    }
})

// using openWeather API for weather information
async function fetchWeather() {
    let searchInput = document.getElementById("search").value;
    const extendedInfo = document.getElementById("extended-info")
    const ctaWrapper = document.getElementById("cta-wrapper");
    const weatherDataSection = document.getElementById("weather-data");
    weatherDataSection.style.display = "block";
    const apiKey = "4a74138e035c258b837967a82be5b8cf";

    async function getLonAndLat() {
        const countryCode = 49;
        const geocodeURL = `https://api.openweathermap.org/geo/1.0/direct?q=${searchInput.replace(" ", "%20")},${countryCode}&limit=1&appid=${apiKey}`;
        const response = await fetch(geocodeURL);
        if (!response.ok) {
            console.log("Bad response! ", response.status);
            return;
        }


    const data = await response.json();
    if (data.length == 0) {
        console.log("Something went wrong here.");
        weatherDataSection.innerHTML = `
            <div>
                <h2>Invalid Input: "${searchInput}"</h2>
                <p>Please try again with a valid <u>city name</u>.</p>
            </div>
            `;
    } else {
        return data[0];
    }

    }

    async function getWeatherData(lon, lat) {
        const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        const response = await fetch(weatherURL);
        const descriptionArray = [
            "clear sky",
            "scattered clouds",
            "overcast clouds", 
        ];


        const data = await response.json();
        const humidity = data.main.humidity;

        function toCelcius(input) {
            return Math.round(input - 273.15);
        }

        function toFahrenheit(input) {
            return Math.round((input - 273.15) * 9/5 + 32);
        }

        
        weatherDataSection.style.display = "flex";
        weatherDataSection.style.cssText = "width: 100%; height: 100%;";
        weatherDataSection.innerHTML = `
        <h2>${data.name}</h2>
        <div id="result-wrapper">
            <div id="temperature-wrapper">
                <img src="temperature.png" id="temperature-icon"; />
                <p>${toCelcius(data.main.temp)}°C, ${toFahrenheit(data.main.temp)}°F</p>
            </div>
            <div id="description-wrapper">
                <img src="../weatherApp/icons/clearsky.png" id="description-icon" />
                <p>${data.weather[0].description}</p>
            </div>
            <div id="humidity-wrapper">
                <div id="outer-circle">
                    <p id="humidity-levels"><strong>${humidity}</strong></p>
                </div> 
                    <p>Humidity</p>
            </div>  
        `;


        let onpageHumidity = document.getElementById("humidity-levels");
        const originalHumidity = onpageHumidity.textContent;
        let counterUp = 0;

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        
        let imageSource = document.getElementById("description-icon");
        let dataString = data.weather[0].description;
        let dataTrimmed = dataString.replace(/\s+/g, '').toLowerCase();
        console.log(dataTrimmed);
        if (descriptionArray.includes(data.weather[0].description)) {
            mainBody.style.backgroundImage = "url(../weatherApp/" + dataTrimmed + ".jpg)";
        } else if (!descriptionArray.includes(data.weather[0].description)) {
            mainBody.style.backgroundImage = "url(/bg2.jpg)";
        }

        if (dataTrimmed == "brokenclouds" || dataTrimmed == "fewclouds" || dataTrimmed == "overcastclouds") {
                imageSource.src = `../icons/cloud.png`;
            } else {
                imageSource.src = `../icons/${dataTrimmed}.png`
            }

        extendedInfo.style.display = "flex";
        ctaWrapper.style.display = "flex";
        ctaWrapper.style.opacity = "1";
        let windInfo = document.getElementById("wind-info");
        const mphFactor =  2.2369362920544;

        let temperatureInfo = document.getElementById("temperature-info");
        let max_temp = data.main.temp_max;
        let min_temp = data.main.temp_min;

        let pressureInfo = document.getElementById("pressure-info");
        let timezoneInfo = document.getElementById("timezone-info");

        temperatureInfo.innerHTML = `Lowest temperature in the area:<br> <strong>${toCelcius(min_temp)}°C/${toFahrenheit(min_temp)}°F</strong><br>Highest temperature in the area: <strong>${toCelcius(max_temp)}°C/${toFahrenheit(max_temp)}°F</strong>`;

        windInfo.innerHTML = `The wind speed for today sits at roughly <strong>${data.wind.speed}m/s.</strong><br>That is equal to <strong>${Math.round(data.wind.speed * mphFactor)}mph</strong>, or <strong>${Math.round(data.wind.speed * 3.6)}km/h.</strong>`;

        pressureInfo.innerHTML = `The atmospheric pressure for <strong>${data.name}</strong> sits at <strong>${data.main.pressure / 100} Pascal</strong>.`;
        timezoneInfo.innerHTML = `The timezone in <strong>${data.name}</strong> shifts by <strong>${data.timezone}</strong> seconds, <strong>${data.timezone / 60} minutes, or ${(data.timezone / 60) / 60} hours.<br>`;
        
        
        
        while (counterUp <= originalHumidity) {
            onpageHumidity.innerHTML = `${counterUp}`;
            for (let i = 0; i < originalHumidity; i++) {
                document.documentElement.style.setProperty('--humidityStart', `${counterUp}%`);
            }
            await sleep(18);
            counterUp++;
        }

        if (!response.ok) {
            console.log("Bad response! ", response.status);
            return;
        }
    }

    if (searchInput == "") {
        weatherDataSection.innerHTML = `
        <div>
            <h2>Empty Input!</h2>
            <p>Please try again with a valid <u>city name</u></p>
        </div>
        `;
        return;
    }

    document.getElementById("search").value = "";
    const geocodeData = await getLonAndLat();
    getWeatherData(geocodeData.lon, geocodeData.lat);

}