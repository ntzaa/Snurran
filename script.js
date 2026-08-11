// ===============================
// Variabler
// ===============================

let previousVenue = null;

let venues = [];

let favorites = [];

let previousView = "homeView";

const savedFavorites = localStorage.getItem("favorites");

if (savedFavorites) {
    favorites = JSON.parse(savedFavorites);
}

let spinHistory = [];

const savedSpinHistory = localStorage.getItem("spinHistory");

if (savedSpinHistory) {
    spinHistory = JSON.parse(savedSpinHistory);
}

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

const favoritesButton =
    document.getElementById("favoritesButton"); 

const venueHistoryButton =
    document.getElementById("venueHistoryButton");
    
const favoritesBackButton =
    document.getElementById("favoritesBackButton");

const favoriteSearch =
    document.getElementById("favoriteSearch");

const favoriteSearchResults =
    document.getElementById("favoriteSearchResults");

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

const favoritesList =
    document.getElementById("favoritesList");

    renderFavorites();
// ===============================
// Event Listeners
// ===============================

venueBackButton.addEventListener("click", () => {

    showView(previousView);

    if (previousView === "homeView") {

        buttonMode = "spin";

        randomButton.textContent = "SNURRA";

        hasSpun = false;

        buildSpinner(spinnerOrder);

    }

});

favoriteSearch.addEventListener("input", searchFavorites);

document
    .getElementById("introView")
    .addEventListener("click", startApp);

// ===============================
// Ladda venues
// ===============================

fetch("data/venues.json")
.then(response => response.json())
.then(venueData => {

    venues = venueData;

    initSpinner();

    console.log("Venue-fil inläst!");
    console.log(venues);

});


// ===============================
// Funktioner
// ===============================

function playSplashScreen() {

    const splash =
        document.getElementById("splashScreen");

    const title =
        document.getElementById("splashTitle");

    const menuButton =
        document.getElementById("menuButton");

        menuButton.classList.add("hidden");

    const text = "SNURRAN";

    let index = 0;

    const interval = setInterval(() => {

        title.textContent += text[index];

        index++;

        if(index >= text.length){

            clearInterval(interval);

            setTimeout(() => {

                title.style.animation = "splashPop 1.8s ease";

setTimeout(() => {

    splash.classList.add("fadeOut");

    setTimeout(() => {

  document.getElementById("introView").style.display = "flex";

setTimeout(() => {

    refreshSpinner();

}, 100);

},900);

},350);

},1000);

        }

    },120);

}

function startApp() {

    const intro =
        document.getElementById("introView");

    intro.classList.add("fadeOut");

    setTimeout(() => {

        intro.style.display = "none";

        showView("homeView");

    },400);
}

function showView(viewId) {

    const views = document.querySelectorAll(".view");

    views.forEach(view => {

        view.classList.remove("active");

    });

    document.getElementById(viewId)
        .classList.add("active");

    closeMenu();

    if (viewId === "filterView") {

        updateFavoriteFilterMode();

    }

    if (viewId === "venueHistoryView") {

        renderHistory();

    }

    if (viewId === "venueView") {

        menuButton.classList.add("hidden");

    } else {

        menuButton.classList.remove("hidden");

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

function showFavorites() {

    showView("favoritesView");

}

function showVenueHistory() {

    showView("venueHistoryView");

}


function showHome() {

    hasSpun = false;

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

        previousView =
        document.querySelector(".view.active").id;


    document.getElementById("venueTitle").textContent =
        currentVenue.namn;

        const venueGoogleLink =
    document.getElementById("venueGoogleLink");

const googleSearch =
    `${currentVenue.namn} ${currentVenue.adress}`;

venueGoogleLink.href =
    "https://www.google.com/search?q=" +
    encodeURIComponent(googleSearch);

    document.getElementById("venueDescription").innerHTML = `

<div class="infoRow infoRowTwoColumns">

    <div>

        <strong>Kategori</strong><br>

        ${capitalize(currentVenue.kategori)}

    </div>

    <div>

        <strong>Pris</strong><br>

        ${capitalize(currentVenue.pris)}

    </div>

</div>

        <div class="infoRow">

            <strong>Taggar</strong><br>

            <div class="tagContainer">

                ${currentVenue.tags.map(tag =>
                    `<span class="tag">${capitalize(tag)}</span>`
                ).join("")}

            </div>

        </div>


        <div class="infoRow">

            <strong>Stadsdel</strong><br>

            ${capitalize(currentVenue.stadsdel)}

        </div>

        <div class="infoRow">

            <strong>Adress</strong><br>

            ${currentVenue.adress}

        </div>

    `;

   addToHistory(currentVenue);

const venueFavoriteButton =
    document.getElementById("venueFavoriteButton");

const isFavorite =
    favorites.some(favorite =>
        favorite.id === currentVenue.id
    );

venueFavoriteButton.textContent =
    isFavorite ? "❤️" : "🤍";

venueFavoriteButton.onclick = () => {

    const isFavorite =
        favorites.some(favorite =>
            favorite.id === currentVenue.id
        );

    if (isFavorite) {

        favorites = favorites.filter(favorite =>
            favorite.id !== currentVenue.id
        );

    } else {

        favorites.push(currentVenue);

    }

    localStorage.setItem(
    "favorites",
    JSON.stringify(favorites)
);

renderFavorites();

venueFavoriteButton.textContent =
    isFavorite ? "🤍" : "❤️";

};

showView("venueView");

}


function getSelectedFilters() {

    return {

        categories: [

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

function searchFavorites() {

    const searchText = favoriteSearch.value.toLowerCase();

    if (venues.length === 0) {
        console.log("Venues har inte laddats ännu.");
        return;
    }

    if (searchText === "") {
        console.log([]);
        return;
    }

   if (searchText.trim().length < 2) {

    favoriteSearchResults.innerHTML = "";

    return;

}
    const matches = venues.filter(venue =>
        venue.namn.toLowerCase().includes(searchText)
    );

favoriteSearchResults.innerHTML = "";

matches.forEach(venue => {

    const result = document.createElement("div");

    result.className = "searchResult";

    result.textContent = venue.namn;

result.addEventListener("click", () => {

    const alreadyExists = favorites.some(favorite =>
        favorite.id === venue.id
    );

    if (alreadyExists) {
        return;
    }

    favorites.push(venue);

    renderFavorites();

    favoriteSearch.value = "";
    favoriteSearchResults.innerHTML = "";
    favoriteSearch.focus();

});

    favoriteSearchResults.appendChild(result);

});

}

function renderFavorites() {

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

    favoritesList.innerHTML = "";

    favorites.forEach(venue => {

        const item = document.createElement("div");

        item.className = "searchResult";

        item.style.cursor = "pointer";

        item.addEventListener("click", () => {

            currentVenue = venue;

            showVenue();

        });

        const name = document.createElement("span");

        name.textContent = venue.namn;

        const removeButton = document.createElement("button");

        removeButton.className = "removeFavoriteButton";

        removeButton.innerHTML = "&times;";

        removeButton.addEventListener("click", (event) => {

            event.stopPropagation();

            favorites = favorites.filter(favorite =>
                favorite.id !== venue.id
            );

            renderFavorites();

        });

        item.appendChild(name);

        item.appendChild(removeButton);

        favoritesList.appendChild(item);

    });

}


function addToHistory(venue) {

    // Ta bort restaurangen om den redan finns
    spinHistory = spinHistory.filter(item => item.id !== venue.id);

    // Lägg den först i listan
    spinHistory.unshift(venue);

    // Behåll max 20 restauranger
    spinHistory = spinHistory.slice(0, 20);

    // Spara
    localStorage.setItem(
        "spinHistory",
        JSON.stringify(spinHistory)
    );

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

// Hem
homeButton.addEventListener("click", showHome);

// Filter
filterButton.addEventListener("click", showFilter);

// Favoriter
favoritesButton.addEventListener("click", showFavorites);

// Historik
venueHistoryButton.addEventListener("click", showVenueHistory);

//Filtrera bort filter när favotitfilter är aktivt
const favoritesOnly = document.getElementById("favoritesOnly");

function updateFavoriteFilterMode() {

   const filterCards = document
    .getElementById("filterView")
    .querySelectorAll(
        ".filterCard:not(.filterFavoritesCard)"
    );

    filterCards.forEach(card => {

        if (favoritesOnly.checked) {
            card.classList.add("disabled");
        } else {
            card.classList.remove("disabled");
        }

    });

}

favoritesOnly.addEventListener("change", function () {

    updateFavoriteFilterMode();

});

function renderHistory() {

    venueHistoryList.innerHTML = "";

    spinHistory.forEach(venue => {

        const item = document.createElement("div");

        item.className = "searchResult";

        item.style.cursor = "pointer";

        item.addEventListener("click", () => {

            currentVenue = venue;

            showVenue();

        });

        const name = document.createElement("span");

        name.textContent = venue.namn;

        const favoriteButton = document.createElement("button");
        favoriteButton.className = "historyFavoriteButton";
        favoriteButton.innerHTML =
    favorites.some(favorite => favorite.id === venue.id)
        ? "❤️"
        : "🤍";

favoriteButton.addEventListener("click", function (event) {

    event.stopPropagation();

    const isFavorite =
        favorites.some(favorite => favorite.id === venue.id);

    if (isFavorite) {

        favorites = favorites.filter(
            favorite => favorite.id !== venue.id
        );

    } else {

        favorites.push(venue);

    }

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

    renderFavorites();
    renderHistory();

});

        item.appendChild(name);
        item.appendChild(favoriteButton);

        venueHistoryList.appendChild(item);

    });

}

playSplashScreen();

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