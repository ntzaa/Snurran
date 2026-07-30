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

const filterBackButton =
    document.getElementById("filterBackButton");

const venueBackButton =
    document.getElementById("venueBackButton");

const sideMenu = document.getElementById("sideMenu");
const closeButton = document.getElementById("closeButton");
const overlay = document.getElementById("overlay");

const filterButton =
    document.getElementById("filterButton");


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

const priceBillig = document.getElementById("priceBillig");
const priceMellan = document.getElementById("priceMellan");
const priceDyr = document.getElementById("priceDyr");

const districtSodermalm = document.getElementById("districtSodermalm");
const districtNorrmalm = document.getElementById("districtNorrmalm");
const districtVasastan = document.getElementById("districtVasastan");
const districtOstermalm = document.getElementById("districtOstermalm");
const districtKungsholmen = document.getElementById("districtKungsholmen");
const districtGamlaStan = document.getElementById("districtGamlaStan");

// ===============================
// Event Listeners
// ===============================

filterBackButton.addEventListener("click", showHome);
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


function showFilter() {

    showView("filterView");

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

        ].filter(Boolean),

        prices: [

            priceBillig.checked ? "billig" : null,
            priceMellan.checked ? "mellan" : null,
            priceDyr.checked ? "dyr" : null

        ].filter(Boolean),

        districts: [

            districtSodermalm.checked ? "sodermalm" : null,
            districtNorrmalm.checked ? "norrmalm" : null,
            districtVasastan.checked ? "vasastan" : null,
            districtOstermalm.checked ? "ostermalm" : null,
            districtKungsholmen.checked ? "kungsholmen" : null,
            districtGamlaStan.checked ? "gamla_stan" : null,
        

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

// Filter
filterButton.addEventListener("click", showFilter);
homeButton.addEventListener("click", showHome);


// ===============================
//         ANALYSVERKTYG
// ===============================

function analyzeVenues() {

    const stats = {
        total: venues.length,
        categories: {},
        prices: {},
        districts: {},
        tags: {},
        missing: {
            kategori: [],
            pris: [],
            tags: []
        }
    };

    venues.forEach(venue => {

        // Kategori
        if (venue.kategori) {
            stats.categories[venue.kategori] =
                (stats.categories[venue.kategori] || 0) + 1;
        } else {
            stats.missing.kategori.push(venue.namn);
        }

        // Pris
        if (venue.pris) {
            stats.prices[venue.pris] =
                (stats.prices[venue.pris] || 0) + 1;
        } else {
            stats.missing.pris.push(venue.namn);
        }

        // Stadsdel
        if (venue.stadsdel) {

            stats.districts[venue.stadsdel] =
                (stats.districts[venue.stadsdel] || 0) + 1;

}
        // Taggar
        if (Array.isArray(venue.tags) && venue.tags.length > 0) {

            venue.tags.forEach(tag => {
                stats.tags[tag] =
                    (stats.tags[tag] || 0) + 1;
            });

        } else {

            stats.missing.tags.push(venue.namn);

        }

    });

    console.clear();

    console.log("========== SNURRAN ANALYS ==========\n");

    console.log("Totalt antal ställen:", stats.total);

    console.log("\n📂 Kategorier");
    console.table(stats.categories);

    console.log("\n💰 Pris");
    console.table(stats.prices);

    console.log("\n📍 Stadsdelar");
    console.table(stats.districts);

    console.log("\n🏷️ Taggar");
    console.table(stats.tags);

    console.log("\n⚠️ Saknar kategori:", stats.missing.kategori.length);
    console.log(stats.missing.kategori);

    console.log("\n⚠️ Saknar pris:", stats.missing.pris.length);
    console.log(stats.missing.pris);

    console.log("\n⚠️ Saknar taggar:", stats.missing.tags.length);
    console.log(stats.missing.tags);

    console.log("\n====================================");

}