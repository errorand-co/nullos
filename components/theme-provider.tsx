"use client"

import * as React from "react"

type Theme = "dark" | "light"

const ThemeContext = React.createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: "dark",
  setTheme: () => {},
})

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("dark")

  React.useEffect(() => {
    // Read initial theme from localStorage or system preference
    const stored = localStorage.getItem("theme") as Theme | null
    if (stored === "dark" || stored === "light") {
      setThemeState(stored)
    }
  }, [])

  React.useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  const setTheme = React.useCallback((t: Theme) => setThemeState(t), [])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export { ThemeProvider, ThemeContext }