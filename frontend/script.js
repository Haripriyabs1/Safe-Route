document.getElementById("safetyForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const crime_rate = document.getElementById("crime_rate").value;
    const population_density = document.getElementById("population_density").value;
    const street_light = document.getElementById("street_light").value;

    const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            crime_rate: crime_rate,
            population_density: population_density,
            street_light: street_light
        })
    });

    const data = await response.json();
    document.getElementById("result").innerText = "Result: " + data.safety_label;
});