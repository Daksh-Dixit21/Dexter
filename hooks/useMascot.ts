"use client";

import { useReducer, useEffect, useCallback, useRef } from "react";
import { mascotReducer, initialMascotState } from "@/lib/mascot/machine";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Mood } from "@/lib/constants";

export function useMascot() {
  const [state, dispatch] = useReducer(mascotReducer, initialMascotState);
  const [savedStreak, setSavedStreak] = useLocalStorage("dexter.streak", 0);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const keystrokeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const petCooldownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (state.streak > savedStreak) {
      setSavedStreak(state.streak);
    }
    if (state.streak === 0 && savedStreak > 0) {
      dispatch({ type: "STREAK_5" });
    }
  }, [state.streak, savedStreak, setSavedStreak]);

  useEffect(() => {
    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => {
        dispatch({ type: "INACTIVE_5MIN" });
      }, 5 * 60 * 1000);
    };

    const handleActivity = () => {
      dispatch({ type: "INTERACTION" });
      resetInactivityTimer();
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("touchstart", handleActivity);

    resetInactivityTimer();

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeydown = () => {
      dispatch({ type: "KEYSTROKE" });

      if (keystrokeTimerRef.current) clearTimeout(keystrokeTimerRef.current);
      keystrokeTimerRef.current = setTimeout(() => {
        dispatch({ type: "IDLE_30SEC" });
      }, 30000);
    };

    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
      if (keystrokeTimerRef.current) clearTimeout(keystrokeTimerRef.current);
    };
  }, []);

  const triggerClick = useCallback(() => dispatch({ type: "CLICK" }), []);
  const triggerPet = useCallback(() => {
    if (petCooldownRef.current) return;
    dispatch({ type: "PET" });
    petCooldownRef.current = setTimeout(() => {
      petCooldownRef.current = null;
    }, 2000);
  }, []);
  const triggerTaskComplete = useCallback(() => dispatch({ type: "TASK_COMPLETE" }), []);
  const triggerDeployStart = useCallback(() => dispatch({ type: "DEPLOY_START" }), []);
  const triggerDeploySuccess = useCallback(() => dispatch({ type: "DEPLOY_SUCCESS" }), []);
  const triggerDeployFailed = useCallback(() => dispatch({ type: "DEPLOY_FAILED" }), []);
  const triggerError = useCallback(() => dispatch({ type: "ERROR" }), []);
  const triggerMood = useCallback((mood: Mood) => {
    if (mood === "happy") dispatch({ type: "CLICK" });
    else if (mood === "thinking") dispatch({ type: "DEPLOY_START" });
    else if (mood === "concerned") dispatch({ type: "ERROR" });
    else if (mood === "sleeping") dispatch({ type: "INACTIVE_5MIN" });
    else if (mood === "affection") dispatch({ type: "PET" });
    else if (mood === "success") dispatch({ type: "TASK_COMPLETE" });
    else if (mood === "confused") dispatch({ type: "ERROR" });
  }, []);

  return {
    mood: state.mood,
    streak: state.streak,
    deployStatus: state.deployStatus,
    triggerClick,
    triggerPet,
    triggerTaskComplete,
    triggerDeployStart,
    triggerDeploySuccess,
    triggerDeployFailed,
    triggerError,
    triggerMood,
  };
}
