/**
 * Main application script for the War Data Visualization PWA
 */

// Update the initApp function to better handle loading states
const initApp = async () => {
  try {
    // Show global loading indicator first
    window.UIModule.showLoading()

    // Internationalization
    window.I18nModule.initI18n()

    // UI setup
    window.UIModule.initUI()

    // Handle root URL redirect
    handleRootRedirect()

    // Fetch all data
    const dataLoaded = await window.DataModule.fetchAllData()

    if (dataLoaded) {
      // Apply URL params to UI state
      parseUrlParams()

      // Hide all pages first
      document.querySelectorAll(".page").forEach((p) => {
        p.classList.remove("active")
      })

      // Render initial page (home, statistics, memorial, or infrastructure)
      await handleInitialPageLoad()

      // Wire up main tab clicks
      setupMainTabs()

      // Set up home page buttons
      setupHomeButtons()
    } else {
      console.error("Failed to load data")
      alert("Error loading data. Please try again later.")
    }
  } catch (error) {
    console.error("Error initializing app:", error)
    alert("Error loading data. Please try again later.")
  } finally {
    // Hide global loader
    window.UIModule.hideLoading()
  }
}

/**
 * Redirect root URL to home page
 */
const handleRootRedirect = () => {
  // Check if we're at the root URL with no parameters
  if (window.location.search === "") {
    // Redirect to home page
    const homeUrl = new URL(window.location)
    homeUrl.searchParams.set("page", "home")
    window.history.replaceState({}, "", homeUrl)
  }
}

/**
 * Set up home page buttons to navigate to other sections
 */
const setupHomeButtons = () => {
  document.querySelectorAll(".home-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetPage = btn.dataset.target
      if (targetPage) {
        // Find and click the corresponding main tab
        const tab = document.querySelector(`nav a[data-page="${targetPage}"]`)
        if (tab) {
          tab.click()
        }
      }
    })
  })
}

/**
 * Get cleaned parameters for a specific page
 */
const getCleanedParams = (page) => {
  // Only keep the page parameter when switching pages
  return { page }
}

// Update handleInitialPageLoad to be async and wait for data to load
const handleInitialPageLoad = async () => {
  const params = new URLSearchParams(window.location.search)
  const page = params.get("page") || "home"
  const pageNum = Number.parseInt(params.get("pageNum")) || 1

  // Activate the correct tab
  document.querySelectorAll("nav a").forEach((link) => {
    link.classList.toggle("active", link.dataset.page === page)
  })

  // Hide all pages first
  document.querySelectorAll(".page").forEach((p) => {
    p.classList.remove("active")
  })

  // Hide filters when on home page or contact page
  document.querySelector(".current-filters").style.display = page === "home" || page === "contact" ? "none" : ""

  // Show the appropriate page and load its data
  if (page === "memorial") {
    window.UIModule.showPageLoading("memorial")
    await window.UIModule.updateMemorialPage(pageNum)
    document.getElementById("memorial").classList.add("active")
  } else if (page === "infrastructure") {
    window.UIModule.showPageLoading("infrastructure")
    await window.UIModule.updateInfrastructurePage()
    document.getElementById("infrastructure").classList.add("active")
  } else if (page === "statistics") {
    window.UIModule.showPageLoading("statistics")
    // Don't auto-select a region, let the user choose
    if (!params.get("region")) {
      window.UIModule.showRegionPrompt()
    } else {
      await window.UIModule.updateStatisticsPage()
    }
    document.getElementById("statistics").classList.add("active")
  } else if (page === "contact") {
    document.getElementById("contact").classList.add("active")
  } else {
    document.getElementById("home").classList.add("active")
  }
}

/**
 * Parse URL parameters and update UI controls (tabs, region, filter, etc.)
 */
const parseUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const page = urlParams.get("page") || "home"

  if (page) {
    document.querySelectorAll("nav a").forEach((link) => {
      link.classList.toggle("active", link.dataset.page === page)
    })
  }

  // Show/hide current filters based on page
  if (page === "home" || page === "contact") {
    document.querySelector(".current-filters").style.display = "none"
  } else {
    document.querySelector(".current-filters").style.display = ""
  }

  // Region selector
  const region = urlParams.get("region")
  if (region) {
    window.DataModule.setCurrentRegion(region)
    document.querySelectorAll(".region-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.region === region)
    })
  }

  // Date picker
  const date = urlParams.get("date")
  if (date) window.DataModule.setCurrentDateByString(date)

  // Memorial filter
  const filter = urlParams.get("filter")
  if (filter) {
    window.UIModule.setMemorialFilter(filter)
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === filter)
    })
  }
}

/**
 * Update URL parameters without reloading the page
 * @param {Object} params - Key/value pairs to set (stringable)
 */
const updateUrlParams = (params) => {
  const url = new URL(window.location)
  Object.keys(params).forEach((key) => {
    if (params[key] != null && params[key] !== "") url.searchParams.set(key, params[key])
    else url.searchParams.delete(key)
  })
  window.history.pushState({}, "", url)
}

// Update setupMainTabs to handle async page loading
const setupMainTabs = () => {
  document.querySelectorAll("nav a").forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault()
      const target = link.dataset.page
      const params = getCleanedParams(target)
      updateUrlParams(params)

      // Activate nav link
      document.querySelectorAll("nav a").forEach((el) => el.classList.remove("active"))
      link.classList.add("active")

      // Hide all pages first
      document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"))

      // Show/Hide filters
      document.querySelector(".current-filters").style.display = target === "home" || target === "contact" ? "none" : ""

      // Update URL and render
      if (target === "memorial") {
        updateUrlParams({ page: "memorial", pageNum: 1 })
        window.UIModule.showPageLoading("memorial")
        await window.UIModule.updateMemorialPage(1)
        document.getElementById("memorial").classList.add("active")
      } else if (target === "infrastructure") {
        updateUrlParams({ page: "infrastructure" })
        window.UIModule.showPageLoading("infrastructure")
        await window.UIModule.updateInfrastructurePage()
        document.getElementById("infrastructure").classList.add("active")
      } else if (target === "statistics") {
        updateUrlParams({ page: "statistics" })
        window.UIModule.showPageLoading("statistics")
        // Don't auto-select a region, let the user choose
        window.UIModule.showRegionPrompt()
        document.getElementById("statistics").classList.add("active")
      } else if (target === "contact") {
        updateUrlParams({ page: "contact" })
        document.getElementById("contact").classList.add("active")
      } else {
        updateUrlParams({ page: "home" })
        document.getElementById("home").classList.add("active")
      }
    })
  })

  // Handle browser Back/Forward
  window.addEventListener("popstate", async () => {
    parseUrlParams()
    await handleInitialPageLoad()
  })
}

// Expose AppModule for URL updates
window.AppModule = {
  updateUrlParams,
}

// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", initApp)
