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
//APLIKACJA NAPISANA PRZY ZASTOSOWANIE PARADYGMATU OOP
//(OBJECT ORIENTED PROGRAMMING)
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
class ProjectInput {
    constructor() {
        // w której użytkownik wprowadza dane i do div z id app do któego
        // zostanie dołączona forma.
        this.templateElement = document.getElementById("project-input"); // "!"" po wyrażeniu oznacza not null
        this.hostElement = document.getElementById("app");
        //hostElement to odnośnik do elementu DOM
        // w którym będą renderowane poszczególne
        //elementy aplikacji
        //W kosntruktorze chcemy od razu przy inicjalizacji tej klasy 
        //stworzyć element, który będzie wstrzykiwany do Div id="app"
        const importedNode = document.importNode(this.templateElement.content, true);
        //importedNode jest zmienną const której wartością jest Fragment dokumentu tj.
        // zawartość templateElement wskazanego wyżej w konstruktorze. Drugi parametr określa
        // czy metoda ImportNode() ma wykonać deep clone tego elementu tzn z jego wszystkimi
        // zależnościami i dziećmi.
        //żeby mieć dostęp do importedNode  w metodzie attach stworzyliśmy własciwość element
        // w obiekcie instancji tej klasy. Ma on wartość pierwszego dziecka ImportedNode 
        // czyli elementu <form></form>
        this.element = importedNode.firstElementChild;
        this.element.id = "user-input"; // dodanie id user-input do elementu celem nadania stylów
        this.titleInputElement = this.element.querySelector("#title");
        this.descriptionInputElement = this.element.querySelector("#description");
        this.peopleInputElement = this.element.querySelector("#people");
        this.attach(); // wywołujemy metodę attach w momencie gdy konstruktor jest uruchamiany.
        this.configure();
    }
    gatherUserInput() {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;
        if (enteredTitle.length === 0 ||
            enteredDescription.length === 0 ||
            enteredPeople.length === 0) {
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
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            console.log(title, description, people);
        }
        this.clearInput();
    }
    configure() {
        //event listener, który będzie wywoływał funkcję submitHandler
        this.element.addEventListener("submit", this.submitHandler);
        //wskazujemy żeby this odnosiło się do kontekstu funkcji configutre tj do klasy
        //ProjectInput. IOnaczej w submitHandler this.titleInput będzie undefined bo this będzie
        //odnosiło się do kontekstu addEventListenera czyliu do elementu do którego jest doczepiony.
    }
    attach() {
        this.hostElement.insertAdjacentElement("afterbegin", this.element);
        //InsertAdjacentElement() służy do wszystkichania elementu HTML
        // Pierwszy argument to opis tego g dzie ma zostać wstrzyknięty element
        //After begin oznacza że wstrzykniemy HTML Element w host element tj "<div id="app"></div>"
        // zaraz po rozpoczęciu tego tagu(zaraz po deklaracji elementu div).
        //Drugi parametr to element który będziemy wstrzykiwać
    }
}
__decorate([
    AutoBind // dekorstor bindujący "this" metody do klasy w której znajduje się metoda
], ProjectInput.prototype, "submitHandler", null);
const prjInput = new ProjectInput();
