import fs from 'fs';
import path from 'path';

function extractTranslationsFromCodebase(directory: string): Record<string, string> {
    const translations: Record<string, string> = {};

    function traverseDirectory(currentDirPath: string) {
        const files = fs.readdirSync(currentDirPath);

        files.forEach((file) => {
            const filePath = path.join(currentDirPath, file);
            const stat = fs.statSync(filePath);

            if (stat.isFile() && path.extname(file) === '.ts') {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const regex = /res\.__\(['"]([^'"]+)['"]\)/g;
                let match;

                while ((match = regex.exec(fileContent)) !== null) {
                    const translationKey = match[1];
                    if (!translations[translationKey]) {
                        translations[translationKey] = '';
                    }
                }
            } else if (stat.isDirectory()) {
                traverseDirectory(filePath);
            }
        });
    }

    traverseDirectory(directory);

    return translations;
}

function loadExistingTranslations(language: string): Record<string, string> {
    const translationFilePath = `./locales/${language}.json`;
    if (fs.existsSync(translationFilePath)) {
        const translationData = fs.readFileSync(translationFilePath, 'utf8');
        return JSON.parse(translationData);
    }
    return {};
}

function saveTranslationsToFile(language: string, translations: Record<string, string>) {
    const translationFilePath = `./locales/${language}.json`;

    // Sort the translations in ascending order by translation key
    const sortedTranslations: Record<string, string> = {};
    Object.keys(translations)
        .sort()
        .forEach((key) => {
            sortedTranslations[key] = translations[key];
        });

    const translationData = JSON.stringify(sortedTranslations, null, 2);
    fs.writeFileSync(translationFilePath, translationData, 'utf8');
}

function mergeTranslations(existingTranslations: Record<string, string>, foundTranslations: Record<string, string>): Record<string, string> {
    const mergedTranslations: Record<string, string> = { ...existingTranslations };

    for (const translationKey in existingTranslations) {
        if (!foundTranslations.hasOwnProperty(translationKey)) {
            delete mergedTranslations[translationKey];
        }
    }

    for (const translationKey in foundTranslations) {
        if (!existingTranslations.hasOwnProperty(translationKey)) {
            mergedTranslations[translationKey] = foundTranslations[translationKey];
        }
    }

    return mergedTranslations;
}

// Usage example:
const codebaseDirectory = 'src'; // Replace 'src' with the directory path to your codebase

const foundTranslations = extractTranslationsFromCodebase(codebaseDirectory);

const enGBTranslations = loadExistingTranslations('en-GB');
const zhHKTranslations = loadExistingTranslations('zh-HK');

const mergedEnGBTranslations = mergeTranslations(enGBTranslations, foundTranslations);
const mergedZhHKTranslations = mergeTranslations(zhHKTranslations, foundTranslations);

saveTranslationsToFile('en-GB', mergedEnGBTranslations);
saveTranslationsToFile('zh-HK', mergedZhHKTranslations);
