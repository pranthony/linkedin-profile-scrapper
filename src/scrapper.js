import { Person } from "./modules/models/Person";
import { WorkExperience } from "./modules/models/Work";
import { loadPageContent } from "./modules/utils/autoscroll";
import { evaluateXPath } from "./modules/utils/evaluateXPath"
import { cleanText} from "./modules/utils/cleantext"
import { getSectionXPath } from "./modules/utils/getSectionXpath";
import { hold } from "./modules/utils/hold";
import { SECTION_DROPDOWN_CLUE, SECTION_ITEMS, SECTION_ITEM_HISTORY_CLUE, SECTION_ITEM_WITH_HISTORY_COMPANY_OR_POSITION, SECTION_ITEM_WITH_HISTORY_DURATION_INFO, SECTION_RETURN_CLUE } from "./modules/helpers/XPathConstants";

const findSection = (sectionClue) => {
    return evaluateXPath(getSectionXPath(sectionClue), document).iterateNext();
}

const scrapVisibleSection = (section) => {
    
    let sectionItemsIterator = evaluateXPath(SECTION_ITEMS, section)
    let thisSectionItem = sectionItemsIterator.iterateNext();

    let itemsInformation = []

    while (thisSectionItem) {

        let thisSectionItemHistory = evaluateXPath(SECTION_ITEM_HISTORY_CLUE, thisSectionItem).iterateNext();

        if (thisSectionItemHistory) {
            
            let company = cleanText(evaluateXPath(SECTION_ITEM_WITH_HISTORY_COMPANY_OR_POSITION, thisSectionItemHistory).iterateNext().textContent)
            let position = cleanText(evaluateXPath(SECTION_ITEM_WITH_HISTORY_COMPANY_OR_POSITION, thisSectionItem).iterateNext().textContent)
            let durationInfo = cleanText(evaluateXPath(SECTION_ITEM_WITH_HISTORY_DURATION_INFO, thisSectionItem).iterateNext().textContent).split(' · ');
            let totalDuration = durationInfo[1]
            let durationRange = durationInfo[0].split(' - ')
            let startDate = durationRange[0]
            let endDate = durationRange[durationRange.length - 1]

            itemsInformation.push(new WorkExperience(company, position, totalDuration, startDate, endDate))
        }

        /*

        else {
            let company = cleanText(xpathEval(XPATH_WORK_EXPERIENCE_COMPANY, thisWork).iterateNext().textContent)
            let position = cleanText(xpathEval(XPATH_WORK_EXPERIENCE_POSITION, thisWork).iterateNext().textContent)
            let durationInfo = cleanText(xpathEval(XPATH_WORK_EXPERIENCE_DURATION_INFO, thisWork).iterateNext().textContent).split(' · ');
            let totalDuration = durationInfo[1]
            let durationRange = durationInfo[0].split(' - ')
            let startDate = durationRange[0]
            let endDate = durationRange[durationRange.length - 1]

            itemsInformation.push(new WorkExperience(company, position, totalDuration, startDate, endDate))
        }

        */

        thisSectionItem = sectionItemsIterator.iterateNext();
    }
    return itemsInformation;
}

const scrapSection = async (sectionName) => {

    let sectionInformation;
    let section = findSection(sectionName);
    let sectionDropdown = evaluateXPath(SECTION_DROPDOWN_CLUE, section).iterateNext()

    if (sectionDropdown) {
        sectionDropdown.click();
        await new Promise(r => setTimeout(r, 8000));
        let expandedSection = findSection(sectionName);
        sectionInformation = scrapVisibleSection(expandedSection);
        await new Promise(r => setTimeout(r, 8000));
        let returnButton = evaluateXPath(SECTION_RETURN_CLUE, expandedSection).iterateNext();
        returnButton.click();
    }

    else {
        sectionInformation = scrapVisibleSection(section);
    }
    console.log(sectionInformation);
    return sectionInformation;
}

const scrapProfile = async () => {

    await loadPageContent();

    let fullname = document.getElementsByTagName("h1")[0].textContent
    let workExperience = scrapSection("experience")

    console.log(workExperience)

    let port = chrome.runtime.connect({name:'safePort'});
    port.postMessage(new Person(fullname, workExperience));
}

scrapProfile();