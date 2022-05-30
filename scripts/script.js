const api = {
    key: "AiuZt-BrH6d0oKKmJmNmJwMc1O1hzVWQ1rxKsPlHWHLfCGaCVdLeWLIvcVORnOBK",
    base: "http://dev.virtualearth.net/REST/V1/Routes/Driving?o=json",
  };
const distanceField = document.getElementById("distanceField");
const startField = document.getElementById("startField");
const endField = document.getElementById("endField");
const efficiencyField = document.getElementById("efficiencyField");
const fuelpriceField = document.getElementById("fuelpriceField");
const submitButton = document.getElementById("submitButton");
const radiomanual = document.getElementById("radiomanual");
const radiocity = document.getElementById("radiocity");
const distanceUnit = document.getElementById("distanceUnit");
const consumptionUnit = document.getElementById("consumptionUnit");
const fuelUnit = document.getElementById("fuelUnit");
const sf1 = document.getElementById("sf1");
const sf2 = document.getElementById("sf2");
const df = document.getElementById("df");


let checkedRadio = "manual";
let distance;
let efficiency;
let fuelPrice;
let fuelcost;

function validateFields(){
    if((checkedRadio == "manual" && (distanceField.value <= 0 || efficiencyField.value <= 0 || fuelpriceField.value <= 0)) || (checkedRadio == "city" && (efficiencyField.value <= 0 || fuelpriceField.value <= 0)))
    {
        addMessage("Values must be higher than 0.", true);
        return false;
    }
    if(isNaN(distanceField.value) || isNaN(efficiencyField.value) || isNaN(fuelpriceField.value))
    {
        addMessage("Invalid text placed into number only field(s)", true);
        return false;
    }
    if(checkedRadio == "city" && (!isNaN(startField.value) || !isNaN(endField.value)))
    {
        addMessage("Cities cannot be a number.", true);
        return false;
    }
    else return true;
}

function normalizeUnits(){
    if(checkedRadio == "manual" && distanceUnit.value == 'miles') distance = distance * 1.60934;
    switch(consumptionUnit.value) {
        case 'l-100km':
            efficiency = 100/efficiencyField.value;
            break;
        case 'km-l':
            efficiency = efficiencyField.value;
            break;
        case 'ukmpg':
            efficiency = efficiencyField.value*0.354006;
            break;
        case 'usampg':
            efficiency = efficiencyField.value*0.425144;
            break;
    }
    switch(fuelUnit.value) {
        case 'litres':
            fuelPrice = fuelpriceField.value;
            break;
        case 'ukgallons':
            fuelPrice = fuelpriceField.value/4.54609;
            break;
        case 'usagallons':
            fuelPrice = fuelpriceField.value/3.78541;
            break;
    }
    calculateFuelCost();
}

function calculateFuelCost(){
    //distance in kilomteres, efficieny in km/l
    fuelcost = (distance/efficiency)*fuelPrice;
    const text = `This trip will cost ${round(fuelcost)} units of currency. The fuel spent will be ${round(distance/efficiency)} litres (${round((distance/efficiency)/4.54609)} UK gallons) over a distance of ${round(distance)} km (${round(distance/1.60934)} miles)`;
    addMessage(text, false);
}

//Calling main functions
function resultBuilder()
{   
    if(validateFields())
    {
        if(checkedRadio == "manual")
        {
            distance = distanceField.value;
            normalizeUnits();
        }
        if(checkedRadio == "city")
        {
            getCityDistance();
        }
    }
}

//Get distance between cities from the API
function getCityDistance()
{
    fetch(`${api.base}&wp.0=${startField.value}&wp.1=${endField.value}&key=${api.key}`)
    .then(function(response) {
        if (!response.ok) {
            throw Error("Error fetching API. One or both of the cities do not exist, or no route could be found between them.");
        }
        return response.json();
    })
    .then(function(response) {
            distance = response.resourceSets[0].resources[0].travelDistance;
            normalizeUnits();
    }).catch(function(error) {
        addMessage(error, true);
    });
}

//Build element for error/info message
function addMessage(text, isError){
    const messageDiv = document.createElement("div");
    const messageField = document.createElement("p");
    messageDiv.appendChild(messageField);
    messageDiv.id = "errorDiv";
    messageField.id = "errorField";
    messageField.innerHTML = text;
    messageDiv.style.padding = "10px";
    document.getElementsByClassName("background")[0].appendChild(messageDiv);
    if (isError) messageDiv.style.backgroundColor = "#7A0A0A";
    else messageDiv.style.backgroundColor = "#0A7A0A";
 }

 //round numbers to one decimal point
function round(value){
    return Math.round(value * 10) / 10;
}

//onclick listener for submit button
submitButton.addEventListener("click", function (event) {
    event.preventDefault();
    //delete previous error/info messages
    if(document.getElementById("errorDiv")) document.getElementById("errorDiv").remove();
    resultBuilder();
});

//disable fields depending on distance selection - manual or city to city
function distanceSelector(value){
    if(value == "manual")
    {
        distanceField.disabled = false;
        startField.disabled = true;
        endField.disabled = true;
        startField.value = null;
        endField.value = null;
        sf1.style.color = "#BCBCBC";
        sf2.style.color = "#BCBCBC";
        df.style.color = "#ffffff";
    }
    if(value == "city")
    {
        distanceField.disabled = true;
        distanceField.value=null;
        startField.disabled = false;
        endField.disabled = false;
        sf1.style.color = "#ffffff";
        sf2.style.color = "#ffffff";
        df.style.color = "#bcbcbc";
    }
}

//event listeners for radio buttons
radiomanual.addEventListener("click", function (event) {
    distanceSelector(radiomanual.value)
    checkedRadio = "manual";
});

radiocity.addEventListener("click", function (event) {
    distanceSelector(radiocity.value)
    checkedRadio = "city";
});