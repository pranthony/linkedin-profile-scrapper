import { Person } from "./modules/models/Person";
import { Work } from "./modules/models/Work";
import { loadPageContent } from "./modules/utils/autoscroll";
import { xPathEval } from "./modules/utils/xpath"

loadPageContent();

let fullname = document.getElementsByTagName("h1")[0].textContent
let workExperience = []
console.log(fullname, workExperience)

/*let workSection = XPath("(//section[.//span[contains(text(), 'Experiencia')]]//ul)[1]", document).iterateNext();
let port = chrome.runtime.connect({name:'safePort'});
port.postMessage(fullname, workExperience);*/