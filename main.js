function main() {
    console.log("main is running")
    calculateCountryPoints()
    calculateFactionPoints()

    tableSection.innerHTML = factionTablesHtml()
    periodSection.innerHTML = influenceHistoryHtml()
}

// Data Logic
// Actual data is at the bottom of the page
let totalPoints = 0

class Faction {
    constructor(key, name, points = 0) {
        this.key = key
        this.name = name
        this.points = points
        this.shareOfPoints = () => {
            return Math.round(this.points / totalPoints * 100)
        }
        this.memberCountries = []
    }
}

class FactionOfCountry {
    constructor(factionKey) {
        this.key = factionKey
        this.name = factions[factionKey].name
        this.points = factions[factionKey].points
        this.shareOfPoints = () => {
            return Math.round(this.points / totalPoints * 100)
        }
        this.shareOfPointsInFaction = () => {
            return Math.round(this.points / factions[factionKey].points * 100)
        }
    }
}

class Country {
    constructor(name, countryFactionKeys) {
        this.name = name
        this.factions = new Object()
        countryFactionKeys.forEach(factionKey => {
            this.factions[factionKey] = new FactionOfCountry(factionKey)
            factions[factionKey].memberCountries.push(this)
        })


        this.totalPoints = () => {
            let total = 0
            for (let [key, faction] of Object.entries(this.factions)) {
                total += faction.points
            }
            return total
        }

        this.shareOfPoints = () => {
            return Math.round(this.totalPoints() / totalPoints * 100)
        }
    }
}

class InfluenceShift {
    constructor(country, factionKey, amountOfPoints) {
        this.country = country
        this.factionKey = factionKey
        this.amountOfPoints = amountOfPoints
    }
}

class InfluenceShiftsOfFaction {
    constructor(factionKey, influenceData) {
        this.faction = factions[factionKey]
        this.influenceShiftArray = []
        for (let influenceDatum of influenceData) {
            this.influenceShiftArray.push(
                new InfluenceShift(influenceDatum[0], factionKey, influenceDatum[1])
            )
        }
    }
}

class Period {
    constructor(name, description, influenceShifts) {
        this.name = name
        this.description = description
        this.influenceShifts = influenceShifts
    }
}

function shiftInfluence(influenceShift) {
    influenceShift.country.factions[influenceShift.factionKey].points += influenceShift.amountOfPoints
}

function calculateCountryPoints() {
    for (let period of influenceHistory) {
        for (let influenceShiftBulk of period.influenceShifts) {
            for (let influenceShift of influenceShiftBulk.influenceShiftArray) {
                shiftInfluence(influenceShift)
            }
        }
    }
}

function calculateFactionPoints() {
    for (let [key, country] of Object.entries(countries)) {
        for (let [key, faction] of Object.entries(country.factions)) {
            factions[key].points += faction.points
            totalPoints += faction.points
        }
    }
}

// document logic
//// for influence tables
let tableSection = document.getElementById("table-section")
let numOfCols = 3

// Total influence of each country
function tableRowTotalCountryInfluence(country) {
    let tableRow = `
    <tr>
        <td>${country.name}</td>
        <td>${country.shareOfPoints()}%</td>
        <td>${country.totalPoints()} pts</td>
    </tr>
    `
    return tableRow
}

function tableTotalCountryInfluence() {
    let totalInfluenceTable = ""
    let tableHeader = "Total galactic influence by country"
    let tableRows = ""

    for (let [key, country] of Object.entries(countries)) {
        tableRows += tableRowTotalCountryInfluence(country)
    }

    totalInfluenceTable = `
    <table class="faction-table">
        <thead>
            <th colspan=${numOfCols}>${tableHeader}</th>
        </thead>
        <tbody>
            ${tableRows}
        </tbody>
    </table>`

    return totalInfluenceTable
}

// Influence of each faction and each country's influence within that faction
function tableRowFactionCountryInfluence(country, factionKey) {
    let htmlToReturn = `
    <tr>
        <td>${country.name}</td>
        <td>${country.factions[factionKey].shareOfPoints()}%</td>
        <td>${country.factions[factionKey].points} pts</td>
        <td>${country.factions[factionKey].shareOfPointsInFaction()} %</td>
    </tr>
    `
    return htmlToReturn
}

function tableFactionInfluence(faction) {
    let factionInfluenceTable = ""
    let tableRows = ""

    let totalInfluence = `
    <tr>
        <td><b>Total faction influence</b></td>
        <td><b>${factions[faction.key].shareOfPoints()}%</b></td>
        <td>${factions[faction.key].points} pts</td>
    </tr>
    `

    tableRows += totalInfluence

    for (let country of faction.memberCountries) {
        tableRows += tableRowFactionCountryInfluence(country, faction.key)
    }

    factionInfluenceTable = `
    <table class="faction-table">
        <thead>
            <th colspan=${numOfCols}>${faction.name}</th>
        </thead>
        <tbody>
            ${tableRows}
        </tbody>
    </table>`

    return factionInfluenceTable
}


function factionTablesHtml() {
    let factionTables = ""

    factionTables += tableTotalCountryInfluence()

    for (let [key, faction] of Object.entries(factions)) {
        factionTables += tableFactionInfluence(faction)
    }

    return factionTables
}

//// for influence history
let periodSection = document.getElementById("period-section")

function influenceShiftToHtml(influenceShift) {
    return `
    <tr>
        <td>${influenceShift.country.name}</td>
        <td>${influenceShift.amountOfPoints} pts</td>
    </tr>
    `
}

function influenceShiftBulkToHtml(influenceShiftBulk) {

    let influenceShiftRows = ""

    for (let influenceShift of influenceShiftBulk.influenceShiftArray) {
        influenceShiftRows += influenceShiftToHtml(influenceShift)
    }

    return `
    <table class="influence-shift">
        <thead>
            <th colspan="3">${influenceShiftBulk.faction.name}</th>
        </thead>
        <tbody>
            ${influenceShiftRows}
        </tbody>
    </table>
    `
}

function periodToHtml(period) {
    let influenceShiftTables = ""

    for (influenceShiftBulk of period.influenceShifts) {
        influenceShiftTables += influenceShiftBulkToHtml(influenceShiftBulk)
    }

    let periodHtml = `
    <details class="influence-period">
        <summary class="period-name">
            ${period.name}
        </summary>
        <p class="period-description">
            ${period.description}
        </p>
        ${influenceShiftTables}
    </details>
    <br>
    `

    return periodHtml
}

function influenceHistoryHtml() {

    let influenceHistoryHtml = ""

    for (let period of influenceHistory) {
        influenceHistoryHtml += periodToHtml(period)
    }

    return influenceHistoryHtml
}


// Data
let factions = {
    spaceWeavers: new Faction("spaceWeavers", "Space Weavers"),

    scientificBond: new Faction("scientificBond", "Scientific Bond")
}

// faction key shorthands
const _spaceWeaverKey = factions.spaceWeavers.key
const _scientificBondKey = factions.scientificBond.key

let countries = {
    // alphabetical order
    kindra: new Country("Osiri Federation", [_spaceWeaverKey]),
    quinny: new Country("Five Banners Privateers", [_spaceWeaverKey, _scientificBondKey]),
    randwarf: new Country("Utopian Project", [_spaceWeaverKey]),
    sari: new Country("Aquan Alliance", [_spaceWeaverKey]),
    spectre: new Country("Tel'Narior", [_scientificBondKey]),
    stooser: new Country("Ultravisionary", [_scientificBondKey]),
    wiggen: new Country("Vrinn United", [_spaceWeaverKey, _scientificBondKey])
}

let periods = {
    period2310s: new Period(
        "The 2310s",
        `The Space Weavers are on the rise, increasing their membership as the Ultravisionary creates the Scientific Bond.<br>
        Still a budding project of a single country and therefore not yet present on the galactic stage, many nations have shown interest
        to it and will likely join, making it part of the Galactic Community.`,
        [
            new InfluenceShiftsOfFaction(_spaceWeaverKey,
                [
                    [countries.sari, +250],
                    [countries.randwarf, +290],
                    [countries.quinny, +240],
                    [countries.kindra, +90],
                    [countries.wiggen, +100]
                ]
            ),

            new InfluenceShiftsOfFaction(_scientificBondKey,
                [
                    [countries.stooser, +100],
                    [countries.quinny, +30],
                    [countries.spectre, +30],
                    [countries.wiggen, +30]
                ]
            )
        ]
    )
}

let influenceHistory = [
    periods.period2310s
]

main()
