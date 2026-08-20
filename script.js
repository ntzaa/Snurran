// ===============================
// Variabler
// ===============================

let previousVenue = null;

let venues = [];

// ===============================
// Städer
// ===============================

const CITIES = {
    stockholm: {
        namn: "Stockholm",
        fil: "data/venuesStockholm.json",
        stadsdelar: [
            "sodermalm",
            "norrmalm",
            "vasastan",
            "ostermalm",
            "kungsholmen",
            "gamla_stan",
            "slakthusomradet"
        ]
    },

    goteborg: {
        namn: "Göteborg",
        fil: "data/venuesGoteborg.json"
    }
};

// Visningsnamn för stadsdelar.
// JSON-värdena kan fortsätta vara maskinläsbara.
const STOCKHOLM_DISTRICTS = [
    "sodermalm",
    "norrmalm",
    "vasastan",
    "ostermalm",
    "kungsholmen",
    "gamla_stan",
    "slakthusomradet"
];

const DISTRICT_NAMES = {
    sodermalm: "Södermalm",
    norrmalm: "Norrmalm",
    vasastan: "Vasastan",
    ostermalm: "Östermalm",
    kungsholmen: "Kungsholmen",
    gamla_stan: "Gamla stan",
    slakthusomradet: "Slakthusområdet",
    slakthusomradet: "Slakthusområdet",
    centrum: "Centrum",
    linne: "Linné",
    haga: "Haga",
    majorna: "Majorna"
};

function formatDistrictName(district) {

    if (DISTRICT_NAMES[district]) {
        return DISTRICT_NAMES[district];
    }

    return district
        .replace(/_/g, " ")
        .replace(/^./, char => char.toUpperCase());
}

let currentCity =
    localStorage.getItem("currentCity") || "stockholm";

if (!CITIES[currentCity]) {
    currentCity = "stockholm";
}

// ===============================
// Favoriter & historik per stad
// ===============================
//
// Vi använder nya, stadsseparerade localStorage-objekt.
// Äldre versioner av Snurran sparade allt under:
//
//   "favorites"
//   "spinHistory"
//
// Vid första körningen migreras dessa automatiskt till
// Stockholm. Göteborg får en tom lista tills något sparas där.

let favoritesByCity = {};
let historyByCity = {};

let favorites = [];
let spinHistory = [];

let previousView = "homeView";

function parseStoredJSON(key, fallback) {

    const saved = localStorage.getItem(key);

    if (!saved) {
        return fallback;
    }

    try {
        return JSON.parse(saved);
    } catch (error) {
        console.warn(
            `Kunde inte läsa localStorage: ${key}`,
            error
        );

        return fallback;
    }
}

function initializeCityCollections() {

    const savedFavoritesByCity =
        parseStoredJSON(
            "favoritesByCity",
            null
        );

    const savedHistoryByCity =
        parseStoredJSON(
            "spinHistoryByCity",
            null
        );

    // Om den nya strukturen redan finns använder vi den.
    // Annars migrerar vi den gamla globala listan till Stockholm.
    if (
        savedFavoritesByCity &&
        typeof savedFavoritesByCity === "object" &&
        !Array.isArray(savedFavoritesByCity)
    ) {
        favoritesByCity = savedFavoritesByCity;
    } else {

        const oldFavorites =
            parseStoredJSON("favorites", []);

        favoritesByCity = {
            stockholm: Array.isArray(oldFavorites)
                ? oldFavorites
                : []
        };
    }

    if (
        savedHistoryByCity &&
        typeof savedHistoryByCity === "object" &&
        !Array.isArray(savedHistoryByCity)
    ) {
        historyByCity = savedHistoryByCity;
    } else {

        const oldHistory =
            parseStoredJSON("spinHistory", []);

        historyByCity = {
            stockholm: Array.isArray(oldHistory)
                ? oldHistory
                : []
        };
    }

    // Se till att varje stad alltid har en array.
    Object.keys(CITIES).forEach(cityId => {

        if (!Array.isArray(favoritesByCity[cityId])) {
            favoritesByCity[cityId] = [];
        }

        if (!Array.isArray(historyByCity[cityId])) {
            historyByCity[cityId] = [];
        }

    });

    // Spara den nya strukturen direkt.
    localStorage.setItem(
        "favoritesByCity",
        JSON.stringify(favoritesByCity)
    );

    localStorage.setItem(
        "spinHistoryByCity",
        JSON.stringify(historyByCity)
    );
}

function syncCurrentCityCollections() {

    if (!Array.isArray(favoritesByCity[currentCity])) {
        favoritesByCity[currentCity] = [];
    }

    if (!Array.isArray(historyByCity[currentCity])) {
        historyByCity[currentCity] = [];
    }

    // Resten av appen använder fortfarande dessa två variabler.
    // De pekar nu på den aktuella stadens listor.
    favorites = favoritesByCity[currentCity];
    spinHistory = historyByCity[currentCity];
}

function saveFavorites() {

    favoritesByCity[currentCity] = favorites;

    localStorage.setItem(
        "favoritesByCity",
        JSON.stringify(favoritesByCity)
    );
}

function saveSpinHistory() {

    historyByCity[currentCity] = spinHistory;

    localStorage.setItem(
        "spinHistoryByCity",
        JSON.stringify(historyByCity)
    );
}

initializeCityCollections();
syncCurrentCityCollections();

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

const districtFilters =
    document.getElementById("districtFilters");

const favoritesList =
    document.getElementById("favoritesList");

    
const citySelect =
    document.getElementById("citySelect");

const citySubtitle =
    document.getElementById("citySubtitle");

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

async function loadCity(cityId, initialize = false) {

    const city = CITIES[cityId];

    if (!city) {
        console.error("Okänd stad:", cityId);
        return;
    }

    try {

        const response = await fetch(city.fil);

        if (!response.ok) {
            throw new Error(`Kunde inte ladda ${city.fil}`);
        }

        const venueData = await response.json();

        venues = venueData.map(venue => ({
            ...venue,
            stad: cityId,

            kategorier:
                Array.isArray(venue.kategorier)
                    ? venue.kategorier
                    : [],

            tags:
                Array.isArray(venue.tags)
                    ? venue.tags
                    : []
        }));

        currentCity = cityId;

        localStorage.setItem("currentCity", currentCity);

        syncCurrentCityCollections();

        updateCityUI();
        resetDistrictFilters();

        if (initialize) {
            initSpinner();
        } else {
            hasSpun = false;
            buttonMode = "spin";
            randomButton.textContent = "SNURRA";
            refreshSpinner();
            updateActiveFilters();
        }

        console.log(`Venue-fil inläst: ${city.namn}`);
        console.log(venues);

    } catch (error) {

        console.error(
            "Kunde inte ladda stadens venue-fil:",
            error
        );

    }
}

function updateCityUI() {

    const city = CITIES[currentCity];

    if (!city) {
        return;
    }

    citySubtitle.textContent = city.namn;
    citySelect.value = currentCity;
}

function getAvailableDistricts() {

    if (currentCity === "stockholm") {
        return STOCKHOLM_DISTRICTS.filter(district =>
            venues.some(
                venue => venue.stadsdel === district
            )
        );
    }

    return [...new Set(
        venues
            .map(venue => venue.stadsdel)
            .filter(Boolean)
    )].sort((a, b) =>
        formatDistrictName(a).localeCompare(
            formatDistrictName(b),
            "sv"
        )
    );
}

function renderDistrictFilters() {

    if (!districtFilters) {
        return;
    }

    const districts =
        getAvailableDistricts();

    districtFilters.innerHTML = "";

    districts.forEach(district => {

        const label =
            document.createElement("label");

        const checkbox =
            document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.value = district;

        label.appendChild(checkbox);

        label.appendChild(
            document.createTextNode(
                ` ${formatDistrictName(district)}`
            )
        );

        districtFilters.appendChild(label);

    });
}

function resetDistrictFilters() {

    if (!districtFilters) {
        return;
    }

    renderDistrictFilters();

    districtFilters
        .querySelectorAll('input[type="checkbox"]')
        .forEach(checkbox => {
            checkbox.checked = false;
        });
}

loadCity(currentCity, true);


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

    updateActiveFilters();

    intro.classList.add("fadeOut");

    setTimeout(() => {

        intro.style.display = "none";

        showView("homeView");

    },400);
}

function clearWinnerEffects() {

    const winnerItems =
        document.querySelectorAll(".winnerCelebrate");

    winnerItems.forEach(item => {
        item.classList.remove("winnerCelebrate");
    });

    const spinnerWindow =
        document.getElementById("spinnerWindow");

    spinnerWindow.classList.remove("celebrate");
}

function showView(viewId) {

    const views = document.querySelectorAll(".view");

    views.forEach(view => {

        view.classList.remove("active");

    });

    document.getElementById(viewId)
        .classList.add("active");

    closeMenu();

    clearWinnerEffects();


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

function updateActiveFilters() {

    const activeFiltersElement =
        document.getElementById("activeFilters");

    if (favoritesOnly.checked) {

        activeFiltersElement.textContent =
            "Endast favoritställen";

        return;
    }

    const filters = getSelectedFilters();

    const activeFilters = [
        ...filters.categories,
        ...filters.properties,
        ...filters.prices,
        ...filters.districts
    ];

    if (activeFilters.length === 0) {

        activeFiltersElement.textContent = "";

        return;
    }

    activeFiltersElement.textContent =
        activeFilters
            .map(filter => capitalize(filter))
            .join(" · ");
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

    renderFavorites();

    showView("favoritesView");

}

function showVenueHistory() {

    showView("venueHistoryView");

}


function showHome() {

    console.log("SHOW HOME – refreshar spinner");

    hasSpun = false;

    refreshSpinner();

    updateActiveFilters();

    showView("homeView");

    buttonMode = "spin";
    randomButton.textContent = "SNURRA";
}

function showSettings() {

    updateCityUI();

    showView("settingsView");
}

function showAbout() {

    showView("aboutView");

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

function formatTag(tag) {

    const tagNames = {

        ol: "Öl",
        vin: "Vin",
        cocktail: "Cocktail",
        nattliv: "Nattliv"

    };

    return tagNames[tag] || capitalize(tag);
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

    <div class="infoRow">

        <div class="tagContainer">

                ${(currentVenue.tags || []).map(tag =>
                    `<span class="tag">${formatTag(tag)}</span>`
                    ).join("")}

        </div>

    </div>

    <div class="infoRow venueTypePrice">

    <strong>
        ${["billig", "billigt"].includes(currentVenue.pris.toLowerCase()) ? "💰" : currentVenue.pris.toLowerCase() === "mellan" ? "💰💰" : "💰💰💰"} ${capitalize(currentVenue.pris)}
        ·
        ${(currentVenue.kategorier || [])
            .map(kategori => capitalize(kategori))
            .join(" · ")}
    </strong>

</div>
           

<div class="infoRow venueDistrict">

        <strong>${
    currentVenue.stadsdel === "sodermalm"
        ? "Södermalm"
        : currentVenue.stadsdel === "ostermalm"
            ? "Östermalm"
            : capitalize(currentVenue.stadsdel)
}</strong>

    </div>

<div class="infoRow venueAddress">
    ${currentVenue.adress}
</div>

<div class="infoRow venueOpeningHours">

        <p>Öppettider: Ingen information tillgänglig.</p>
                
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

        favorites.unshift(currentVenue);

    }

    saveFavorites();

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
            typeRestaurant.checked ? "restaurang" : null,
            typeNightclub.checked ? "nattklubb" : null

        ].filter(Boolean),

        properties: [

            propertyCocktail.checked ? "cocktailbar" : null,
            propertyWine.checked ? "vinbar" : null,
            propertyHotelBar.checked ? "hotellbar" : null,
            propertyOutdoor.checked ? "uteservering" : null,
            propertyRooftop.checked ? "takbar" : null,
            propertyLiveMusic.checked ? "livemusik" : null,
            propertyQuiz.checked ? "quiz" : null


        ].filter(Boolean),

        prices: [

            priceBillig.checked ? "billig" : null,
            priceMellan.checked ? "mellan" : null,
            priceDyr.checked ? "dyr" : null

        ].filter(Boolean),

        districts: Array.from(
            districtFilters.querySelectorAll(
                'input[type="checkbox"]:checked'
            )
        ).map(
            checkbox => checkbox.value
        )

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

    favorites.unshift(venue);

    renderFavorites();

    favoriteSearch.value = "";
    favoriteSearchResults.innerHTML = "";
    favoriteSearch.focus();

});

    favoriteSearchResults.appendChild(result);

});

}

function renderFavorites() {

    saveFavorites();

    favoritesList.innerHTML = "";

    if (favorites.length === 0) {

    favoritesList.innerHTML = `
        <div class="emptyListMessage">
            <strong>Du har inga favoriter ännu.</strong><br>
            <span>Sök fram en egen favorit eller tryck på ❤️ på en snurrad restaurang för att spara den här.</span>
        </div>
    `;

    return;
}

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
    saveSpinHistory();

}

// ===============================
// Event Listeners
// ===============================



// Stad
// ===============================

citySelect.addEventListener("change", async () => {

    await loadCity(
        citySelect.value,
        false
    );

    if (
        document
            .getElementById("favoritesView")
            .classList.contains("active")
    ) {
        renderFavorites();
    }

});

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

// Inställningar
settingsButton.addEventListener("click", showSettings);

// Om
aboutButton.addEventListener("click", showAbout);


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

    if (spinHistory.length === 0) {

    venueHistoryList.innerHTML = `
        <div class="emptyListMessage">
            <strong>Ingen historik ännu.</strong><br>
            <span>Snurra för att få fram historik.</span>
        </div>
    `;

    return;
}

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

        favorites.unshift(venue);

    }

    saveFavorites();

    renderFavorites();
    renderHistory();

});

        item.appendChild(name);
        item.appendChild(favoriteButton);

        venueHistoryList.appendChild(item);

    });

}

updateCityUI();

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
            kategorier: [],
            pris: [],
            tags: []
        }
    };

    venues.forEach(venue => {

        // Kategori
        if (Array.isArray(venue.kategorier) && venue.kategorier.length > 0) {

    venue.kategorier.forEach(kategori => {

        stats.categories[kategori] =
            (stats.categories[kategori] || 0) + 1;

    });

} else {

    stats.missing.kategorier.push(venue.namn);

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

    console.log("\n⚠️ Saknar kategorier:", stats.missing.kategorier.length);
    console.log(stats.missing.kategorier);

    console.log("\n⚠️ Saknar pris:", stats.missing.pris.length);
    console.log(stats.missing.pris);

    console.log("\n⚠️ Saknar taggar:", stats.missing.tags.length);
    console.log(stats.missing.tags);

    console.log("\n====================================");

}