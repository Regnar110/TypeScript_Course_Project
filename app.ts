// APLIKACJA M DZIAŁAĆ W TEN SPOSÓB, ŻE UŻYTKOWNIK MOŻE WPROWADZIĆ PROJEKT
// I POJAWIĄ SIĘ DWIE LISTY PROJEKTÓW POMIĘDZY KTÓRYMI UŻYTKOWNIK BĘDZIE MÓGŁ
// PRZEZRZUCAĆ NA ZASADZIE DRAG AND DROP PROJEKTY.
//PROJEKT OPIERA SIĘ NA TEMPLATE'ACH KTÓRE ZOSTANĄ WYRENDEROWANY KIEDY MY TEGO 
//BĘDZIEMYC CHCIELI. NORMALNIE SĄ NIE WIDOCZNE, ALE MOGA BYĆ SIĘGNIĘTE PRZEZ JS
// I PRZY JEGO ZASTOSOWANIU BĘDZIEMY DECYDOWAĆ KTÓRY TEMPLATE I KIEDY WYRENDEROWAC
// ORAZ NA JAKICH WARUNKACH

//APLIKACJA NAPISANA PRZY ZASTOSOWANIE PARADYGMATU OOP
    //(OBJECT ORIENTED PROGRAMMING)

// DRAG & DROP INTERFACES 

interface Draggable {// możemy dodać draggable do jakiejkolwiek klasy, która renderuje
    //element który może być chwytalny - w naszym przypadku projectItem class
    dragStartHandler(event: DragEvent):void;
    dragEndHandler(event: DragEvent):void;
}

interface DragTarget { // interfejs, który będzie używany to stworzenia kontraktu między
    // nim a klasami, które powinny być celem dla chwytalnego obiektu tzn miejscem
    // gdzie ten obiekt może być przeniesiony i wrzucony
    dragOverHandler(event: DragEvent):void;// funkcja event listenera, która musi być implementowana przy funkcjonalności
    //drag and drop. Służy do poinformowania przeglądarki w JavaScript o tym że rzecz nad którą
    // przesuwamy jakiś obiekt jest właściwym celem drag eventu tzn że na tą rzecz możemy zrzucić
    // draggowany obiekt

    dropHandler(event: DragEvent):void; // Metoda event listenera służaca do tego żeby odpowiednio zareagować
    // na zrzucenie obiektu do drop targetu

    dragLeaveHandler(event: DragEvent):void; // metoda eventlistenera slużąca do wykrycia kiedy chwytany obiekt, 
    // opuszcza strefę nad obiektem do którego może być wrzucony chwytany obiekt. Możemy dzięki temu
    // np zmienic kolor backgroundd itd. 

}

//PROJECT STATE MANAGEMENT

type Listener<T> = (items: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn)
    }
}

class ProjectState extends State<Project> {
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
        super();
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

    addListener(listenerFn: Listener<Project>) {
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
        this.updateListeners();
    }

    moveProject(projectId:string, newStatus: ProjectStatus) { //metoda zmieniająca status projektu, gdy ten  jest przerzucany
        // z jednej listy na drugą itd
        const project = this.projects.find(prj => prj.id === projectId)
        if(project && project.projectStatus !== newStatus) {
            project.projectStatus = newStatus
            this.updateListeners();
        }
    }

    private updateListeners() {
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


//BASE CLASS "Component" - klasa zawierająca wszystkie wspólne metody, właściwości i funkcjonalności
// klas tej aplikacji. Służy to zawarcia ich w jednej klasie a następnie do dziedziczenia
// z tej klasy do innych klas. Ma zapobiegać powtarzaniu kodu

//Będzie to klasa generyczna(generic class) dzięki której gdy będziemy z niej dziedziczyć
// to będziemy mogli ustalić konkretne typy

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    //T i U może być jakimkolwiek HTML elementem, ustawianym przy inicjalizacji klasy.
    // teraz Gdy będziemy dziedziczyć z tej klasy, możemy określić konkretny typ, który będzie w 
    // niej użyty.
    //Klasa jest oznaczona jako abstract ponieważ ludzie nigdy nie powinni
    // bezpośrednio tworzyć jej instancji a zamiast tego powinna być tylko używana do
    // dziedziczenia z niej.
    // SŁOWO KLUCZ "abstract" sprawia ż enie można sworzyć instancji tej klasy
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(
        templateId: string,  
        hostElementId: string, 
        insertAtStart: boolean,
        newElementId?:string | undefined
        )
    {
        this.templateElement = document.getElementById(templateId) as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId) as T

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as U
        if(newElementId) {
            this.element.id = newElementId  
        } 

        this.attach(insertAtStart)
    }

    private attach(insertAtBeggining:boolean) {
        this.hostElement.insertAdjacentElement(
            insertAtBeggining ? "afterbegin": "beforeend", this.element
        )
    }

    abstract configure():void;
    abstract renderContent():void;
    // metody te są abstract. Oznacza to że określamy tylko,
    //jakie wymagania mają spełnić klasy dziedziczące przy
    // implementacji tych metod.
    //Teraz te klasy są wymagane jako klasy do imoplementacji 
    // przez klasy dziedziczące

}

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
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() { // w konstruktorze chcemy mieć dostęp do template formy 
        // w której użytkownik wprowadza dane i do div z id app do któego
        // zostanie dołączona forma.
        super("project-input", "app", true, "user-input");
        //odnosiło się do kontekstu addEventListenera czyliu do elementu do którego jest doczepiony.
        this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector("#description") as HTMLInputElement
        this.peopleInputElement = this.element.querySelector("#people") as HTMLInputElement
        
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

    configure() { //metoda która przypisuje do elementu czyli do <form></form>
        //event listener, który będzie wywoływał funkcję submitHandler
        this.element.addEventListener("submit", this.submitHandler)
        //wskazujemy żeby this odnosiło się do kontekstu funkcji configutre tj do klasy
        //ProjectInput. IOnaczej w submitHandler this.titleInput będzie undefined bo this będzie
    }

    renderContent() {} // metoda wymagana przez klase z której diedziczymy
    // tu nic w niej nie robimy
}

//ProjectList CLass
class ProjectList extends Component<HTMLDivElement, HTMLElement>
implements DragTarget {
    assignedProjects: Project[] = [];
    constructor(private type:"active" | "finished") {
        super("project-list","app", false, `${type}-projects`);
        //wywołujemy konstruktor klasy Component przy użyciu metody super();
        //Tutaj dynamicznie dopasowujemy id projektu, w zależności czy,
        //renderujemy tablicę aktywnych czy skończonych projektów. Type ma być
        // zdefiniowany przy tworzeniu instancji klasy
        this.renderContent()
        this.configure()
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
            new ProjectItem(this.element.querySelector("ul")!.id, prjItem)
        }

    }
    @AutoBind
    dragOverHandler(event: DragEvent) {
        if(event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
            //sprawdzamy czy obiekt nad ktorym draggowany obiekt znajduje się jest
            //prawidłowym drop targetem i czy typ data transferu dla dragowanego obiektu
            // to text/plain
            event.preventDefault();
            //dlaczego preventDefault? Bo w JS domyślnie drag and drop events są ustawione
            //jako takie eventy które uniemożliwiają domyślnie przerzuczenie obiektu.
            // Prevent default umożliwia nam przerzucanie draggowanego obiektu
            const listEl = this.element.querySelector("ul")!;
            listEl.classList.add("droppable");
        }

    }
    @AutoBind
    dropHandler(event: DragEvent) {
        const prjId = event.dataTransfer!.getData("text/plain");
        projectState.moveProject(prjId, this.type === 'active'? ProjectStatus.Active : ProjectStatus.Finished)
    }
    @AutoBind
    dragLeaveHandler(_event: DragEvent) {
        const listEl = this.element.querySelector("ul");
        listEl?.classList.remove("droppable");
    }

    configure() {
        this.element.addEventListener("dragover", this.dragOverHandler);
        this.element.addEventListener("dragleave", this.dragLeaveHandler);
        this.element.addEventListener("drop", this.dropHandler);
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
    }

    renderContent() { // funkcja renderująca content w ProjectList
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul")!.id = listId;
        this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + " PROJECTS"
        // powyżej nadajemy id dla <ul></ul> i dodajemy text content dla headera
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

//Klasa ProjectItem
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement>
 implements Draggable {

    private project:Project;

    get persons() {
        return this.project.people === 1 ?
            "1 person"
        :
            `${this.project.people} persons`
    }

    constructor(
        hostId: string,
        project:Project
    ) {
        super("single-project", hostId, false, project.id)
        this.project = project
        this.configure();
        this.renderContent()
    }

    @AutoBind
    dragStartHandler(event: DragEvent) {
        //dataTransfer to metoda obiektu DragEvent właściwości event. Umożliwa
        // transfer draggowanych danych do obiektu w którym ten draggowany obiekt
        // zostanie zdroppowany
        event.dataTransfer!.setData("text/plain", this.project.id)
        event.dataTransfer!.effectAllowed = "move";
    }

    dragEndHandler(_event: DragEvent) {
        console.log("drag end")
    }

    configure(){
        this.element.addEventListener("dragstart", this.dragStartHandler)
        this.element.addEventListener("dragend", this.dragEndHandler)
    }

    renderContent() {
        this.element.querySelector("h2")!.textContent = this.project.title;
        this.element.querySelector("h3")!.textContent = this.persons + " assigned"
        this.element.querySelector("p")!.textContent = this.project.description;
    }
}


const prjInput = new ProjectInput()
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished")