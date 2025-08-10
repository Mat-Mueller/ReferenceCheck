// langManager.js
let currentLangData = {};

export function setCurrentLangData(data) {
    currentLangData = data;
}

export function getLangText(key) {
    return currentLangData[key] || `[missing: ${key}]`;
}

export { currentLangData };