"use strict";
// APLIKACJA M DZIAŁAĆ W TEN SPOSÓB, ŻE UŻYTKOWNIK MOŻE WPROWADZIĆ PROJEKT
// I POJAWIĄ SIĘ DWIE LISTY PROJEKTÓW POMIĘDZY KTÓRYMI UŻYTKOWNIK BĘDZIE MÓGŁ
// PRZEZRZUCAĆ NA ZASADZIE DRAG AND DROP PROJEKTY.
//PROJEKT OPIERA SIĘ NA TEMPLATE'ACH KTÓRE ZOSTANĄ WYRENDEROWANY KIEDY MY TEGO 
//BĘDZIEMYC CHCIELI. NORMALNIE SĄ NIE WIDOCZNE, ALE MOGA BYĆ SIĘGNIĘTE PRZEZ JS
// I PRZY JEGO ZASTOSOWANIU BĘDZIEMY DECYDOWAĆ KTÓRY TEMPLATE I KIEDY WYRENDEROWAC
// ORAZ NA JAKICH WARUNKACH
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class State {
    constructor() {
        this.listeners = [];
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
}
class ProjectState extends State {
    constructor() {
        super();
        //Listeners to tablicja funkcji(odwołania funkcji- funtion references).
        //Zamysł, który stoi za tą tablicą jest taki, że gdy cokolwiek się zmieni np
        // po wywołaniu metody addProject() tej klasy to wtedy wywołujemy wszystkie funkcje
        // zawarte w tablicy listeners tj. przepętlamy się przez nie i wywołujemy je przekazując im
        // tablicę projects a dokładniej jej kopie używając
        // metody slice() tj listenerFn(this.projects.slice()) w tym celu, żeby
        // ta tablica nie mogła być modyfikowana z miejsca z którego pochodzi wywoływana
        // metoda
        this.projects = [];
    }
    static getInstance() {
        // koniexxzności jej inicjalizacji.)
        //Gdy jest wywołana wsprawdza czy instancja klasy ProjectState istnieje czy nie
        // Jeżeli nie, zwraca nową instancję.
        // Umozliwia ograniczenie inicjalizacji tej klasy do jednego egzemplarza
        // na całą aplikację
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
    addProject(title, description, numOfPeople) {
        //metoda wywoływana w submitHandler() klasy ProjectInput. Przekazywane są do niej
        // title, description i people czyli zwalidowane dane wprowadzone przez użytkownika
        const newProject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStatus.Active);
        this.projects.push(newProject);
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice()); // przekazuejmy funkcji kopię projects = opis
            // dlaczego wyżej.
        }
    }
}
const projectState = ProjectState.getInstance();
//Dzięki powyższemu wywołaniu mamy gwarancję że zawsze będzie
// tylko jedna instancja klasy ProjectState w całej aplikacji
// Jest to tzw singleton Class
//BASE CLASS "Component" - klasa zawierająca wszystkie wspólne metody, właściwości i funkcjonalności
// klas tej aplikacji. Służy to zawarcia ich w jednej klasie a następnie do dziedziczenia
// z tej klasy do innych klas. Ma zapobiegać powtarzaniu kodu
//Będzie to klasa generyczna(generic class) dzięki której gdy będziemy z niej dziedziczyć
// to będziemy mogli ustalić konkretne typy
class Component {
    constructor(templateId, hostElementId, insertAtStart, newElementId) {
        this.templateElement = document.getElementById(templateId);
        this.hostElement = document.getElementById(hostElementId);
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        if (newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }
    attach(insertAtBeggining) {
        this.hostElement.insertAdjacentElement(insertAtBeggining ? "afterbegin" : "beforeend", this.element);
    }
}
function validate(validatableInput) {
    let isValid = true;
    if (validatableInput.require) {
        isValid = isValid && validatableInput.value.toString().length !== 0;
        //is valid będzie true jeżeli oba wyrażenia po = będą true.  czyli jeżeli
        // isValid jest true i wyrazęnie po && true. Jeżeli jedno z nich jest false to 
        // isValid stanie się false
    }
    if (validatableInput.minLength != null && typeof validatableInput.value === "string") { // sprawdzamy
        // na początku czy minlength nie jest 0(co jest tzw falsy value). Jeżeli nnie byłoby tego
        //sprawdzenia to nawet po wprowadzeniu zera to to sprawdzenia by sie uruchomiło
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if (validatableInput.maxLength != null && typeof validatableInput.value === "string") {
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if (validatableInput.min != null && typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if (validatableInput.max != null && typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }
    return isValid;
}
//AUTOBIND - funkcja bindująca this do klasy (doczepoiona do metody)
function AutoBind(_target, _methodName, descriptor) {
    // przyczepiony descriptor do metody, który binduje this tej metody do kontekstu klasy w której znajduje się metoda.
    const originalMethod = descriptor.value;
    const adjustedDescriptor = {
        configurable: true,
        get() {
            const boundFunction = originalMethod.bind(this);
            return boundFunction;
        },
    };
    return adjustedDescriptor;
}
//Klasa odpowiedzialna za renderowanie user Input Form, zbierania z niej informacji
// wprowadzonych przez użytkownika oraz sprawdzania prawidłowości wprowadzonych
// danych
class ProjectInput extends Component {
    constructor() {
        // w której użytkownik wprowadza dane i do div z id app do któego
        // zostanie dołączona forma.
        super("project-input", "app", true, "user-input");
        //odnosiło się do kontekstu addEventListenera czyliu do elementu do którego jest doczepiony.
        this.titleInputElement = this.element.querySelector("#title");
        this.descriptionInputElement = this.element.querySelector("#description");
        this.peopleInputElement = this.element.querySelector("#people");
        this.configure();
    }
    gatherUserInput() {
        //użytkownika i sprawdzjąca ich poprawność
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;
        const titleValidatable = {
            value: enteredTitle,
            require: true,
        };
        const descriptionValidatable = {
            value: enteredDescription,
            require: true,
            minLength: 5
        };
        const peopleValidatable = {
            value: +enteredPeople,
            require: true,
            min: 1,
            max: 5
        };
        if (!validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)) {
            alert("Invalid Input/ Please try again");
            return;
        }
        else {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    }
    clearInput() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }
    submitHandler(e) {
        // weryfikuje wprowadzony przez użytkownika input i zatwierdza go
        e.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) { // sprawdzamy czy userinput zwróciony z gatherUseInput
            // jest rzeczywiście tablicą. Funkcja powinna zwrócić tuples
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people);
        }
        this.clearInput();
    }
    configure() {
        //event listener, który będzie wywoływał funkcję submitHandler
        this.element.addEventListener("submit", this.submitHandler);
        //wskazujemy żeby this odnosiło się do kontekstu funkcji configutre tj do klasy
        //ProjectInput. IOnaczej w submitHandler this.titleInput będzie undefined bo this będzie
    }
    renderContent() { } // metoda wymagana przez klase z której diedziczymy
}
__decorate([
    AutoBind // dekorstor bindujący "this" metody do klasy w której znajduje się metoda
], ProjectInput.prototype, "submitHandler", null);
//ProjectList CLass
class ProjectList extends Component {
    constructor(type) {
        super("project-list", "app", false, `${type}-projects`);
        this.type = type;
        this.assignedProjects = [];
        //wywołujemy konstruktor klasy Component przy użyciu metody super();
        //Tutaj dynamicznie dopasowujemy id projektu, w zależności czy,
        //renderujemy tablicę aktywnych czy skończonych projektów. Type ma być
        // zdefiniowany przy tworzeniu instancji klasy
        this.renderContent();
        this.configure();
    }
    renderProjects() {
        // w konstruktorze klasy ProjectList. Listener ten wywołuje metodę renderProject
        // która na bazie mieszczonych projektów w właściwości assignedProjects renderuje listę
        const listEl = document.getElementById(`${this.type}-projects-list`);
        listEl.innerHTML = ""; // to umożliwia nam zapobiegnięcie duplokowaniu
        //wyświetlanych projektów. PRzed wyświetleniem nowej listy projektów, usuwamy tutaj
        // starą listę i dodajemy dopeiro nową zaaktualizowaną z nowym projektem wprwadzonym przez
        // użytkownika
        for (const prjItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector("ul").id, prjItem);
        }
    }
    configure() {
        //Dodajemy listener z instancji klasy ProjectState, który ma przekazywać z klasy
        //ProjectState do klasy ProjectList listę sprawdzonych projektów, które ProjectState otrzymał z
        // klasy ProjectInput.
        //Poniższa funkcja uruchomi się jedynie gdy zostanie dodany nowy projekt
        projectState.addListener((projects) => {
            // metoda filtrująca projekty na te Active i Finished. Ma to na celu rozdzielenie
            // projektów na aktywne i zakończone. Domyslnie każdy dodany nowy projekt jest aktywny.
            const relevantProjects = projects.filter(prj => {
                if (this.type === "active") { // jeżeli typ projektu to active to
                    //zwracamy to wyrażenie. Czyli jeżeli prj odpowiada temu sprawdzeniu(jest true)
                    // to zwracamy go do nowej tablicy tj relevantProjects
                    return prj.projectStatus === ProjectStatus.Active;
                }
                return prj.projectStatus === ProjectStatus.Finished;
            });
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
    }
    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul").id = listId;
        this.element.querySelector("h2").textContent = this.type.toUpperCase() + " PROJECTS";
        // powyżej nadajemy id dla <ul></ul> i dodajemy text content dla headera
    }
}
//PROJECT CLASS
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
//Klasa Project definiuje jaką strukturę powinien mieć nasz projekt
// co pozwala później w innych klasach przy pracowaniu z konkretnymi projektami
// na rozpoznanie TypeScriptowi z jakim typem danych pracujemy tj. typem Project
class Project {
    constructor(id, title, description, people, projectStatus) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.projectStatus = projectStatus;
    }
}
//Klasa ProjectItem
class ProjectItem extends Component {
    get persons() {
        return this.project.people === 1 ?
            "1 person"
            :
                `${this.project.people} persons`;
    }
    constructor(hostId, project) {
        super("single-project", hostId, false, project.id);
        this.project = project;
        this.configure();
        this.renderContent();
    }
    configure() { }
    renderContent() {
        this.element.querySelector("h2").textContent = this.project.title;
        this.element.querySelector("h3").textContent = this.persons + " assigned";
        this.element.querySelector("p").textContent = this.project.description;
    }
}
const prjInput = new ProjectInput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
