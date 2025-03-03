// Replace with your Google Sheets CSV URL
const SHEET_URL = "https://mqtt-excel-storage.s3.us-east-2.amazonaws.com/mqtt_data.csv";

let timestamps = [];
let tempCData = [];
let tempFData = [];
let humidityData = [];

async function fetchData() {
    try {
        const response = await fetch(SHEET_URL);
        const csvText = await response.text();
        const rows = csvText.trim().split("\n").slice(1); // Remove header row

        // Clear arrays before updating
        timestamps = [];
        tempCData = [];
        tempFData = [];
        humidityData = [];

        rows.forEach(row => {
            // Split the CSV line properly while preserving data integrity
            let columns = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g); 
            
            if (columns && columns.length >= 5) { // Ensure all 5 values are present
                const timestamp = columns[0].trim();  // Column A: Timestamp
                const sensor = columns[1].trim();     // Column B: Sensor Name
                const tempC = parseFloat(columns[2].trim()); // Column C: TempC
                const tempF = parseFloat(columns[3].trim()); // Column D: TempF
                const humidity = parseFloat(columns[4].trim()); // Column E: Humidity%

                // Check if parsed values are valid numbers
                if (!isNaN(tempC) && !isNaN(tempF) && !isNaN(humidity)) {
                    timestamps.push(timestamp);
                    tempCData.push(tempC);
                    tempFData.push(tempF);
                    humidityData.push(humidity);
                } else {
                    console.warn("Skipping row due to invalid number:", columns);
                }
            } else {
                console.warn("Skipping row due to missing columns:", columns);
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
    maintainAspectRatio: true, // Keep the chart's fixed aspect ratio
    scales: {
        x: { 
            title: { display: true, text: "Time" } 
        },
        y: { 
            title: { display: true, text: "Value" },
            min: 5,  // Completely locks the lower bound of Y-axis
            max: 100,  // Completely locks the upper bound of Y-axis
            ticks: { stepSize: 5 }, // Keeps labels evenly spaced
            beginAtZero: false  // Ensures values don't start from zero if unnecessary
            }
        },
    animation: false // Prevents animations from shifting the chart
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
setInterval(fetchData, 10000);
fetchData();
