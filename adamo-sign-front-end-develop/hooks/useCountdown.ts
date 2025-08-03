import { useState, useEffect } from "react";

/**
 * Custom hook to manage a countdown timer with expiration status.
 *
 * @param {number} initialTime - The initial countdown time in seconds.
 * @returns {Object} - An object containing the following properties:
 *
 * - `formattedTime` (string): The countdown timer formatted as "MM:SS".
 * - `isExpired` (boolean): A flag indicating whether the countdown has reached zero.
 * - `setTimer` (function): A function to manually reset or adjust the timer.
 */

export function useCountdown(initialTime: number) {
  const [timer, setTimer] = useState(initialTime);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Reset isExpired when timer is reset
    if (timer > 0) {
      setIsExpired(false);
    }

    if (timer <= 0) {
      setIsExpired(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const formattedTime = `${Math.floor(timer / 60)
    .toString()
    .padStart(2, "0")}:${(timer % 60).toString().padStart(2, "0")}`;

  return { formattedTime, isExpired, setTimer };
}
