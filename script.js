// ===============================
// Variabler
// ===============================

// Senast slumpade ställe
let previousVenue = null;

// Alla ställen
let venues = [];


// ===============================
// HTML-element
// ===============================

const randomButton = document.getElementById("randomButton");
randomButton.onclick = toggleSpin;
console.log("toggleSpin =", toggleSpin);

const homeButton = document.getElementById("homeButton");
const menuButton = document.getElementById("menuButton");

const settingsBackButton =
    document.getElementById("settingsBackButton");

const venueBackButton =
    document.getElementById("venueBackButton");

const sideMenu = document.getElementById("sideMenu");
const closeButton = document.getElementById("closeButton");
const overlay = document.getElementById("overlay");

const settingsButton =
    document.getElementById("settingsButton");


// Typfilter
const typePub = document.getElementById("typePub");
const typeBar = document.getElementById("typeBar");
const typeRestaurant =
    document.getElementById("typeRestaurant");

const typeCocktail =
    document.getElementById("typeCocktail");

const typeWine =
    document.getElementById("typeWine");

const typeNightclub =
    document.getElementById("typeNightclub");


// ===============================
// Event Listeners
// ===============================

settingsBackButton.addEventListener("click", showHome);
venueBackButton.addEventListener("click", showHome);


// ===============================
// Ladda venues
// ===============================

fetch("data/venues.json")
    .then(response => response.json())
    .then(venueData => {

        venues = venueData;

initSpinner();

refreshSpinner(venues);

console.log("Venue-fil inläst!");
        console.log(venues);

    });


// ===============================
// Funktioner
// ===============================

function showView(viewId) {

    const views = document.querySelectorAll(".view");

    views.forEach(view => {

        view.classList.remove("active");

    });

    document.getElementById(viewId)
        .classList.add("active");

    closeMenu();

    if (viewId === "homeView") {

        menuButton.classList.remove("hidden");

         refreshSpinner();

    } else {

        menuButton.classList.add("hidden");

    }

}


function openMenu() {

    sideMenu.classList.add("open");
    overlay.classList.add("open");
    menuButton.classList.add("hidden");

}


function closeMenu() {

    sideMenu.classList.remove("open");
    overlay.classList.remove("open");
    menuButton.classList.remove("hidden");

}


function showSettings() {

    showView("settingsView");

}


function showHome() {

    showView("homeView");
buttonMode = "spin";
randomButton.textContent = "SNURRA";
}


function capitalize(text) {

    if (!text)
        return "";

    return text
        .replaceAll("_", " ")
        .split(" ")
        .map(word =>
            word.charAt(0).toUpperCase() +
            word.slice(1)
        )
        .join(" ");

}


function showVenue() {

    if (currentVenue === null)
        return;

    document.getElementById("venueTitle").textContent =
        currentVenue.namn;

    document.getElementById("venueDescription").innerHTML = `

        <div class="infoRow">

            <strong>🍴 Kategori</strong><br>

            ${capitalize(currentVenue.kategori)}

        </div>

        <div class="infoRow">

            <strong>🏷️ Taggar</strong><br>

            <div class="tagContainer">

                ${currentVenue.tags.map(tag =>
                    `<span class="tag">${capitalize(tag)}</span>`
                ).join("")}

            </div>

        </div>

        <div class="infoRow">

            <strong>💰 Pris</strong><br>

            ${capitalize(currentVenue.pris)}

        </div>

        <div class="infoRow">

            <strong>🏙️ Stadsdel</strong><br>

            ${capitalize(currentVenue.stadsdel)}

        </div>

        <div class="infoRow">

            <strong>📍 Adress</strong><br>

            ${currentVenue.adress}

        </div>

    `;

    showView("venueView");

}


function getSelectedFilters() {

    return {

        categories: [

            typePub.checked ? "pub" : null,
            typeBar.checked ? "bar" : null,
            typeRestaurant.checked ? "restaurang" : null

        ].filter(Boolean),

        tags: [

            typeCocktail.checked ? "cocktail" : null,
            typeWine.checked ? "vin" : null,
            typeNightclub.checked ? "nattliv" : null

        ].filter(Boolean)

    };

}


// ===============================
// Event Listeners
// ===============================



// Slumpa
// randomButton.addEventListener("click", randomVenue);

// Meny
menuButton.addEventListener("click", openMenu);
closeButton.addEventListener("click", closeMenu);
overlay.addEventListener("click", closeMenu);

// Inställningar
settingsButton.addEventListener("click", showSettings);
homeButton.addEventListener("click", showHome);