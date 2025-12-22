export const haptic = {
  light: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10)
    }
  },
  medium: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(20)
    }
  },
  heavy: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(30)
    }
  },
  success: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([10, 50, 10])
    }
  },
  error: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([20, 100, 20])
    }
  }
}

export const triggerHaptic = (type: "light" | "medium" | "heavy" | "success" | "error" = "light") => {
  if (typeof window === "undefined" || !("vibrate" in navigator)) {
    return
  }

  switch (type) {
    case "light":
      navigator.vibrate(10)
      break
    case "medium":
      navigator.vibrate(20)
      break
    case "heavy":
      navigator.vibrate(30)
      break
    case "success":
      navigator.vibrate([10, 50, 10])
      break
    case "error":
      navigator.vibrate([20, 100, 20])
      break
  }
}