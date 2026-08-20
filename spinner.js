// ===============================
// SNURRAN - OPTIMERAD SPINNER
// ===============================
//
// Den här versionen använder en liten virtuell sekvens
// i DOM istället för att skapa hela venues-listan x 20.
//
// 723 venues = fortfarande 723 venues i JavaScript.
// DOM = endast ett begränsat antal spinnerItems.
//

const ITEM_HEIGHT = 64;

// Antal visuella rader som faktiskt existerar i DOM.
// 41 räcker gott för att skapa en lång och övertygande
// spinnersekvens utan tusentals DOM-element.
const VISIBLE_SEQUENCE = 41;

// Hur långt in i den visuella sekvensen vinnaren placeras.
const WINNER_INDEX = 34;

// Hur många slumpmässiga "fejkvarv" vi visar innan vinnaren.
// Detta ersätter den gamla REPEATS = 20.
const RANDOM_BEFORE_WINNER = 33;

const START_LOOP = 0;

let currentVenue = null;
let currentIndex = 0;
let spinnerOrder = [];

let currentOffset = 0;
let spinning = false;
let hasSpun = false;

let buttonMode = "spin";

let activeTransitionHandler = null;
let buttonRevealTimeout = null;


// ===============================
// Shuffle
// ===============================

function shuffle(array) {

    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {

        const j =
            Math.floor(Math.random() * (i + 1));

        [copy[i], copy[j]] =
            [copy[j], copy[i]];
    }

    return copy;
}


// ===============================
// Slumpa ett venue
// ===============================

function randomFromArray(array) {

    if (!array || array.length === 0) {
        return null;
    }

    return array[
        Math.floor(Math.random() * array.length)
    ];
}


// ===============================
// Bygg en liten virtuell sekvens
// ===============================
//
// GAMLA VERSIONEN:
//
// 723 venues × 20 repetitioner
// = 14 460 DOM-element.
//
// NYA VERSIONEN:
//
// ungefär 41 DOM-element totalt.
//
// Vi behöver inte visa alla venues.
// Vi behöver bara skapa illusionen av
// att spinnern passerar många alternativ.
//

function buildSpinnerSequence(names, winnerName = null) {

    const spinnerList =
        document.getElementById("spinnerList");

    if (!spinnerList) {
        return;
    }

    if (!names || names.length === 0) {

        spinnerList.innerHTML = `
            <div class="spinnerNoResult">
                <strong>INGET RESULTAT</strong>
                <span>Prova att ändra dina filter.</span>
            </div>
        `;

        spinnerList.style.transition = "none";
        spinnerList.style.transform =
            "translateY(0)";

        return;
    }


    // -------------------------------------------------
    // Om vi inte har en vinnare ännu:
    // visa bara en liten dold/neutral startsekvens.
    // -------------------------------------------------

    if (!winnerName) {

        const startNames = [];

        for (
            let i = 0;
            i < VISIBLE_SEQUENCE;
            i++
        ) {

            startNames.push(
                randomFromArray(names)
            );
        }

        spinnerList.innerHTML =
            startNames
                .map(name => `
                    <div class="spinnerItem">
                        ❓❓❓
                    </div>
                `)
                .join("");

        spinnerList.classList.toggle(
            "spinnerIdle",
            !hasSpun
        );

        return;
    }


    // -------------------------------------------------
    // Vi har en vinnare.
    //
    // Skapa en kort sekvens där vinnaren ligger
    // långt mot slutet.
    // -------------------------------------------------

    const sequence = [];


    for (
    let i = 0;
    i < WINNER_INDEX;
    i++
) {

    let name =
        randomFromArray(names);

    // Undvik:
    // 1. samma venue två gånger i rad
    // 2. vinnaren innan den riktiga vinnarraden

    if (names.length > 1) {

        let attempts = 0;

        while (
            (
                name === sequence[sequence.length - 1] ||
                name === winnerName
            ) &&
            attempts < 20
        ) {

            name =
                randomFromArray(names);

            attempts++;
        }
    }

    sequence.push(name);
}


    // -------------------------------------------------
    // Den riktiga vinnaren.
    // -------------------------------------------------

    sequence.push(winnerName);


    // -------------------------------------------------
    // Några sista rader efter vinnaren.
    // Dessa gör att den inte känns som att den
    // "bara åkte till ett slut".
    // -------------------------------------------------

    while (
    sequence.length < VISIBLE_SEQUENCE
) {

    let name =
        randomFromArray(names);

    if (names.length > 1) {

        let attempts = 0;

        while (
            name === sequence[sequence.length - 1] &&
            attempts < 20
        ) {

            name =
                randomFromArray(names);

            attempts++;
        }
    }

    sequence.push(name);
}


    spinnerList.innerHTML =
        sequence
            .map(name => `
                <div class="spinnerItem">
                    ${name}
                </div>
            `)
            .join("");

    spinnerList.classList.remove("spinnerIdle");
}


// ===============================
// Filtrering
// ===============================

function getFilteredVenues() {

    const filters =
        getSelectedFilters();

    if (favoritesOnly.checked) {
        return favorites;
    }

    const result =
        venues.filter(venue => {

            // ===============================
            // Typ — OR
            // ===============================

            const categoryMatch =
                filters.categories.length === 0 ||
                venue.kategorier.some(kategori =>
                    filters.categories.includes(kategori)
                );


            // ===============================
            // Egenskaper — AND
            // ===============================

            const propertyMatch =
                filters.properties.length === 0 ||
                filters.properties.every(property =>
                    venue.tags.includes(property)
                );


            // ===============================
            // Pris — OR
            // ===============================

            const priceMatch =
                filters.prices.length === 0 ||
                filters.prices.includes(venue.pris);


            // ===============================
            // Stadsdel — OR
            // ===============================

            const districtMatch =
                filters.districts.length === 0 ||
                filters.districts.includes(venue.stadsdel);


            // ===============================
            // Alla filtergrupper — AND
            // ===============================

            return (
                categoryMatch &&
                propertyMatch &&
                priceMatch &&
                districtMatch
            );

        });

    return result;
}


// ===============================
// Välj vinnare
// ===============================

function pickWinner(filtered) {

    const winnerIndex =
        Math.floor(
            Math.random() * filtered.length
        );

    currentVenue =
        filtered[winnerIndex];

    return winnerIndex;
}


// ===============================
// Uppdatera spinner
// ===============================
//
// Viktig skillnad:
//
// Den här funktionen skapar ALDRIG
// hundratals/tusentals DOM-element.
//
// Den bygger bara en liten visuell sekvens.
//

function refreshSpinner() {

    spinnerOrder =
        shuffle(
            getFilteredVenues()
        );


    const spinnerList =
        document.getElementById("spinnerList");


    if (!spinnerList) {
        return;
    }


    // ===============================
    // Inget resultat
    // ===============================

    if (spinnerOrder.length === 0) {

        spinnerList.innerHTML = `
            <div class="spinnerNoResult">
                <strong>INGET RESULTAT</strong>
                <span>Prova att ändra dina filter.</span>
            </div>
        `;

        spinnerList.style.transition =
            "none";

        spinnerList.style.transform =
            "translateY(0)";

        randomButton.classList.add(
            "buttonHidden"
        );

        return;
    }


    randomButton.classList.remove(
        "buttonHidden"
    );


    // ===============================
    // Startsekvens
    // ===============================

    buildSpinnerSequence(
        spinnerOrder.map(v => v.namn)
    );


    spinnerList.style.transition =
        "none";

    spinnerList.style.transform =
        "translateY(0)";

    currentOffset = 0;
}


// ===============================
// Skapa snurrsekvens
// ===============================

function prepareSpinSequence(
    filtered,
    winnerIndex
) {

    const spinnerList =
        document.getElementById("spinnerList");

    if (!spinnerList) {
        return;
    }


    const winner =
        filtered[winnerIndex];


    if (!winner) {
        return;
    }


    const names =
        filtered.map(
            venue => venue.namn
        );


    // Bygg den lilla virtuella listan.
    buildSpinnerSequence(
        names,
        winner.namn
    );


    // Säkerställ att vi börjar från toppen.
    spinnerList.style.transition =
        "none";

    spinnerList.style.transform =
        "translateY(0)";

    currentOffset = 0;
}


// ===============================
// Snurra
// ===============================

function randomVenue() {

    hasSpun = true;


    // OBS:
    // Vi behöver inte längre bygga om en
    // gigantisk lista här.
    //
    // Vi hämtar bara det aktuella urvalet.

    spinnerOrder =
        shuffle(
            getFilteredVenues()
        );


    const filtered =
        spinnerOrder;


    if (filtered.length === 0) {

        spinning = false;
        return;
    }


    const spinnerList =
        document.getElementById("spinnerList");


    const spinnerWindow =
        document.getElementById("spinnerWindow");


    if (!spinnerList || !spinnerWindow) {
        spinning = false;
        return;
    }


// ===============================
// Välj vinnare
// ===============================

const winnerIndex =
    Math.floor(Math.random() * filtered.length);

currentVenue =
    filtered[winnerIndex];

const winner =
    currentVenue;

if (!winner) {
    spinning = false;
    return;
}


    // ===============================
    // Bygg liten virtuell sekvens
    // ===============================

    prepareSpinSequence(
        filtered,
        winnerIndex
    );


    // ===============================
    // Målposition
    // ===============================
    //
    // Vinnaren ligger på WINNER_INDEX.
    // Vi behöver alltså bara flytta listan
    // cirka 34 rader.
    //
    // Inte hundratusentals pixlar.
    //

    const windowHeight =
        spinnerWindow.clientHeight;


    const targetIndex =
        WINNER_INDEX;


    window.lastTargetIndex =
        targetIndex;


    const CENTER_ADJUST = 0;


    const targetOffset =
        targetIndex * ITEM_HEIGHT -
        (windowHeight / 2) +
        (ITEM_HEIGHT / 2) +
        CENTER_ADJUST;


    currentIndex =
        targetIndex;


    randomButton.classList.add(
        "buttonHidden"
    );


    // ===============================
    // Starta animationen
    // ===============================

    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            spinnerList.style.transition =
                "transform 7s cubic-bezier(.05,.85,.45,1)";

            spinnerList.style.transform =
                `translateY(-${targetOffset}px)`;

            currentOffset =
                targetOffset;
        });

    });
}


// ===============================
// Init
// ===============================

function initSpinner() {

    currentOffset = 0;

    currentIndex = 0;

    spinning = false;

    hasSpun = false;

    buttonMode = "spin";

    currentVenue = null;

    spinnerOrder = [];
}
// ===============================
// Stoppa pågående snurr
// ===============================

function stopSpinner() {

    const spinnerList =
        document.getElementById("spinnerList");

    const spinnerWindow =
        document.getElementById("spinnerWindow");


    // Avbryt eventuell transitionend-lyssnare

    if (
        spinnerList &&
        activeTransitionHandler
    ) {

        spinnerList.removeEventListener(
            "transitionend",
            activeTransitionHandler
        );

        activeTransitionHandler = null;
    }


    // Avbryt eventuell väntande knappändring

    if (buttonRevealTimeout) {

        clearTimeout(buttonRevealTimeout);

        buttonRevealTimeout = null;
    }


    // Stoppa själva animationen

    if (spinnerList) {

        spinnerList.style.transition =
            "none";

        spinnerList.style.transform =
            "translateY(0)";
    }


    // Ta bort eventuell vinnar-animation

    if (spinnerList) {

        spinnerList
            .querySelectorAll(".winnerCelebrate")
            .forEach(item => {

                item.classList.remove(
                    "winnerCelebrate"
                );

            });
    }


    if (spinnerWindow) {

        spinnerWindow.classList.remove(
            "celebrate"
        );
    }


    // Återställ spinnerns state

    spinning = false;

    hasSpun = false;

    buttonMode = "spin";

    currentVenue = null;

    currentOffset = 0;

    currentIndex = 0;


    // Återställ knappen

    randomButton.textContent =
        "SNURRA";

    randomButton.classList.remove(
        "buttonHidden"
    );
}

// ===============================
// Toggle SNURRA / VISA STÄLLET
// ===============================

function toggleSpin() {

    // ===============================
    // VISA STÄLLET
    // ===============================

    if (buttonMode === "venue") {

        showVenue();

        return;
    }


    // ===============================
    // Förhindra dubbla klick
    // ===============================

    if (spinning) {
        return;
    }


    spinning = true;


    // ===============================
    // Starta snurr
    // ===============================

    randomVenue();


    const spinnerList =
        document.getElementById("spinnerList");


    if (!spinnerList) {

        spinning = false;

        return;
    }


    // ===============================
    // Vänta på att CSS-transitionen
    // verkligen är klar.
    // ===============================

    spinnerList.ontransitionend = null;


 activeTransitionHandler =
    function handleTransition(event) {

        // Vi bryr oss bara om transform.
        if (
            event.propertyName !==
            "transform"
        ) {
            return;
        }


        spinnerList.removeEventListener(
            "transitionend",
            activeTransitionHandler
        );


        // ===============================
        // Animation klar
        // ===============================

        spinning = false;


        const winnerItems =
            spinnerList.querySelectorAll(
                ".spinnerItem"
            );


        const winnerItem =
            winnerItems[WINNER_INDEX];


        if (winnerItem) {

            winnerItem.classList.add(
                "winnerCelebrate"
            );
        }


        const spinnerWindow =
            document.getElementById(
                "spinnerWindow"
            );


        if (spinnerWindow) {

            spinnerWindow.classList.add(
                "celebrate"
            );
        }


        // ===============================
        // Byt knapp till:
        // VISA STÄLLET
        // ===============================

        buttonRevealTimeout =
            setTimeout(() => {

                buttonMode = "venue";

                randomButton.textContent =
                    "VISA STÄLLET";

                randomButton.classList.remove(
                    "buttonHidden"
                );

                buttonRevealTimeout = null;

            }, 1000);

    };


spinnerList.addEventListener(
    "transitionend",
    activeTransitionHandler
);
}


// ===============================
// Export / global tillgänglighet
// ===============================
//
// script.js använder dessa funktioner
// direkt, så de måste ligga globalt.
//

window.initSpinner =
    initSpinner;

window.refreshSpinner =
    refreshSpinner;

window.buildSpinner =
    buildSpinnerSequence;

window.toggleSpin =
    toggleSpin;

window.stopSpinner =
    stopSpinner;

window.randomVenue =
    randomVenue;

window.getFilteredVenues =
    getFilteredVenues;