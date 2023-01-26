// APLIKACJA M DZIAŁAĆ W TEN SPOSÓB, ŻE UŻYTKOWNIK MOŻE WPROWADZIĆ PROJEKT
// I POJAWIĄ SIĘ DWIE LISTY PROJEKTÓW POMIĘDZY KTÓRYMI UŻYTKOWNIK BĘDZIE MÓGŁ
// PRZEZRZUCAĆ NA ZASADZIE DRAG AND DROP PROJEKTY.
//PROJEKT OPIERA SIĘ NA TEMPLATE'ACH KTÓRE ZOSTANĄ WYRENDEROWANY KIEDY MY TEGO 
//BĘDZIEMYC CHCIELI. NORMALNIE SĄ NIE WIDOCZNE, ALE MOGA BYĆ SIĘGNIĘTE PRZEZ JS
// I PRZY JEGO ZASTOSOWANIU BĘDZIEMY DECYDOWAĆ KTÓRY TEMPLATE I KIEDY WYRENDEROWAC
// ORAZ NA JAKICH WARUNKACH

//APLIKACJA NAPISANA PRZY ZASTOSOWANIE PARADYGMATU OOP
    //(OBJECT ORIENTED PROGRAMMING)


//PROJECT STATE MANAGEMENT

type Listener = (items: Project[]) => void;

class ProjectState {
    private listeners:Listener[] = []
    //Listeners to tablicja funkcji(odwołania funkcji- funtion references).
    //Zamysł, który stoi za tą tablicą jest taki, że gdy cokolwiek się zmieni np
    // po wywołaniu metody addProject() tej klasy to wtedy wywołujemy wszystkie funkcje
    // zawarte w tablicy listeners tj. przepętlamy się przez nie i wywołujemy je przekazując im
    // tablicę projects a dokładniej jej kopie używając
    // metody slice() tj listenerFn(this.projects.slice()) w tym celu, żeby
    // ta tablica nie mogła być modyfikowana z miejsca z którego pochodzi wywoływana
    // metoda
    private projects:Project[] = [];
    private static instance: ProjectState

    private constructor(){
    }

    static getInstance() { // metoda statyczna(Dostepna z zewnątrz kkasy bez 
        // koniexxzności jej inicjalizacji.)
        //Gdy jest wywołana wsprawdza czy instancja klasy ProjectState istnieje czy nie
        // Jeżeli nie, zwraca nową instancję.
        // Umozliwia ograniczenie inicjalizacji tej klasy do jednego egzemplarza
        // na całą aplikację
        if(this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState()
        return this.instance
    }

    addListener(listenerFn: Listener) {
        this.listeners.push(listenerFn);
    }

    addProject(title:string, description:string, numOfPeople:number) {
        //metoda wywoływana w submitHandler() klasy ProjectInput. Przekazywane są do niej
        // title, description i people czyli zwalidowane dane wprowadzone przez użytkownika
        const newProject = new Project(
            Math.random().toString(), 
            title, 
            description, 
            numOfPeople,
            ProjectStatus.Active
        )
        this.projects.push(newProject);
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice()) // przekazuejmy funkcji kopię projects = opis
            // dlaczego wyżej.
        }
    }
}
const projectState = ProjectState.getInstance();
//Dzięki powyższemu wywołaniu mamy gwarancję że zawsze będzie
// tylko jedna instancja klasy ProjectState w całej aplikacji
// Jest to tzw singleton Class


//WALIDACJA USER INPUTU + Interfejs
interface Validatable {
    value: string | number;
    require?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validatableInput: Validatable):boolean {
    let isValid = true;
    if(validatableInput.require){
        isValid = isValid && validatableInput.value.toString().length !== 0 
        //is valid będzie true jeżeli oba wyrażenia po = będą true.  czyli jeżeli
        // isValid jest true i wyrazęnie po && true. Jeżeli jedno z nich jest false to 
        // isValid stanie się false
    }
    if(validatableInput.minLength != null && typeof validatableInput.value === "string") { // sprawdzamy
        // na początku czy minlength nie jest 0(co jest tzw falsy value). Jeżeli nnie byłoby tego
        //sprawdzenia to nawet po wprowadzeniu zera to to sprawdzenia by sie uruchomiło
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength 
    }
    if(validatableInput.maxLength != null && typeof validatableInput.value === "string") {
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength 
    }
    if(validatableInput.min != null && typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value >= validatableInput.min
    }
    if(validatableInput.max != null && typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value <= validatableInput.max
    }
    return isValid
}

//AUTOBIND - funkcja bindująca this do klasy (doczepoiona do metody)
function AutoBind(_target:any, _methodName:string, descriptor:PropertyDescriptor) { // funkcja zwracająca nowy descriptor dla klasy ProjectInput
    // przyczepiony descriptor do metody, który binduje this tej metody do kontekstu klasy w której znajduje się metoda.
    const originalMethod = descriptor.value
    const adjustedDescriptor: PropertyDescriptor = {
        configurable: true,
        get() { //getter który uruchamia się gdy uruchamiamy metodę
            const boundFunction = originalMethod.bind(this)
            return boundFunction;
        },
    }
    return adjustedDescriptor;
}

//Klasa odpowiedzialna za renderowanie user Input Form, zbierania z niej informacji
// wprowadzonych przez użytkownika oraz sprawdzania prawidłowości wprowadzonych
// danych
class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() { // w konstruktorze chcemy mieć dostęp do template formy 
        // w której użytkownik wprowadza dane i do div z id app do któego
        // zostanie dołączona forma.
        this.templateElement = document.getElementById("project-input")! as HTMLTemplateElement; // "!"" po wyrażeniu oznacza not null
        this.hostElement = document.getElementById("app")! as HTMLDivElement
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
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = "user-input" // dodanie id user-input do elementu celem nadania stylów
        
        this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector("#description") as HTMLInputElement
        this.peopleInputElement = this.element.querySelector("#people") as HTMLInputElement
        
        this.attach() // wywołujemy metodę attach w momencie gdy konstruktor jest uruchamiany.
        this.configure()
    }

    private gatherUserInput(): [string, string, number] | void { // funkcja zbierajaca inputy
        //użytkownika i sprawdzjąca ich poprawność
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidatable: Validatable = {
            value: enteredTitle,
            require: true,
        };
        const descriptionValidatable: Validatable = {
            value: enteredDescription,
            require: true,
            minLength: 5
        };
        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            require: true,
            min: 1,
            max: 5
        };

        if(
            !validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)
        )
        {
            alert("Invalid Input/ Please try again")
            return;
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople]
        }
    }

    private clearInput() {
        this.titleInputElement.value = ""
        this.descriptionInputElement.value = ""
        this.peopleInputElement.value = ""
    }


    @AutoBind // dekorstor bindujący "this" metody do klasy w której znajduje się metoda
    private submitHandler(e: Event) { // funkcja wywoływana przez event Listener formy.
        // weryfikuje wprowadzony przez użytkownika input i zatwierdza go
        e.preventDefault()
        const userInput = this.gatherUserInput();
        if(Array.isArray(userInput)) { // sprawdzamy czy userinput zwróciony z gatherUseInput
            // jest rzeczywiście tablicą. Funkcja powinna zwrócić tuples
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people)
        }
        this.clearInput()
    }

    private configure() { //metoda która przypisuje do elementu czyli do <form></form>
        //event listener, który będzie wywoływał funkcję submitHandler
        this.element.addEventListener("submit", this.submitHandler)
        //wskazujemy żeby this odnosiło się do kontekstu funkcji configutre tj do klasy
        //ProjectInput. IOnaczej w submitHandler this.titleInput będzie undefined bo this będzie
        //odnosiło się do kontekstu addEventListenera czyliu do elementu do którego jest doczepiony.
    }
    private attach() { // funkcja dołączająca do hostelement element który ma zostać
        //wyrenderowany w <div id="app"></div>
        this.hostElement.insertAdjacentElement("afterbegin", this.element)
        //InsertAdjacentElement() służy do wszystkichania elementu HTML
        // Pierwszy argument to opis tego g dzie ma zostać wstrzyknięty element
        //After begin oznacza że wstrzykniemy HTML Element w host element tj "<div id="app"></div>"
        // zaraz po rozpoczęciu tego tagu(zaraz po deklaracji elementu div).
        //Drugi parametr to element który będziemy wstrzykiwać
    }
}

//ProjectList CLass
class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLElement;
    assignedProjects: Project[] = [];

    constructor(private type:"active" | "finished") {
        this.templateElement = document.getElementById("project-list")! as HTMLTemplateElement; // "!"" po wyrażeniu oznacza not null
        this.hostElement = document.getElementById("app")! as HTMLDivElement
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLElement
        this.element.id = `${this.type}-projects`
        //Tutaj dynamicznie dopasowujemy id projektu, w zależności czy,
        //renderujemy tablicę aktywnych czy skończonych projektów. Type ma być
        // zdefiniowany przy tworzeniu instancji klasy

        //Dodajemy listener z instancji klasy ProjectState, który ma przekazywać z klasy
        //ProjectState do klasy ProjectList listę sprawdzonych projektów, które ProjectState otrzymał z
        // klasy ProjectInput.
        //Poniższa funkcja uruchomi się jedynie gdy zostanie dodany nowy projekt
        projectState.addListener((projects: Project[]) => {
            // metoda filtrująca projekty na te Active i Finished. Ma to na celu rozdzielenie
            // projektów na aktywne i zakończone. Domyslnie każdy dodany nowy projekt jest aktywny.

            const relevantProjects = projects.filter(prj =>{
                if(this.type === "active") { // jeżeli typ projektu to active to
                    //zwracamy to wyrażenie. Czyli jeżeli prj odpowiada temu sprawdzeniu(jest true)
                    // to zwracamy go do nowej tablicy tj relevantProjects
                    return prj.projectStatus === ProjectStatus.Active
                } 
                return prj.projectStatus === ProjectStatus.Finished
            })
            this.assignedProjects = relevantProjects
            this.renderProjects()
        });

        this.attach();
        this.renderContent()
    }

    private renderProjects() {// funkcja wywoływana w listenerze klasy ProjectState umieszczonym
        // w konstruktorze klasy ProjectList. Listener ten wywołuje metodę renderProject
        // która na bazie mieszczonych projektów w właściwości assignedProjects renderuje listę
        const listEl = document.getElementById(`${this.type}-projects-list`) as HTMLUListElement;
        listEl.innerHTML = "";// to umożliwia nam zapobiegnięcie duplokowaniu
        //wyświetlanych projektów. PRzed wyświetleniem nowej listy projektów, usuwamy tutaj
        // starą listę i dodajemy dopeiro nową zaaktualizowaną z nowym projektem wprwadzonym przez
        // użytkownika
        for(const prjItem of this.assignedProjects) {
            const listItem = document.createElement("li");
            listItem.textContent = prjItem.title
            listEl.appendChild(listItem)
        }
    }

    private renderContent() { // funkcja renderująca content w ProjectList
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul")!.id = listId;
        this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + " PROJECTS"
        // powyżej nadajemy id dla <ul></ul> i dodajemy text content dla headera
    } 

    private attach() {
        this.hostElement.insertAdjacentElement("beforeend", this.element)
    }
}


//PROJECT CLASS

enum ProjectStatus {
    Active, Finished
}

//Klasa Project definiuje jaką strukturę powinien mieć nasz projekt
// co pozwala później w innych klasach przy pracowaniu z konkretnymi projektami
// na rozpoznanie TypeScriptowi z jakim typem danych pracujemy tj. typem Project
class Project {

    constructor(
        public id:string, 
        public title:string, 
        public description:string, 
        public people: number, 
        public projectStatus: ProjectStatus
        ) {}
}


const prjInput = new ProjectInput()
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished")