// Replace with your Google Sheets CSV URL
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS_NJpt4RIFw7gf3yv5xVeaZrxm_M3Rp5c6coe1HXcFiEt4HUEPo_MFD3PRLoHn1SlAuwQ1u9jBSJWh/pub?output=csv";

let timestamps = [];
let tempCData = [];
let tempFData = [];
let humidityData = [];

async function fetchData() {
    try {
        const response = await fetch(SHEET_URL);
        const csvText = await response.text();
        const rows = csvText.trim().split("\n").slice(1); // Remove header row

        // Clear arrays
        timestamps = [];
        tempCData = [];
        tempFData = [];
        humidityData = [];

        rows.forEach(row => {
            // Properly split CSV by comma, ensuring it captures all 5 columns
            let columns = row.split(",").map(item => item.trim());

            if (columns.length >= 5) { // Ensure all 5 values are present
                const timestamp = columns[0];  // Column A: Timestamp
                const sensor = columns[1];     // Column B: Sensor Name
                const tempC = parseFloat(columns[2]); // Column C: TempC
                const tempF = parseFloat(columns[3]); // Column D: TempF
                const humidity = parseFloat(columns[4]); // Column E: Humidity%

                timestamps.push(timestamp);
                tempCData.push(tempC);
                tempFData.push(tempF);
                humidityData.push(humidity);
            } else {
                console.warn("Skipping row due to missing data:", columns);
            }
        });

        updateLatestValues();
        updateChart();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Update latest values on page
function updateLatestValues() {
    if (timestamps.length > 0) {
        document.getElementById("timestamp").innerText = timestamps[timestamps.length - 1] || "--";
        document.getElementById("sensor_name").innerText = "DHT_SS";
        document.getElementById("temp_c").innerText = tempCData[tempCData.length - 1] || "--";
        document.getElementById("temp_f").innerText = tempFData[tempFData.length - 1] || "--";
        document.getElementById("humidity").innerText = humidityData[humidityData.length - 1] || "--";
    }
}

// Initialize Chart.js
const ctx = document.getElementById("sensorChart").getContext("2d");
const sensorChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: timestamps,
        datasets: [
            {
                label: "Temperature (°C)",
                data: tempCData,
                borderColor: "#cc6b49", /* Rust Red */
                backgroundColor: "rgba(204, 107, 73, 0.2)",
                borderWidth: 2,
                fill: true
            },
            {
                label: "Temperature (°F)",
                data: tempFData,
                borderColor: "#d8a47f", /* Soft Orange */
                backgroundColor: "rgba(216, 164, 127, 0.2)",
                borderWidth: 2,
                fill: true
            },
            {
                label: "Humidity (%)",
                data: humidityData,
                borderColor: "#6d9773", /* Olive Green */
                backgroundColor: "rgba(109, 151, 115, 0.2)",
                borderWidth: 2,
                fill: true
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { title: { display: true, text: "Time" } },
            y: { 
                title: { display: true, text: "Value" },
                suggestedMin: 0, // Ensures values scale properly
                suggestedMax: 100
            }
        }
    }
});

// Update Chart with New Data
function updateChart() {
    sensorChart.data.labels = timestamps;
    sensorChart.data.datasets[0].data = tempCData;
    sensorChart.data.datasets[1].data = tempFData;
    sensorChart.data.datasets[2].data = humidityData;
    sensorChart.update();
}

// Fetch data every 30 seconds
setInterval(fetchData, 30000);
fetchData();
