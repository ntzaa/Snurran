// ===============================
// Spinner
// ===============================

const ITEM_HEIGHT = 64;
const REPEATS = 20;
const START_LOOP = 10;

let currentVenue = null;
let currentIndex = 0;
let spinnerOrder = [];

let currentOffset = 0;
let spinning = false;
let hasSpun = false;

let buttonMode = "spin";


// ===============================
// Shuffle
// ===============================

function shuffle(array) {

    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [copy[i], copy[j]] = [copy[j], copy[i]];

    }

    return copy;

}


// ===============================
// Bygg spinner
// ===============================

function buildSpinner(names) {
  
    console.log("Bygger spinner med", names.length, "restauranger");

    const spinnerList =
        document.getElementById("spinnerList");

    let html = "";

    for (let i = 0; i < REPEATS; i++) {

        names.forEach(name => {

    html += `
        <div class="spinnerItem">
            ${hasSpun ? name : "❓❓❓"}
        </div>
    `;

});

    }

    spinnerList.innerHTML = html;
    spinnerList.classList.toggle(
    "spinnerIdle",
    !hasSpun
);

}


// ===============================
// Filtrering
// ===============================

function getFilteredVenues() {

    const filters = getSelectedFilters();

    if (favoritesOnly.checked) {
        return favorites;
    }

    console.log("Filters:", filters);

    const result = venues.filter(venue => {

        const categoryMatch =
            filters.categories.length === 0 ||
            filters.categories.includes(venue.kategori);

        const tagMatch =
            filters.tags.length === 0 ||
            venue.tags.some(tag => filters.tags.includes(tag));

        const priceMatch =
            filters.prices.length === 0 ||
            filters.prices.includes(venue.pris);

        const districtMatch =
            filters.districts.length === 0 ||
            filters.districts.includes(venue.stadsdel);

        return categoryMatch &&
               tagMatch &&
               priceMatch &&
               districtMatch;

    });

    console.log("Antal restauranger:", result.length);

    return result;

}


// ===============================
// Välj vinnare
// ===============================

function pickWinner(filtered) {

    const winnerIndex =
        Math.floor(Math.random() * filtered.length);

    currentVenue =
        filtered[winnerIndex];

    return winnerIndex;

}

// ===============================
// Räkna ut målposition
// ===============================

function calculateTargetIndex(filtered, winnerIndex) {

    let currentIndex =
        Math.floor(currentOffset / ITEM_HEIGHT);

    // Om vi börjar närma oss slutet,
    // flytta tillbaka till mitten.
    if (currentIndex > filtered.length * 15) {

        currentIndex =
            filtered.length * START_LOOP;

        currentOffset =
            currentIndex * ITEM_HEIGHT;

        const spinnerList =
            document.getElementById("spinnerList");

        spinnerList.style.transition = "none";
        spinnerList.style.transform =
            `translateY(-${currentOffset}px)`;

    }

    const loops =
        Math.floor(Math.random() * 4) + 4;

    return (
        currentIndex +
        filtered.length * loops +
        winnerIndex
    );

}

// ===============================
// Uppdatera spinner
// ===============================

function refreshSpinner() {
    spinnerOrder = shuffle(getFilteredVenues());

buildSpinner(
    spinnerOrder.map(v => v.namn)
);

    const firstItem = document.querySelector(".spinnerItem");

    const spinnerList =
        document.getElementById("spinnerList");

    const startOffset =
        START_LOOP *
        spinnerOrder.length *
        ITEM_HEIGHT;

    spinnerList.style.transition = "none";
    spinnerList.style.transform =
        `translateY(-${startOffset}px)`;
        currentOffset = startOffset;

}


// ===============================
// Snurra
// ===============================

function randomVenue() {

        hasSpun = true;
        refreshSpinner();

const filtered = spinnerOrder;

    if (filtered.length === 0)
        return;

    const spinnerList =
        document.getElementById("spinnerList");

    const spinnerWindow =
        document.getElementById("spinnerWindow");

    const windowHeight =
        spinnerWindow.clientHeight;

const winnerIndex =
    pickWinner(filtered);


const targetIndex =
    calculateTargetIndex(
        filtered,
        winnerIndex
    );

window.lastTargetIndex = targetIndex;

const CENTER_ADJUST = 0;

    const targetOffset =
        targetIndex * ITEM_HEIGHT -
        (windowHeight / 2) +
        (ITEM_HEIGHT / 2) +
        CENTER_ADJUST;


    randomButton.classList.add("buttonHidden");

    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            spinnerList.style.transition =
                "transform 5s cubic-bezier(.08,.85,.15,1)";

            spinnerList.style.transform =
                `translateY(-${targetOffset}px)`;

        });

    });

}


function initSpinner() {

    currentOffset = 0;
    spinning = false;

}

function toggleSpin() {

    if (buttonMode === "venue") {
        showVenue();
        return;
    }

    if (spinning)
        return;

    spinning = true;

    randomVenue();

    const spinnerList =
        document.getElementById("spinnerList");

    spinnerList.ontransitionend = () => {

            console.log("transitionend!");

    spinnerList.ontransitionend = null;

    spinning = false;

    const winnerItems =
        document.querySelectorAll(".spinnerItem");

    const winnerItem =
        winnerItems[window.lastTargetIndex];

    winnerItem.classList.add("winnerCelebrate");

    setTimeout(() => {

        winnerItem.classList.remove("winnerCelebrate");

    }, 900);

    const spinnerWindow =
        document.getElementById("spinnerWindow");

    spinnerWindow.classList.add("celebrate");

    setTimeout(() => {

        spinnerWindow.classList.remove("celebrate");

    }, 900);

    setTimeout(() => {

        buttonMode = "venue";

        randomButton.textContent = "GÅ TILL RESTAURANG";

        randomButton.classList.remove("buttonHidden");

    }, 1000);

};

}



