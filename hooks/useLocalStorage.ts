
import { useState } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T) | null) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T) | null) => {
        setStoredValue(prevValue => {
            try {
                if (value === null) {
                    if (typeof window !== 'undefined') {
                        window.localStorage.removeItem(key);
                    }
                    return initialValue;
                }

                const valueToStore = value instanceof Function ? value(prevValue) : value;
                
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                }
                return valueToStore;
            } catch (error) {
                console.error(error);
                return prevValue;
            }
        });
    };

    return [storedValue, setValue];
}

export default useLocalStorage;
