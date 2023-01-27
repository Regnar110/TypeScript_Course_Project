//DARG AND DROP INTERFACES
interface Draggable {
    dragStartHandler(event: DragEvent):void;
    dragEndHandler(event: DragEvent):void;
}

interface DragTarget {
    dropHandler(event: DragEvent):void;
    dragLeaveHandler(event: DragEvent):void; 
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
    private projects:Project[] = [];
    private static instance: ProjectState

    private constructor(){
        super();
    }

    static getInstance() { 
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

    moveProject(projectId:string, newStatus: ProjectStatus) { 
        const project = this.projects.find(prj => prj.id === projectId)
        if(project && project.projectStatus !== newStatus) {
            project.projectStatus = newStatus
            this.updateListeners();
        }
    }

    private updateListeners() {
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice())
        }
    }
}
const projectState = ProjectState.getInstance();

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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
    }
    if(validatableInput.minLength != null && typeof validatableInput.value === "string") {
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
function AutoBind(_target:any, _methodName:string, descriptor:PropertyDescriptor) { 
    const originalMethod = descriptor.value
    const adjustedDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFunction = originalMethod.bind(this)
            return boundFunction;
        },
    }
    return adjustedDescriptor;
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super("project-input", "app", true, "user-input");
        this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector("#description") as HTMLInputElement
        this.peopleInputElement = this.element.querySelector("#people") as HTMLInputElement
        
        this.configure()
    }

    private gatherUserInput(): [string, string, number] | void {
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


    @AutoBind
    private submitHandler(e: Event) {
        e.preventDefault()
        const userInput = this.gatherUserInput();
        if(Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people)
        }
        this.clearInput()
    }

    configure() {
        this.element.addEventListener("submit", this.submitHandler)
    }

    renderContent() {}
}

class ProjectList extends Component<HTMLDivElement, HTMLElement>
implements DragTarget {
    assignedProjects: Project[] = [];
    constructor(private type:"active" | "finished") {
        super("project-list","app", false, `${type}-projects`);
        this.renderContent()
        this.configure()
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`) as HTMLUListElement;
        listEl.innerHTML = "";
        for(const prjItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector("ul")!.id, prjItem)
        }

    }
    @AutoBind
    dragOverHandler(event: DragEvent) {
        if(event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
            event.preventDefault();
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
        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(prj =>{
                if(this.type === "active") { 
                    return prj.projectStatus === ProjectStatus.Active
                } 
                return prj.projectStatus === ProjectStatus.Finished
            })
            this.assignedProjects = relevantProjects
            this.renderProjects()
        });
    }

    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul")!.id = listId;
        this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + " PROJECTS"
    } 
}


//PROJECT CLASS

enum ProjectStatus {
    Active, Finished
}

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