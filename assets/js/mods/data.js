// data.js

/**
 * Data handling module for the War Data Visualization PWA
 */

const GAZA_CASUALTIES_API_URL = "https://data.techforpalestine.org/api/v2/casualties_daily.min.json"
const WEST_BANK_CASUALTIES_API_URL = "https://data.techforpalestine.org/api/v2/west_bank_daily.min.json"
const KILLED_IN_GAZA_API_URL = "https://data.techforpalestine.org/api/v2/killed-in-gaza.min.json"
const PRESS_KILLED_API_URL = "https://data.techforpalestine.org/api/v2/press_killed_in_gaza.min.json"
const INFRASTRUCTURE_API_URL = "https://data.techforpalestine.org/api/v3/infrastructure-damaged.min.json"

// Sample data for development/fallback
const SAMPLE_DATA = [
  {
    report_date: "2023-10-07",
    report_source: "mohtel",
    report_period: 24,
    ext_massacres_cum: 0,
    killed: 232,
    killed_cum: 232,
    ext_killed: 232,
    ext_killed_cum: 232,
    ext_killed_children_cum: 0,
    ext_killed_women_cum: 0,
    injured_cum: 1610,
    ext_injured: 1610,
    ext_injured_cum: 1610,
    ext_civdef_killed_cum: 0,
    med_killed_cum: 6,
    ext_med_killed_cum: 6,
    press_killed_cum: 1,
    ext_press_killed_cum: 1,
  },
  {
    report_date: "2023-10-08",
    report_source: "mohtel",
    report_period: 24,
    ext_massacres_cum: 0,
    killed: 138,
    killed_cum: 370,
    killed_children_cum: 78,
    killed_women_cum: 41,
    ext_killed: 138,
    ext_killed_cum: 370,
    ext_killed_children_cum: 78,
    ext_killed_women_cum: 41,
    injured_cum: 1788,
    ext_injured: 178,
    ext_injured_cum: 1788,
    ext_civdef_killed_cum: 0,
    ext_med_killed_cum: 6,
    press_killed_cum: 1,
    ext_press_killed_cum: 1,
  },
  // Add more sample data as needed
]

// Cache data for different datasets
let gazaCasualtyData = []
let westBankCasualtyData = []
let killedInGazaData = []
let pressKilledData = []
let infrastructureData = []
let currentDateIndex = 0

// Add a variable to track the current region (Gaza or West Bank)
let currentRegion = null

/**
 * Fetch all datasets
 * @returns {Promise<boolean>}
 */
async function fetchAllData() {
  try {
    await Promise.all([
      fetchGazaCasualtyData(),
      fetchWestBankCasualtyData(),
      fetchKilledInGazaData(),
      fetchPressKilledData(),
      fetchInfrastructureData(),
    ])
    return true
  } catch (error) {
    console.error("Error fetching all data:", error)
    return false
  }
}

/**
 * Fetch Gaza casualty data from API
 * @returns {Promise<Array>} Array of casualty data objects
 */
async function fetchGazaCasualtyData() {
  try {
    const response = await fetch(GAZA_CASUALTIES_API_URL)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    gazaCasualtyData = data
    return data
  } catch (error) {
    console.error("Error fetching Gaza casualty data:", error)
    // Use sample data as fallback
    gazaCasualtyData = SAMPLE_DATA
    return SAMPLE_DATA
  }
}

/**
 * Fetch West Bank casualty data from API
 * @returns {Promise<Array>} Array of casualty data objects
 */
async function fetchWestBankCasualtyData() {
  try {
    const response = await fetch(WEST_BANK_CASUALTIES_API_URL)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    westBankCasualtyData = data
    return data
  } catch (error) {
    console.error("Error fetching West Bank casualty data:", error)
    // Use empty array as fallback
    westBankCasualtyData = []
    return []
  }
}

/**
 * Fetch killed in Gaza data from API
 * @returns {Promise<Array>} Array of people killed in Gaza
 */
async function fetchKilledInGazaData() {
  try {
    const response = await fetch(KILLED_IN_GAZA_API_URL)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    killedInGazaData = data
    return data
  } catch (error) {
    console.error("Error fetching killed in Gaza data:", error)
    // Use empty array as fallback
    killedInGazaData = []
    return []
  }
}

/**
 * Fetch press killed data from API
 * @returns {Promise<Array>} Array of journalists killed
 */
async function fetchPressKilledData() {
  try {
    const response = await fetch(PRESS_KILLED_API_URL)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    pressKilledData = data
    return data
  } catch (error) {
    console.error("Error fetching press killed data:", error)
    // Use empty array as fallback
    pressKilledData = []
    return []
  }
}

/**
 * Fetch infrastructure damage data from API
 * @returns {Promise<Array>} Array of infrastructure damage data
 */
async function fetchInfrastructureData() {
  try {
    const response = await fetch(INFRASTRUCTURE_API_URL)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    infrastructureData = data
    return data
  } catch (error) {
    console.error("Error fetching infrastructure data:", error)
    // Use empty array as fallback
    infrastructureData = []
    return []
  }
}

/**
 * Set the current region and reset date index
 * @param {string} region - 'gaza' or 'westbank'
 */
function setCurrentRegion(region) {
  if (region === "gaza" || region === "westbank") {
    currentRegion = region
    currentDateIndex = 0

    // Update URL parameters
    if (window.AppModule) {
      window.AppModule.updateUrlParams({ region })
    }

    return true
  }
  return false
}

/**
 * Get the current region
 * @returns {string} Current region ('gaza' or 'westbank')
 */
function getCurrentRegion() {
  return currentRegion
}

/**
 * Get the current casualty data based on selected region
 * @returns {Array} Casualty data for the current region
 */
function getCurrentCasualtyData() {
  return currentRegion === "gaza" ? gazaCasualtyData : westBankCasualtyData
}

/**
 * Get data for a specific date in the current region
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Object|null} Data object for the specified date or null if not found
 */
function getDataForDate(date) {
  if (!currentRegion) return null

  const data = getCurrentCasualtyData()
  return data.find((item) => item.report_date === date) || null
}

/**
 * Get infrastructure data for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Object|null} Infrastructure data for the specified date or null if not found
 */
function getInfrastructureForDate(date) {
  return infrastructureData.find((item) => item.report_date === date) || null
}

/**
 * Get names of people killed for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Array} Array of people killed on the specified date
 */
function getKilledForDate(date) {
  return killedInGazaData.filter((person) => person.date_of_death === date)
}

/**
 * Get names of journalists killed for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Array} Array of journalists killed on the specified date
 */
function getPressKilledForDate(date) {
  return pressKilledData.filter((person) => person.date_of_death === date)
}

/**
 * Get all available dates from the current region data
 * @returns {Array<string>} Array of dates in YYYY-MM-DD format
 */
function getAllDates() {
  if (!currentRegion) {
    // If no region is selected, return Gaza dates as default
    return gazaCasualtyData.map((item) => item.report_date)
  }

  const data = getCurrentCasualtyData()
  return data.map((item) => item.report_date)
}

/**
 * Get all available dates as objects with formatted display values
 * @returns {Array<Object>} Array of date objects with value and display properties
 */
function getAllDatesFormatted() {
  if (!currentRegion) {
    // If no region is selected, return Gaza dates as default
    return gazaCasualtyData.map((item) => ({
      value: item.report_date,
      display: formatDate(item.report_date),
    }))
  }

  const data = getCurrentCasualtyData()
  return data.map((item) => ({
    value: item.report_date,
    display: formatDate(item.report_date),
  }))
}

/**
 * Move to the next date in the dataset
 * @returns {string|null} The next date or null if at the end
 */
function getNextDate() {
  if (!currentRegion) return null

  const data = getCurrentCasualtyData()
  if (currentDateIndex < data.length - 1) {
    currentDateIndex++
    const newDate = data[currentDateIndex].report_date

    // Update URL parameters
    if (window.AppModule) {
      window.AppModule.updateUrlParams({ date: newDate })
    }

    return newDate
  }
  return null
}

/**
 * Move to the previous date in the dataset
 * @returns {string|null} The previous date or null if at the beginning
 */
function getPreviousDate() {
  if (!currentRegion) return null

  if (currentDateIndex > 0) {
    currentDateIndex--
    const newDate = getCurrentCasualtyData()[currentDateIndex].report_date

    // Update URL parameters
    if (window.AppModule) {
      window.AppModule.updateUrlParams({ date: newDate })
    }

    return newDate
  }
  return null
}

/**
 * Set the current date by string
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {boolean} True if date was found and set, false otherwise
 */
function setCurrentDateByString(dateString) {
  if (!currentRegion) return false

  const data = getCurrentCasualtyData()
  const index = data.findIndex((item) => item.report_date === dateString)

  if (index !== -1) {
    currentDateIndex = index
    return true
  }
  return false
}

/**
 * Set the current date by index
 * @param {number} index - Index in the current data array
 * @returns {string|null} The date that was set, or null if invalid index
 */
function setCurrentDateByIndex(index) {
  if (!currentRegion) return null

  const data = getCurrentCasualtyData()
  if (index >= 0 && index < data.length) {
    currentDateIndex = index
    const newDate = data[currentDateIndex].report_date

    // Update URL parameters
    if (window.AppModule) {
      window.AppModule.updateUrlParams({ date: newDate })
    }

    return newDate
  }
  return null
}

/**
 * Get the current date from the dataset
 * @returns {string} The current date
 */
function getCurrentDate() {
  if (!currentRegion) {
    // If no region is selected, return the first date from Gaza data
    return gazaCasualtyData[0]?.report_date || ""
  }

  const data = getCurrentCasualtyData()
  return data[currentDateIndex]?.report_date || ""
}

/**
 * Get the current date index
 * @returns {number} The current date index
 */
function getCurrentDateIndex() {
  return currentDateIndex
}

/**
 * Search names by query and filter type
 * @param {string} query - Search query
 * @param {string} type - Type of names to search ('all', 'press', 'children', 'women', 'medical')
 * @returns {Array} Filtered array of names
 */
function searchNames(query, type = "all") {
  let dataToSearch = killedInGazaData

  // Filter by type first
  if (type === "press") {
    dataToSearch = pressKilledData
  } else if (type === "children") {
    dataToSearch = killedInGazaData.filter((person) => person.age && Number.parseInt(person.age) < 18)
  } else if (type === "women") {
    dataToSearch = killedInGazaData.filter((person) => person.gender && person.gender.toLowerCase() === "female")
  } else if (type === "medical") {
    dataToSearch = killedInGazaData.filter(
      (person) =>
        (person.occupation && person.occupation.toLowerCase().includes("medical")) ||
        (person.occupation && person.occupation.toLowerCase().includes("doctor")) ||
        (person.occupation && person.occupation.toLowerCase().includes("nurse")),
    )
  }

  // Then filter by search query if provided
  if (!query) {
    return dataToSearch
  }

  const lowerQuery = query.toLowerCase()

  return dataToSearch.filter((item) => {
    // Check different fields based on the data structure
    if (type === "press") {
      return (
        (item.name && item.name.toLowerCase().includes(lowerQuery)) ||
        (item.media_organization && item.media_organization.toLowerCase().includes(lowerQuery))
      )
    } else {
      return (
        (item.name && item.name.toLowerCase().includes(lowerQuery)) ||
        (item.age && item.age.toString().includes(lowerQuery)) ||
        (item.governorate && item.governorate.toLowerCase().includes(lowerQuery))
      )
    }
  })
}

/**
 * Format date for display
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  const dateObj = new Date(date)
  const options = { year: "numeric", month: "long", day: "numeric" }
  return dateObj.toLocaleDateString("en-US", options)
}
