import json
import random

# Simulate new sensor data
new_data = {
    "temperature": round(random.uniform(20, 30), 2),
    "ph": round(random.uniform(6.5, 8.5), 2)
}

# Save the new data to data.json
with open("data.json", "w") as file:
    json.dump(new_data, file, indent=4)

print("Updated data.json:", new_data)
