import { useState, useRef, useCallback } from 'react';

export const useSearchTimer = () => {
    const [time, setTime] = useState(0);
    const [timerMessage, setTimerMessage] = useState('Indexando fuentes...');
    // Fix: Replaced NodeJS.Timeout with number for browser compatibility, as setInterval returns a number in the browser.
    const timerRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);

    const startTimer = useCallback(() => {
        startTimeRef.current = performance.now();
        setTimerMessage('Indexando fuentes...');
        setTime(0);
        
        timerRef.current = setInterval(() => {
            const elapsedTime = (performance.now() - startTimeRef.current) / 1000;
            setTime(elapsedTime);
            if (elapsedTime > 5) {
                setTimerMessage('Búsqueda profunda activada...');
            }
        }, 100);
    }, []);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    return { time, timerMessage, startTimer, stopTimer };
};