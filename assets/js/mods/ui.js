// import { Chart } from "@/components/ui/chart"
// ui.js

/**
 * UI handling module for the War Data Visualization PWA
 */

// Add chart instances for different visualizations
let casualtiesChart = null
let infrastructureChart = null

// Memorial pagination & search globals
let currentMemorialFilter = "all"
let currentSearchQuery = ""
let currentPage = 1
const pageSize = 24

// Add variable to track loading states
let isLoadingMemorial = false
let isLoadingInfrastructure = false
let isLoadingStatistics = false

// Add last updated timestamp
let lastUpdatedTimestamp = null

/**
 * Initialize the UI components
 */
function initUI() {
  // Set up navigation
  setupNavigation()

  // Set up theme toggle
  setupThemeToggle()

  // Set up date navigation
  setupDateNavigation()

  // Set up region selector
  setupRegionSelector()

  // Set up memorial filters
  setupMemorialFilters()

  // Set up search functionality
  setupSearch()

  // Set up date picker
  setupDatePicker()

  // Set up contact form
  setupContactForm()

  // Check for offline status
  setupOfflineDetection()
}

/**
 * Set up navigation between pages
 */
const setupNavigation = () => {
  const navLinks = document.querySelectorAll("nav a")
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const targetPage = link.getAttribute("data-page")
      navLinks.forEach((l) => l.classList.remove("active"))
      link.classList.add("active")

      // Update URL params
      if (window.AppModule) window.AppModule.updateUrlParams({ page: targetPage })

      // Show/hide current filters based on page
      if (targetPage === "home" || targetPage === "contact") {
        document.querySelector(".current-filters").style.display = "none"
      } else {
        document.querySelector(".current-filters").style.display = ""
      }

      // Hide all pages first
      document.querySelectorAll(".page").forEach((page) => {
        page.classList.remove("active")
      })

      // Load appropriate page content
      if (targetPage === "statistics") {
        showPageLoading("statistics")
        showRegionPrompt()
        document.getElementById("statistics").classList.add("active")
      } else if (targetPage === "memorial") {
        showPageLoading("memorial")
        updateMemorialPage()
        document.getElementById("memorial").classList.add("active")
      } else if (targetPage === "infrastructure") {
        showPageLoading("infrastructure")
        updateInfrastructurePage()
        document.getElementById("infrastructure").classList.add("active")
      } else if (targetPage === "contact") {
        document.getElementById("contact").classList.add("active")
      } else {
        document.getElementById("home").classList.add("active")
      }
    })
  })
}

/**
 * Set up theme toggle functionality
 */
function setupThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle")

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme")
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme)
  } else {
    // Check for system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light")
  }

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme")
    const newTheme = currentTheme === "dark" ? "light" : "dark"

    document.documentElement.setAttribute("data-theme", newTheme)
    localStorage.setItem("theme", newTheme)
  })
}

/**
 * Set up date navigation
 */
function setupDateNavigation() {
  const prevDateBtn = document.getElementById("prev-date")
  const nextDateBtn = document.getElementById("next-date")

  prevDateBtn.addEventListener("click", () => {
    const prevDate = window.DataModule.getPreviousDate()
    if (prevDate) {
      updateStatisticsPage()
      updateDateFilterDisplay()
    }
  })

  nextDateBtn.addEventListener("click", () => {
    const nextDate = window.DataModule.getNextDate()
    if (nextDate) {
      updateStatisticsPage()
      updateDateFilterDisplay()
    }
  })

  // Set up infrastructure date navigation
  const infraPrevDateBtn = document.getElementById("infra-prev-date")
  const infraNextDateBtn = document.getElementById("infra-next-date")

  if (infraPrevDateBtn && infraNextDateBtn) {
    infraPrevDateBtn.addEventListener("click", () => {
      const prevDate = window.DataModule.getPreviousDate()
      if (prevDate) {
        showPageLoading("infrastructure")
        updateInfrastructurePage()
        updateDateFilterDisplay()
      }
    })

    infraNextDateBtn.addEventListener("click", () => {
      const nextDate = window.DataModule.getNextDate()
      if (nextDate) {
        showPageLoading("infrastructure")
        updateInfrastructurePage()
        updateDateFilterDisplay()
      }
    })
  }

  // Set up memorial date navigation
  const memorialPrevDateBtn = document.getElementById("memorial-prev-date")
  const memorialNextDateBtn = document.getElementById("memorial-next-date")

  if (memorialPrevDateBtn && memorialNextDateBtn) {
    memorialPrevDateBtn.addEventListener("click", () => {
      const prevDate = window.DataModule.getPreviousDate()
      if (prevDate) {
        showPageLoading("memorial")
        updateMemorialPage()
        updateDateFilterDisplay()
      }
    })

    memorialNextDateBtn.addEventListener("click", () => {
      const nextDate = window.DataModule.getNextDate()
      if (nextDate) {
        showPageLoading("memorial")
        updateMemorialPage()
        updateDateFilterDisplay()
      }
    })
  }
}

/**
 * Set up date picker
 */
function setupDatePicker() {
  const dateSelects = document.querySelectorAll(".date-select")

  dateSelects.forEach((dateSelect) => {
    if (dateSelect) {
      // Populate date select
      populateDateSelect(dateSelect)

      // Add event listener
      dateSelect.addEventListener("change", (e) => {
        const selectedDate = e.target.value
        if (selectedDate) {
          window.DataModule.setCurrentDateByString(selectedDate)

          // Update all pages that use date
          const currentPage = document.querySelector(".page.active").id

          if (currentPage === "statistics") {
            updateStatisticsPage()
          } else if (currentPage === "memorial") {
            updateMemorialPage()
          } else if (currentPage === "infrastructure") {
            updateInfrastructurePage()
          }

          // Update all date selects
          updateAllDateSelects(selectedDate)
        }
      })
    }
  })
}

/**
 * Update all date select dropdowns with the same value
 * @param {string} date - Selected date
 */
function updateAllDateSelects(date) {
  const dateSelects = document.querySelectorAll(".date-select")
  dateSelects.forEach((select) => {
    select.value = date
  })
}

/**
 * Populate a date select dropdown with all available dates
 * @param {HTMLSelectElement} selectElement - The select element to populate
 */
function populateDateSelect(selectElement) {
  // Clear existing options
  selectElement.innerHTML = ""

  // Get all dates
  const dates = window.DataModule.getAllDatesFormatted()

  // Add options
  dates.forEach((date, index) => {
    const option = document.createElement("option")
    option.value = date.value
    option.textContent = date.display
    selectElement.appendChild(option)
  })

  // Set current date as selected
  const currentDate = window.DataModule.getCurrentDate()
  if (currentDate) {
    selectElement.value = currentDate
  }
}

/**
 * Update the date filter display to match the current date
 */
function updateDateFilterDisplay() {
  const dateSelects = document.querySelectorAll(".date-select")
  const currentDate = window.DataModule.getCurrentDate()

  dateSelects.forEach((dateSelect) => {
    if (dateSelect && currentDate) {
      dateSelect.value = currentDate
    }
  })

  // Update date display elements
  const dateDisplays = document.querySelectorAll(".current-date")
  dateDisplays.forEach((display) => {
    if (display && currentDate) {
      display.textContent = window.DataModule.formatDate(currentDate, window.I18nModule.currentLanguage)
    }
  })

  // Update date in filter display
  const dateDisplay = document.getElementById("current-date-display")
  if (dateDisplay && currentDate) {
    dateDisplay.textContent = window.DataModule.formatDate(currentDate, window.I18nModule.currentLanguage)
  }
}

/**
 * Show region selection prompt
 */
function showRegionPrompt() {
  const statsContent = document.querySelector(".stats-content")
  const regionPrompt = document.querySelector(".region-prompt")

  if (statsContent && regionPrompt) {
    statsContent.style.display = "none"
    regionPrompt.style.display = "flex"

    // Clear any active region
    document.querySelectorAll(".region-btn").forEach((btn) => {
      btn.classList.remove("active")
    })
  }
}

/**
 * Hide region selection prompt
 */
function hideRegionPrompt() {
  const statsContent = document.querySelector(".stats-content")
  const regionPrompt = document.querySelector(".region-prompt")

  if (statsContent && regionPrompt) {
    statsContent.style.display = ""
    regionPrompt.style.display = "none"
  }
}

/**
 * Set up region selector functionality
 */
function setupRegionSelector() {
  const regionButtons = document.querySelectorAll(".region-btn")

  regionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const region = button.getAttribute("data-region")

      // Update active button
      regionButtons.forEach((btn) => btn.classList.remove("active"))
      button.classList.add("active")

      // Set current region and update UI
      if (window.DataModule.setCurrentRegion(region)) {
        // Update date select options after region change
        const dateSelects = document.querySelectorAll(".date-select")
        dateSelects.forEach((dateSelect) => {
          populateDateSelect(dateSelect)
        })

        // Hide region prompt if it's visible
        hideRegionPrompt()

        // Update statistics page
        updateStatisticsPage()
      }
    })
  })
}

/**
 * Set up memorial filters (resets search & pagination)
 */
function setupMemorialFilters() {
  const buttons = document.querySelectorAll(".filter-btn")
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentSearchQuery = ""
      document.getElementById("search-names").value = ""
      buttons.forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
      currentMemorialFilter = btn.getAttribute("data-filter")
      updateMemorialPage(1)
      if (window.AppModule)
        window.AppModule.updateUrlParams({
          filter: currentMemorialFilter,
        })
    })
  })
}

/**
 * Set the current memorial filter
 * @param {string} filter - Filter type ('all', 'press')
 */
function setMemorialFilter(filter) {
  const validFilters = ["all", "press", "children", "women", "medical"]
  if (validFilters.includes(filter)) {
    currentMemorialFilter = filter
    return true
  }
  return false
}

/**
 * Set up search functionality for memorial page with pagination reset
 */
function setupSearch() {
  const input = document.getElementById("search-names")
  if (!input) return
  input.addEventListener("input", (e) => {
    currentSearchQuery = e.target.value.trim()
    updateMemorialPage(1)
  })
}

/**
 * Set up contact form
 */
function setupContactForm() {
  const contactForm = document.getElementById("contact-form")
  if (!contactForm) return

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault()

    // Get form data
    const name = document.getElementById("contact-name").value
    const email = document.getElementById("contact-email").value
    const message = document.getElementById("contact-message").value

    // Simple validation
    if (!name || !email || !message) {
      alert("Please fill in all fields")
      return
    }

    // Show success message (in a real app, you would send this data to a server)
    const successMessage = document.getElementById("contact-success")
    contactForm.reset()
    successMessage.style.display = "block"

    // Hide success message after 5 seconds
    setTimeout(() => {
      successMessage.style.display = "none"
    }, 5000)
  })
}

/**
 * Set up offline detection
 */
function setupOfflineDetection() {
  const offlineMessage = document.getElementById("offline-message")

  function updateOnlineStatus() {
    if (navigator.onLine) {
      offlineMessage.classList.add("hidden")
    } else {
      offlineMessage.classList.remove("hidden")
    }
  }

  window.addEventListener("online", updateOnlineStatus)
  window.addEventListener("offline", updateOnlineStatus)

  // Initial check
  updateOnlineStatus()
}

/**
 * Show loading indicator for the main app
 */
function showLoading() {
  const loadingElement = document.getElementById("loading")
  if (loadingElement) {
    loadingElement.style.display = "flex"
  }
}

/**
 * Hide loading indicator for the main app
 */
function hideLoading() {
  const loadingElement = document.getElementById("loading")
  if (loadingElement) {
    loadingElement.style.display = "none"
  }
}

/**
 * Show loading indicator for a specific page
 * @param {string} page - Page ID ('memorial', 'infrastructure', 'statistics')
 */
function showPageLoading(page) {
  // Create statistics loading element if it doesn't exist
  if (page === "statistics" && !document.getElementById("statistics-loading")) {
    const loadingElement = document.createElement("div")
    loadingElement.id = "statistics-loading"
    loadingElement.className = "page-loading"
    loadingElement.innerHTML = `
      <div class="spinner"></div>
      <p data-i18n="loading_statistics">Loading statistics data...</p>
    `
    document.getElementById("statistics").prepend(loadingElement)
  }

  const loadingElement = document.getElementById(`${page}-loading`)
  if (loadingElement) {
    loadingElement.style.display = "flex"
  }

  if (page === "memorial") {
    isLoadingMemorial = true
  } else if (page === "infrastructure") {
    isLoadingInfrastructure = true
  } else if (page === "statistics") {
    isLoadingStatistics = true
  }
}

/**
 * Hide loading indicator for a specific page
 * @param {string} page - Page ID ('memorial', 'infrastructure', 'statistics')
 */
function hidePageLoading(page) {
  const loadingElement = document.getElementById(`${page}-loading`)
  if (loadingElement) {
    loadingElement.style.display = "none"
  }

  if (page === "memorial") {
    isLoadingMemorial = false
  } else if (page === "infrastructure") {
    isLoadingInfrastructure = false
  } else if (page === "statistics") {
    isLoadingStatistics = false
  }
}

/**
 * Update the statistics page with current data
 * @returns {Promise<boolean>} True if successful
 */
async function updateStatisticsPage() {
  showPageLoading("statistics")

  // Add a small delay to ensure loading indicator is shown
  await new Promise((resolve) => setTimeout(resolve, 100))

  const currentDate = window.DataModule.getCurrentDate()
  const data = window.DataModule.getDataForDate(currentDate)

  if (!data) {
    hidePageLoading("statistics")
    return false
  }

  // Update date display
  const currentDateElements = document.querySelectorAll(".current-date")
  currentDateElements.forEach((element) => {
    if (element) {
      element.textContent = window.DataModule.formatDate(currentDate, window.I18nModule.currentLanguage)
    }
  })

  // Update statistics cards based on the data structure
  // The field names might differ between Gaza and West Bank data
  if (window.DataModule.getCurrentRegion() === "gaza") {
    updateStatElement("total-casualties", data.killed_cum || 0)
    updateStatElement("children-casualties", data.ext_killed_children_cum || 0)
    updateStatElement("women-casualties", data.ext_killed_women_cum || 0)
    updateStatElement("medical-casualties", data.ext_med_killed_cum || 0)
    updateStatElement("press-casualties", data.ext_press_killed_cum || 0)
    updateStatElement("injured", data.ext_injured_cum || 0)
  } else {
    // West Bank data might have different field names
    updateStatElement("total-casualties", data.killed_cum || 0)
    updateStatElement("children-casualties", data.killed_children_cum || 0)
    updateStatElement("women-casualties", data.killed_women_cum || 0)
    updateStatElement("medical-casualties", data.med_killed_cum || 0)
    updateStatElement("press-casualties", data.press_killed_cum || 0)
    updateStatElement("injured", data.injured_cum || 0)
  }

  // Update last updated timestamp
  lastUpdatedTimestamp = new Date().toISOString()
  updateLastUpdatedDisplay()

  // Update chart
  await updateCasualtiesChart()

  // Update filter display
  updateFilterDisplay()

  hidePageLoading("statistics")
  return true
}

/**
 * Update the filter display to show current selections
 */
function updateFilterDisplay() {
  const currentRegion = window.DataModule.getCurrentRegion()
  const currentDate = window.DataModule.getCurrentDate()

  // Update region display
  const regionDisplay = document.getElementById("current-region-display")
  if (regionDisplay) {
    regionDisplay.textContent = window.I18nModule.getTranslation(
      currentRegion === "gaza" ? "gaza_region" : "westbank_region",
    )
  }

  // Update date display
  const dateDisplay = document.getElementById("current-date-display")
  if (dateDisplay) {
    dateDisplay.textContent = window.DataModule.formatDate(currentDate, window.I18nModule.currentLanguage)
  }
}

/**
 * Update the last updated timestamp display in the footer
 */
function updateLastUpdatedDisplay() {
  const lastUpdatedElement = document.getElementById("last-updated")
  if (lastUpdatedElement && lastUpdatedTimestamp) {
    const formattedDate = new Date(lastUpdatedTimestamp).toLocaleString(window.I18nModule.currentLanguage, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    lastUpdatedElement.textContent = formattedDate
  }
}

/**
 * Helper function to safely update stat elements
 * @param {string} id - Element ID
 * @param {number|string} value - Value to set
 */
function updateStatElement(id, value) {
  const element = document.getElementById(id)
  if (element) {
    element.textContent = value
  }
}

/**
 * Update the casualties chart
 * @returns {Promise<boolean>} True if successful
 */
async function updateCasualtiesChart() {
  const chartCanvas = document.getElementById("casualties-chart")
  if (!chartCanvas) return false

  const ctx = chartCanvas.getContext("2d")
  if (!ctx) return false

  const dates = window.DataModule.getAllDates()
  if (!dates || dates.length === 0) return false

  try {
    // Prepare data for chart
    const chartData = {
      labels: dates.map((date) => window.DataModule.formatDate(date, window.I18nModule.currentLanguage)),
      datasets: [
        {
          label: window.I18nModule.getTranslation("total_casualties"),
          data: dates.map((date) => {
            const data = window.DataModule.getDataForDate(date)
            return data ? data.killed_cum : 0
          }),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: window.I18nModule.getTranslation("injured"),
          data: dates.map((date) => {
            const data = window.DataModule.getDataForDate(date)
            return data ? data.ext_injured_cum || data.injured_cum : 0
          }),
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    }

    // Destroy previous chart if it exists
    if (casualtiesChart) {
      casualtiesChart.destroy()
    }

    // Make sure Chart is the global Chart.js object
    if (typeof Chart === "function") {
      // Create new chart using the global Chart object from Chart.js
      casualtiesChart = new Chart(ctx, {
        type: "line",
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: "rgba(0, 0, 0, 0.05)",
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
        },
      })
    } else {
      console.error("Chart.js is not loaded properly. The Chart constructor is not available.")
    }
  } catch (error) {
    console.error("Error creating casualties chart:", error)
    return false
  }

  return true
}

/**
 * Update the memorial page with current data (paginated)
 * @param {number} page - Page number
 * @returns {Promise<boolean>} True if successful
 */
async function updateMemorialPage(page = 1) {
  showPageLoading("memorial")

  // Add a small delay to ensure loading indicator is shown
  await new Promise((resolve) => setTimeout(resolve, 100))

  currentPage = page

  // Get filtered and searched names
  const allNames = window.DataModule.searchNames(currentSearchQuery, currentMemorialFilter)
  const totalCount = allNames.length

  // Slice for current page
  const start = (currentPage - 1) * pageSize
  const pagedNames = allNames.slice(start, start + pageSize)

  renderMemorialGrid(pagedNames, totalCount)
  hidePageLoading("memorial")
  return true
}

/**
 * Render the memorial grid with the provided names and pagination
 * @param {Array} names - Array of names to display
 * @param {number} totalCount - Total count of names
 */
function renderMemorialGrid(names, totalCount) {
  const memorialGrid = document.getElementById("memorial-grid")
  if (!memorialGrid) return

  memorialGrid.innerHTML = ""
  if (!names || names.length === 0) {
    memorialGrid.innerHTML = `<div class="no-results">${window.I18nModule.getTranslation("no_results")}</div>`
    return
  }

  names.forEach((person) => {
    const card = document.createElement("div")
    card.className = "memorial-card"

    // Different card content based on filter type
    if (currentMemorialFilter === "press") {
      card.innerHTML = `
        <h3>${person.name || "Unknown"}</h3>
        <div class="details">
          ${person.media_organization ? `<p>${person.media_organization}</p>` : ""}
          ${
            person.date_of_death
              ? `<div class="date">${window.DataModule.formatDate(
                  person.date_of_death,
                  window.I18nModule.currentLanguage,
                )}</div>`
              : ""
          }
        </div>
        <span class="tag">${window.I18nModule.getTranslation("journalists")}</span>
      `
    } else if (currentMemorialFilter === "children") {
      card.innerHTML = `
        <h3>${person.name || "Unknown"}</h3>
        <div class="details">
          ${person.age ? `<p>${window.I18nModule.getTranslation("age")}: ${person.age}</p>` : ""}
          ${person.governorate ? `<p>${window.I18nModule.getTranslation("location")}: ${person.governorate}</p>` : ""}
          ${
            person.date_of_death
              ? `<div class="date">${window.DataModule.formatDate(
                  person.date_of_death,
                  window.I18nModule.currentLanguage,
                )}</div>`
              : ""
          }
        </div>
        <span class="tag">${window.I18nModule.getTranslation("children")}</span>
      `
    } else if (currentMemorialFilter === "women") {
      card.innerHTML = `
        <h3>${person.name || "Unknown"}</h3>
        <div class="details">
          ${person.age ? `<p>${window.I18nModule.getTranslation("age")}: ${person.age}</p>` : ""}
          ${person.governorate ? `<p>${window.I18nModule.getTranslation("location")}: ${person.governorate}</p>` : ""}
          ${
            person.date_of_death
              ? `<div class="date">${window.DataModule.formatDate(
                  person.date_of_death,
                  window.I18nModule.currentLanguage,
                )}</div>`
              : ""
          }
        </div>
        <span class="tag">${window.I18nModule.getTranslation("women")}</span>
      `
    } else if (currentMemorialFilter === "medical") {
      card.innerHTML = `
        <h3>${person.name || "Unknown"}</h3>
        <div class="details">
          ${person.age ? `<p>${window.I18nModule.getTranslation("age")}: ${person.age}</p>` : ""}
          ${person.governorate ? `<p>${window.I18nModule.getTranslation("location")}: ${person.governorate}</p>` : ""}
          ${
            person.date_of_death
              ? `<div class="date">${window.DataModule.formatDate(
                  person.date_of_death,
                  window.I18nModule.currentLanguage,
                )}</div>`
              : ""
          }
        </div>
        <span class="tag">${window.I18nModule.getTranslation("medical_personnel")}</span>
      `
    } else {
      card.innerHTML = `
        <h3>${person.name || "Unknown"}</h3>
        <div class="details">
          ${person.age ? `<p>${window.I18nModule.getTranslation("age")}: ${person.age}</p>` : ""}
          ${person.governorate ? `<p>${window.I18nModule.getTranslation("location")}: ${person.governorate}</p>` : ""}
          ${
            person.date_of_death
              ? `<div class="date">${window.DataModule.formatDate(
                  person.date_of_death,
                  window.I18nModule.currentLanguage,
                )}</div>`
              : ""
          }
        </div>
      `
    }
    memorialGrid.appendChild(card)
  })

  renderPaginationControls(totalCount)
}

/**
 * Update the infrastructure page
 * @returns {Promise<boolean>} True if successful
 */
async function updateInfrastructurePage() {
  showPageLoading("infrastructure")

  // Add a small delay to ensure loading indicator is shown
  await new Promise((resolve) => setTimeout(resolve, 100))

  const currentDate = window.DataModule.getCurrentDate()
  const data = window.DataModule.getInfrastructureForDate(currentDate)

  // Update date display
  const infraCurrentDateElements = document.querySelectorAll(".infra-current-date")
  infraCurrentDateElements.forEach((element) => {
    if (element) {
      element.textContent = window.DataModule.formatDate(currentDate, window.I18nModule.currentLanguage)
    }
  })

  // Render infrastructure grid
  renderInfrastructureGrid(data)

  // Update infrastructure chart
  await updateInfrastructureChart()

  // Update last updated timestamp
  lastUpdatedTimestamp = new Date().toISOString()
  updateLastUpdatedDisplay()

  hidePageLoading("infrastructure")
  return true
}

/**
 * Render the infrastructure grid with the provided data
 * @param {Object} data - Infrastructure data object
 */
function renderInfrastructureGrid(data) {
  const infraGrid = document.querySelector(".infra-grid")
  if (!infraGrid) return

  // Clear existing content
  infraGrid.innerHTML = ""

  if (!data) {
    infraGrid.innerHTML = `<div class="no-results">${window.I18nModule.getTranslation("no_results")}</div>`
    return
  }

  // Create cards for infrastructure data based on the actual structure
  const cards = []

  // Civic buildings
  if (data.civic_buildings) {
    cards.push({
      label: "civic_buildings",
      value: data.civic_buildings.ext_destroyed || 0,
      description: "destroyed",
    })
  }

  // Educational buildings
  if (data.educational_buildings) {
    cards.push({
      label: "schools",
      value: data.educational_buildings.ext_destroyed || 0,
      description: "destroyed",
    })
    cards.push({
      label: "schools",
      value: data.educational_buildings.ext_damaged || 0,
      description: "damaged",
    })
  }

  // Places of worship
  if (data.places_of_worship) {
    cards.push({
      label: "mosques",
      value: data.places_of_worship.ext_mosques_destroyed || 0,
      description: "destroyed",
    })
    cards.push({
      label: "mosques",
      value: data.places_of_worship.ext_mosques_damaged || 0,
      description: "damaged",
    })
    cards.push({
      label: "churches",
      value: data.places_of_worship.ext_churches_destroyed || 0,
      description: "destroyed",
    })
  }

  // Residential buildings
  if (data.residential) {
    cards.push({
      label: "residential",
      value: data.residential.ext_destroyed || data.residential.destroyed || 0,
      description: "destroyed",
    })
  }

  // Render cards
  cards.forEach((card) => {
    const cardElement = document.createElement("div")
    cardElement.className = "infra-card"

    cardElement.innerHTML = `
      <h3>${window.I18nModule.getTranslation(card.label)}</h3>
      <div class="infra-value">${card.value}</div>
      <div class="infra-description">${window.I18nModule.getTranslation(card.description)}</div>
    `

    infraGrid.appendChild(cardElement)
  })
}

/**
 * Update the infrastructure chart
 * @returns {Promise<boolean>} True if successful
 */
async function updateInfrastructureChart() {
  const chartCanvas = document.getElementById("infrastructure-chart")
  if (!chartCanvas) return false

  const ctx = chartCanvas.getContext("2d")
  if (!ctx) return false

  const dates = window.DataModule.getAllDates()
  if (!dates || dates.length === 0) return false

  try {
    // Prepare data for chart based on the actual structure
    const chartData = {
      labels: dates.map((date) => window.DataModule.formatDate(date, window.I18nModule.currentLanguage)),
      datasets: [
        {
          label: window.I18nModule.getTranslation("residential"),
          data: dates.map((date) => {
            const data = window.DataModule.getInfrastructureForDate(date)
            return data && data.residential ? data.residential.ext_destroyed || data.residential.destroyed || 0 : 0
          }),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
        },
        {
          label: window.I18nModule.getTranslation("schools"),
          data: dates.map((date) => {
            const data = window.DataModule.getInfrastructureForDate(date)
            return data && data.educational_buildings ? data.educational_buildings.ext_destroyed || 0 : 0
          }),
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.4,
        },
        {
          label: window.I18nModule.getTranslation("mosques"),
          data: dates.map((date) => {
            const data = window.DataModule.getInfrastructureForDate(date)
            return data && data.places_of_worship ? data.places_of_worship.ext_mosques_destroyed || 0 : 0
          }),
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
        },
      ],
    }

    // Destroy previous chart if it exists
    if (infrastructureChart) {
      infrastructureChart.destroy()
    }

    // Make sure Chart is the global Chart.js object
    if (typeof Chart === "function") {
      // Create new chart using the global Chart object from Chart.js
      infrastructureChart = new Chart(ctx, {
        type: "line",
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: "rgba(0, 0, 0, 0.05)",
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
        },
      })
    } else {
      console.error("Chart.js is not loaded properly. The Chart constructor is not available.")
    }
  } catch (error) {
    console.error("Error creating infrastructure chart:", error)
    return false
  }

  return true
}

/**
 * Render pagination controls beneath the memorial grid
 * @param {number} totalCount - Total count of items
 */
function renderPaginationControls(totalCount) {
  const totalPages = Math.ceil(totalCount / pageSize)
  const container = document.createElement("div")
  container.className = "pagination"

  const makeBtn = (text, page, disabled = false, active = false) => {
    const btn = document.createElement("button")
    btn.textContent = text
    btn.disabled = disabled
    btn.className = active ? "pagination-btn active" : "pagination-btn"
    btn.addEventListener("click", () => updateMemorialPage(page))
    return btn
  }

  // Add total count display
  const totalCountDisplay = document.createElement("div")
  totalCountDisplay.className = "pagination-total"
  totalCountDisplay.textContent = `${window.I18nModule.getTranslation("total")}: ${totalCount}`
  container.appendChild(totalCountDisplay)

  // Add pagination buttons
  container.appendChild(makeBtn("«", currentPage - 1, currentPage === 1))
  container.appendChild(
    makeBtn(`${window.I18nModule.getTranslation("page")} ${currentPage}/${totalPages}`, currentPage, true, true),
  )
  container.appendChild(makeBtn("»", currentPage + 1, currentPage === totalPages))

  const pagerSlot = document.getElementById("memorial-pagination")
  pagerSlot.innerHTML = "" // clear any old controls
  pagerSlot.appendChild(container) // place new ones
}

// Update the UI module exports
window.UIModule = {
  initUI,
  showLoading,
  hideLoading,
  showPageLoading,
  hidePageLoading,
  updateStatisticsPage,
  updateMemorialPage,
  updateInfrastructurePage,
  setMemorialFilter,
  updateDateFilterDisplay,
  showRegionPrompt,
  hideRegionPrompt,
}
