import { useTheme } from "next-themes";
import { useRef } from "react";

export function useThemeAnimation() {
    const { theme, setTheme } = useTheme();
    const buttonRef = useRef<HTMLButtonElement>(null);

    const toggleThemeWithAnimation = () => {
        const newTheme = theme === "dark" ? "light" : "dark";

        // Get button position for animation origin
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            // Calculate the maximum distance to cover the entire screen
            const maxDistance = Math.hypot(
                Math.max(x, window.innerWidth - x),
                Math.max(y, window.innerHeight - y)
            );

            // Create the animation overlay
            const overlay = document.createElement("div");
            overlay.style.position = "fixed";
            overlay.style.top = "0";
            overlay.style.left = "0";
            overlay.style.width = "100%";
            overlay.style.height = "100%";
            overlay.style.pointerEvents = "none";
            overlay.style.zIndex = "9999";
            overlay.style.overflow = "hidden";

            // Create the expanding circle
            const circle = document.createElement("div");
            circle.style.position = "absolute";
            circle.style.left = `${x}px`;
            circle.style.top = `${y}px`;
            circle.style.width = "0";
            circle.style.height = "0";
            circle.style.borderRadius = "50%";
            circle.style.transform = "translate(-50%, -50%)";
            circle.style.backgroundColor = newTheme === "dark" ? "#0a0a0a" : "#ffffff";
            circle.style.transition = "width 0.6s cubic-bezier(0.4, 0, 0.2, 1), height 0.6s cubic-bezier(0.4, 0, 0.2, 1)";

            overlay.appendChild(circle);
            document.body.appendChild(overlay);

            // Trigger animation
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const size = maxDistance * 2;
                    circle.style.width = `${size}px`;
                    circle.style.height = `${size}px`;
                });
            });

            // Change theme after a short delay to sync with animation
            setTimeout(() => {
                setTheme(newTheme);
            }, 100);

            // Remove overlay after animation completes
            setTimeout(() => {
                overlay.remove();
            }, 650);
        } else {
            // Fallback if ref is not available
            setTheme(newTheme);
        }
    };

    return { theme, toggleThemeWithAnimation, buttonRef };
}
