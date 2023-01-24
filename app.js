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
