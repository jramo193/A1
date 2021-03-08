var map;

function initMap(x, y) {
    map = new google.maps.Map(document.querySelector("#map"), {
        center: {lat: x, lng: y},
        mapTypeId: 'satellite',
        zoom: 18
    });
}

function createMarker(map, latitude, longitude, city) {
    let imageLatLong = { lat: latitude, lng: longitude };
    let marker = new google.maps.Marker({
        position: imageLatLong,
        title: city,
        map: map
    });
}

//currency formatter
const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
})

//big number formatter
const bigNumber = new Intl.NumberFormat();

//displays credits
function displayCredits() {
    const creds = document.querySelector("#credits");
    creds.addEventListener('mouseenter', e => {
        alert("Name: Jerik Ramos\nCourse: COMP 3512\n\nResources used:\n- Randy's APIs\n- Google Maps API\n- Chart.js\n- GitHub\n- https://www.wallpapertip.com/wmimgs/42-423017_money-background-fill-dollar-sign-black-background-gold.jpg\n- https://loading.io/css\n- https://www.youtube.com/watch?v=Q_TplfrQlE0&ab_channel=doctorcode\n- https://codepen.io/andrese52/pen/ZJENqp\n\nPress ESC to close.");
    });
}

//sort function helper
function compare(a, b) { 
    return a - b 
}

//clears the filter field
function clearFilter() {
    let input = document.querySelector("#filterCompany");
    input.value = "";
    textFilter();
}

//Extracted then modified from https://www.youtube.com/watch?v=Q_TplfrQlE0&ab_channel=doctorcode
function textFilter() {
    var filterValue, input, ul, li, i;
    input = document.querySelector("#filterCompany");
    filterValue = input.value.toUpperCase();
    ul = document.querySelector("#listOfCompanies")
    li = document.querySelectorAll("#listOfCompanies li");

    for(i=0; i < li.length; i++) {
        var a = li[i];
        if(a.innerHTML.toUpperCase().indexOf(filterValue) > -1) {
            li[i].style.display = "";
        }
        else {
            li[i].style.display = "none";
        }
    }
}

//Extracted then modified from https://codepen.io/andrese52/pen/ZJENqp
function sortTable(n) {
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById("stockDataTable");
  switching = true;
  dir = "asc";

  while (switching) {
    switching = false;
    rows = table.getElementsByTagName("TR");

    for (i = 0; i < rows.length - 1; i++) { 
      shouldSwitch = false;
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
        if (dir == "asc") {
            if (x.innerHTML > y.innerHTML) {
                shouldSwitch = true;
                break;
            }
        } 
        else if (dir == "desc") {
            if (x.innerHTML < y.innerHTML) {
            shouldSwitch = true;
            break;
            }
        }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      switchcount++;
    } else {
        if (switchcount == 0 && dir == "asc") {
            dir = "desc";
            switching = true;
        }
    }
  }
}

document.addEventListener("DOMContentLoaded", function() {   
    //hides the default view and dsiaplys the chart view
    document.querySelector("#viewCharts").addEventListener("click", function() {
        document.querySelector("div.b").style.display = "none";
        document.querySelector("div.c").style.display = "none";
        document.querySelector("div.d").style.display = "none";
        document.querySelector("div.e").style.display = "none";
        document.querySelector("div.g").style.display = "block";
        document.querySelector("div.h").style.display = "block";
        document.querySelector("div.i").style.display = "block";
    });
    
    //hides the chart view and displays the default view
    document.querySelector("#backToMain").addEventListener("click", function() {
        document.querySelector("div.g").style.display = "none";
        document.querySelector("div.h").style.display = "none";
        document.querySelector("div.i").style.display = "none";
        document.querySelector("div.b").style.display = "block";
        document.querySelector("div.c").style.display = "block";
        document.querySelector("div.d").style.display = "block";
        document.querySelector("div.e").style.display = "block";
    });
    
    //speech synthesizer for the description
    document.querySelector("#speak").addEventListener("click", function() {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(document.querySelector("#companyDescription2").textContent);
        speechSynthesis.speak(utterance);
    });
     
    const data1 = 'https://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php';
    const data2 = 'https://www.randyconnolly.com/funwebdev/3rd/api/stocks/history.php';
    let storedCompanies = retrieveStorageCompanies();
    let storedHistory = retrieveStorageHistory();
    
    //if content is not found in local storage, make a copy
    if(storedCompanies.length == 0) {
        fetch(data1)
        .then( response => response.json() )
        .then( data => {
            document.querySelector("#loader1").style.display = "block";
            localStorage.setItem('companies',JSON.stringify(data));
            storedCompanies = JSON.parse(localStorage.getItem('companies'));  
        })
        .then( () => {
                document.querySelector("#loader1").style.display = "none";
            })
        .then( data => populateListOfCompanies(storedCompanies) )
        .then( data => textFilter() )
        .then( data => setEventHandlers(storedCompanies) ) 
        .catch( error => console.error(error) );
    }
    
    if(storedHistory.length == 0) {
        fetch(data2)
        .then( response => response.json() )
        .then( data => {
            document.querySelector("#loader2").style.display = "block";
            localStorage.setItem('history',JSON.stringify(data));
            storedHistory = JSON.parse(localStorage.getItem('history'));  
            
        })
        .then( () => {
                document.querySelector("#loader2").style.display = "none";
            })
    }

    //if content is found in local storage, then use local copy
    else {
        document.querySelector("#loader1").style.display = "none";
        document.querySelector("#loader2").style.display = "none";
        populateListOfCompanies(storedCompanies);
        textFilter();
        setEventHandlers(storedCompanies); 
    }  
    
    function retrieveStorageCompanies() {
        return JSON.parse(localStorage.getItem('companies')) || [];
    }
    
    function retrieveStorageHistory() {
        return JSON.parse(localStorage.getItem('history')) || [];
    }
    
    function removeStorageCompanies() {
        localStorage.removeItem('companies');
    }
    
    function removeStorageHistory() {
        localStorage.removeItem('history');
    }
    
    function populateListOfCompanies(companies) {
        const companyList = document.querySelector("#listOfCompanies")
        for(let c of companies) {
            const list = document.createElement("li");
            list.textContent = c.name;
            list.setAttribute("id", c.symbol)
            companyList.appendChild(list);
        }
    }
    
    //event handling for the company list items when clicked
    function setEventHandlers(companies) {
        const companyListItems = document.querySelectorAll("#listOfCompanies > li")
        for(let c of companyListItems) {
            
            //event listener to populate additional company info
            c.addEventListener("click", function(e) {
                try {
                    for(let x of storedCompanies) {
                        if(e.target.innerHTML == x.name) {
                            myData = x;
                        }
                    }
                    
                    //populate the additional company info
                    const img = document.createElement("img");
                    img.setAttribute("src", "/A1/images/logos/"+myData.symbol+".svg");
                    img.setAttribute("id", "logo");
                    document.querySelector("#companyLogo").innerHTML = "";
                    document.querySelector("#companyLogo").appendChild(img);
                    document.querySelector("#companySymbol").textContent = myData.symbol;
                    document.querySelector("#companyName").textContent = myData.name;
                    document.querySelector("#companySector").textContent = myData.sector;
                    document.querySelector("#companySubindustry").textContent = myData.subindustry;
                    document.querySelector("#companyAddress").textContent = myData.address;
                    document.querySelector("#companyWebsite").textContent = myData.website;
                    document.querySelector("#companyWebsite").href = myData.website;
                    document.querySelector("#companyExchange").textContent = myData.exchange;
                    document.querySelector("#companyDescription").textContent = myData.description;
                    document.querySelector("#companyDescription2").textContent = myData.description;
                    document.querySelector("#companyNameSymbol").textContent = myData.name+" ("+myData.symbol+")";
                    
                }
                catch (err) {
                    console.error(err);
                }   
            });
            
            //event listener to display map
            c.addEventListener("click", function(e) {
                try {
                    for(let x of storedCompanies) {
                        if(e.target.innerHTML == x.name) {
                            myData = x;
                        }
                    }
                    
                    initMap(myData.latitude, myData.longitude);
                }
                catch (err) {
                    console.error(err);
                }   
            });
            
            //event listener to populate stock data
            c.addEventListener("click", function(e) {
                try {
                    let myData;
                    
                    document.querySelector("#stockDataTable").innerHTML = "";
                    
                    for(let x of storedHistory) {
                        if(e.target.getAttribute("id") == x.symbol) {
                            myData = x;
                            
                            const trow = document.createElement("tr");
                            const tdate = document.createElement("td");
                            const topen = document.createElement("td");
                            const tclose = document.createElement("td");
                            const tlow = document.createElement("td");
                            const thigh = document.createElement("td");
                            const tvolume = document.createElement("td");
                            
                            //populate table with content
                            tdate.textContent = myData.date;
                            topen.textContent = currency.format(parseFloat(myData.open));
                            tclose.textContent = currency.format(parseFloat(myData.close));
                            tlow.textContent = currency.format(parseFloat(myData.low));
                            thigh.textContent = currency.format(parseFloat(myData.high));
                            tvolume.textContent = bigNumber.format(myData.volume);
                            
                            trow.appendChild(tdate);
                            trow.appendChild(topen);
                            trow.appendChild(tclose);
                            trow.appendChild(tlow);
                            trow.appendChild(thigh);
                            trow.appendChild(tvolume);
                            
                            document.querySelector("#stockDataTable").appendChild(trow);
                        }
                    }
                }
                catch (err) {
                    console.error(err);
                }   
            });
            
            //event listener to populate the additional calculations
            c.addEventListener("click", function(e) {
                try {
                    let myData;
                
                    const openArray = [];
                    const closeArray = [];
                    const lowArray = [];
                    const highArray = [];
                    const volumeArray = [];
                    
                    let openTotal = 0;
                    let closeTotal = 0;
                    let lowTotal = 0;
                    let highTotal = 0;
                    let volumeTotal = 0;
                    
                    let openAverage = 0;
                    let closeAverage = 0;
                    let lowAverage = 0;
                    let highAverage = 0;
                    let volumeAverage = 0;
                    
                    document.querySelector(".additionalCalcs").innerHTML = "";
                    
                    //populate arrays
                    for(let x of storedHistory) {
                        if(e.target.getAttribute("id") == x.symbol) {
                            myData = x;
                            
                            openArray.push(myData.open);
                            closeArray.push(myData.close);
                            lowArray.push(myData.low);
                            highArray.push(myData.high);
                            volumeArray.push(myData.volume);
                        }
                    }
                    
                    //calcualte averages
                    for(i = 0; i < openArray.length; i++) {
                        openTotal += parseFloat(openArray[i]);
                    }
                    openAverage = openTotal/openArray.length;
                    
                    for(i = 0; i < closeArray.length; i++) {
                        closeTotal += parseFloat(closeArray[i]);
                    }
                    closeAverage = closeTotal/closeArray.length;
                    
                    for(i = 0; i < lowArray.length; i++) {
                        lowTotal += parseFloat(lowArray[i]);
                    }
                    lowAverage = closeTotal/lowArray.length;
                    
                    for(i = 0; i < highArray.length; i++) {
                        highTotal += parseFloat(highArray[i]);
                    }
                    highAverage = highTotal/highArray.length;
                    
                    for(i = 0; i < volumeArray.length; i++) {
                        volumeTotal += parseFloat(volumeArray[i]);
                    }
                    volumeAverage = volumeTotal/volumeArray.length;
                    
                    //populate table with content
                    document.querySelector("#openAverageData").textContent = currency.format(parseFloat(openAverage));
                    document.querySelector("#closeAverageData").textContent = currency.format(parseFloat(closeAverage));
                    document.querySelector("#lowAverageData").textContent = currency.format(parseFloat(lowAverage));
                    document.querySelector("#highAverageData").textContent = currency.format(parseFloat(highAverage));
                    document.querySelector("#volumeAverageData").textContent = bigNumber.format(parseFloat(volumeAverage).toFixed(2));
                    
                    document.querySelector("#openMinData").textContent = currency.format(parseFloat(openArray.sort(compare)[0]));
                    document.querySelector("#closeMinData").textContent = currency.format(parseFloat(closeArray.sort(compare)[0]));
                    document.querySelector("#lowMinData").textContent = currency.format(parseFloat(lowArray.sort(compare)[0]));
                    document.querySelector("#highMinData").textContent = currency.format(parseFloat(highArray.sort(compare)[0]));
                    document.querySelector("#volumeMinData").textContent = bigNumber.format(parseFloat(volumeArray.sort(compare)[0]));
                    
                    document.querySelector("#openMaxData").textContent = currency.format(parseFloat(openArray.sort(compare)[openArray.length - 1]));
                    document.querySelector("#closeMaxData").textContent = currency.format(parseFloat(closeArray.sort(compare)[closeArray.length - 1]));
                    document.querySelector("#lowMaxData").textContent = currency.format(parseFloat(lowArray.sort(compare)[lowArray.length - 1]));
                    document.querySelector("#highMaxData").textContent = currency.format(parseFloat(highArray.sort(compare)[highArray.length - 1]));
                    document.querySelector("#volumeMaxData").textContent = bigNumber.format(parseFloat(volumeArray.sort(compare)[volumeArray.length - 1]));
                }                
                catch (err) {
                    console.error(err);
                }  
            });   
            
            //event listener to populate the charts
            c.addEventListener("click", function(e) {
                try {
                    let myData;
                    let myHistory;
                    const closeArray = [];
                    const volumeArray = [];
                    const dateArray = [];
                    
                    for(let x of storedCompanies) {
                        if(e.target.innerHTML == x.name) {
                            myData = x;
                        }
                    }
                    
                    if(window.barChart != null || window.lineChart != null) {
                        window.barChart.destroy();
                        window.lineChart.destroy();
                    }
                    
                    let chart1 = document.querySelector("#chart1").getContext('2d');
                    let chart2 = document.querySelector("#chart2").getContext('2d');
                    Chart.defaults.global.defaultFontColor = 'white';
                    
                    if(myData.financials) {
                        window.barChart = new Chart(chart1, {
                            type: 'bar',
                            data:{
                                labels: ["2017", "2018", "2019"],
                                datasets: [
                                    {
                                        label: "Revenue",
                                        backgroundColor: "blue",
                                        data: [myData.financials.revenue[2],myData.financials.revenue[1],myData.financials.revenue[0]]
                                    },
                                    {
                                        label: "Earnings",
                                        backgroundColor: "red",
                                        data: [myData.financials.earnings[2],myData.financials.earnings[1],myData.financials.earnings[0]]
                                    },
                                    {
                                        label: "Assets",
                                        backgroundColor: "green",
                                        data: [myData.financials.assets[2],myData.financials.assets[1],myData.financials.assets[0]]
                                    },
                                    {
                                        label: "Liabilities",
                                        backgroundColor: "yellow",
                                        data: [myData.financials.liabilities[2],myData.financials.liabilities[1],myData.financials.liabilities[0]]
                                    }

                                ]
                            },
                            options: {
                                scales: {
                                  xAxes: [{gridLines: { color: "white" }}],
                                  yAxes: [{gridLines: { color: "white" }}]
                                  },
                                responsive: true,
                                maintainAspectRatio: true
                            }
                        });
                        }
                        else {
                            console.log("No financial data found.");
                            window.barChart = new Chart(chart1, {
                            type: 'bar',
                            data:{
                                labels: ["2017", "2018", "2019"],
                                datasets: [
                                    {
                                        label: "Revenue",
                                        backgroundColor: "#00b50c",
                                        data: []
                                    },
                                    {
                                        label: "Earnings",
                                        backgroundColor: "#c9a316",
                                        data: []
                                    },
                                    {
                                        label: "Assets",
                                        backgroundColor: "blue",
                                        data: []
                                    },
                                    {
                                        label: "Liabilities",
                                        backgroundColor: "red",
                                        data: []
                                    }
                                ]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: true
                            }
                            });
                        }

                        for(let x of storedHistory) {
                            if(e.target.getAttribute("id") == x.symbol) {
                                myHistory = x;
                                closeArray.push(myHistory.close);
                                volumeArray.push(myHistory.volume);
                                dateArray.push(myHistory.date);
                            }
                        }
                        
                        window.lineChart = new Chart(chart2, {
                            type: 'line',
                            data: {
                                labels: dateArray,
                                datasets: [{
                                    fill: false,
                                    label: 'Close',
                                    yAxisID: "yaxis1",
                                    data: closeArray,                             
                                    borderColor: "#00b50c"
                                }, 
                                {
                                    fill: false,
                                    yAxisID: "yaxis2",
                                    label: 'Volume',
                                    data: volumeArray,
                                    borderColor: "#c9a316"
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: true,
                                bezierCurveTension: 0,
                                scales: {
                                    xAxes: [{
                                        display: true,
                                        ticks: {
                                            maxTicksLimit: 15,
                                            fontSize: 10,
                                            gridLines: { color: "white" }
                                        }
                                    }],
                                    yAxes: [{
                                        position: "left",
                                        "id": "yaxis2",
                                        display: true,
                                        gridLines: { color: "white" }

                                    }, 
                                    {
                                        position: "right",
                                        "id": "yaxis1",
                                        display: true,
                                        gridLines: { color: "white" }

                                    }]
                                }
                            }
                        });

                }
                catch (err) {
                    console.error(err);
                }   
            });
            
            //event listener to populate stock data
            c.addEventListener("click", function(e) {
                try {
                    let myData;
                    
                    document.querySelector("#financialsDataTable").innerHTML = "";
                    
                    for(let x of storedCompanies) {
                        if(e.target.innerHTML == x.name) {
                            myData = x;
                        }
                    }       
                    
                    //populate table with content
                    if(myData.financials) {
                        for(i=0; i < 3; i++) {
                            const trow = document.createElement("tr");
                            const tyear = document.createElement("td");
                            const trevenue = document.createElement("td");
                            const tearnings = document.createElement("td");
                            const tassets = document.createElement("td");
                            const tliabilities = document.createElement("td");

                            tyear.textContent = myData.financials.years[i];
                            trevenue.textContent = currency.format(parseFloat(myData.financials.revenue[i]));
                            tearnings.textContent = currency.format(parseFloat(myData.financials.earnings[i]));
                            tassets.textContent = currency.format(parseFloat(myData.financials.assets[i]));
                            tliabilities.textContent = currency.format(parseFloat(myData.financials.liabilities[i]));

                            trow.appendChild(tyear);
                            trow.appendChild(trevenue);
                            trow.appendChild(tearnings);
                            trow.appendChild(tassets);
                            trow.appendChild(tliabilities);

                            document.querySelector("#financialsDataTable").appendChild(trow);
                        }
                    }
                    else {
                        console.log("No financial data found.");
                    }
                }
                catch (err) {
                    console.error(err);
                }   
            });
            
        } //big for loop
        
        document.querySelector("#date").addEventListener("click", function(e) {
            sortTable(0);
        });
        
        document.querySelector("#open").addEventListener("click", function(e) {
            sortTable(1);
        });
        
        document.querySelector("#close").addEventListener("click", function(e) {
            sortTable(2);
        });
        
        document.querySelector("#low").addEventListener("click", function(e) {
            sortTable(3);
        });
        
        document.querySelector("#high").addEventListener("click", function(e) {
            sortTable(4);
        });
        
        document.querySelector("#volume").addEventListener("click", function(e) {
            sortTable(5);
        });
        
        document.querySelector("#filterCompany").addEventListener("keyup", function(e) {
            textFilter();
        });
        
        document.querySelector("#clear").addEventListener("click", function(e) {
            clearFilter();
        });
        
        document.querySelector("#credits").addEventListener("mouseover", function(e) {
            displayCredits();
        });
    } //setEventHandlers

}); //preload DOM
