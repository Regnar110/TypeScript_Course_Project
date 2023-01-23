const app_container = document.getElementById("app") as HTMLDivElement // app container 

//TEMPLATES
const project_input_template = document.getElementById("project-input") as HTMLTemplateElement
const single_project_template = document.getElementById("single-project") as HTMLTemplateElement
const project_list_template = document.getElementById("project-list") as HTMLTemplateElement

interface Project_inputs {
    project_list: Project_List
    title_input: HTMLInputElement
    description_input: HTMLInputElement
    people_input: HTMLInputElement
    input_form: HTMLFormElement
}

interface Project_Interface {
    title:string;
    description:string;
    people_number:number
}

function Validator(target:any) {
    console.log(target)
}

class Project_List { //Obiekt listy projektów. Do niego dodawane sa poszczególne nowe instancje klasy Project.
    projectList:Project_Interface[]= []
    constructor() {
    }

    get showProjects() {
        return this.projectList
    }

    addProjectToList(project:Project_Interface) {
        this.projectList.push(project)
    } 
}
class Project implements Project_Interface{
    constructor(
        public title:string, 
        public description:string, 
        public people_number: number
    ){}
}


// Inicjalizacja project input Template
function initProjectInputTemplate():Project_inputs {
        let project_input_template_CLONE = project_input_template.content.cloneNode(true)
        app_container.appendChild(project_input_template_CLONE)

        const project_input_title = document.getElementById("title") as HTMLInputElement
        const project_input_description = document.getElementById("description") as HTMLInputElement
        const project_input_people_number = document.getElementById("people") as HTMLInputElement
        const project_input_form = document.getElementById("project_input_form") as HTMLFormElement
        const project_list = new Project_List() //Instancja klasy Project_List służąca nam do zawierania
            //w niej nowych projektów wprowadzonych przez użytkownika.
        return {
            project_list: project_list,
            title_input: project_input_title,
            description_input: project_input_description,
            people_input: project_input_people_number,
            input_form: project_input_form
        }
    }

//Wywołanie inicjalizacji
const {project_list, title_input, description_input, people_input, input_form}:Project_inputs = initProjectInputTemplate()

const initializeProjectList = (project:Project[]) => {
    const lastProjectAdded:Project = project[project.length-1]
    let project_input_template_CLONE: Node;
    let next_project_template;
        if(project.length  === 1) {
            project_input_template_CLONE = project_list_template.content.cloneNode(true)
            app_container.appendChild(project_input_template_CLONE);
            const appProjectListContainer = document.querySelector('.projects') as HTMLElement
            const projectsHeader = appProjectListContainer.firstElementChild!.firstElementChild
            const projectUltag = appProjectListContainer.lastElementChild;
            projectsHeader!.textContent = lastProjectAdded.title
            projectUltag!.textContent = lastProjectAdded.description
        } else {
            next_project_template = project_list_template.content.cloneNode(true)
            app_container.appendChild(next_project_template);
            const appProjectListContainer = document.querySelectorAll('.projects')[project.length-1] as HTMLElement
            console.log(appProjectListContainer)
            const projectsHeader = appProjectListContainer.firstElementChild!.firstElementChild
            const projectUltag = appProjectListContainer.lastElementChild;
            projectsHeader!.textContent = lastProjectAdded.title
            projectUltag!.textContent = lastProjectAdded.description
        }
}

const initializeSingleProject = (project:Project) => {
    const appSingleProjectListEl = app_container.querySelector("li") as HTMLLIElement
    while (appSingleProjectListEl.firstChild && appSingleProjectListEl.lastChild) { // usuwa ostatnie node elementy. Tzn że będzie wyświetlany tylko ostatni projekt
        appSingleProjectListEl.removeChild(appSingleProjectListEl.lastChild);
      }
    //Tworzenie elementów dzieci dla elementu li 
    let singlePrHeader = document.createElement("h2") as HTMLHeadElement;
    let singlePrDescSpan = document.createElement("span") as HTMLSpanElement;
    let singlePrPeopleNUmSpan = document.createElement("span") as HTMLSpanElement;
    //Ustawiamy wartości dla elementów sekcji
    singlePrDescSpan.textContent = `Project Description: ${project.description}`
    singlePrPeopleNUmSpan.textContent = `People commited to project: ${project.people_number}`
    singlePrHeader.textContent = project.title
    //tablica z poszczególnymi elementami, które zostaną doczepione jako dzieci do li
    let childNodesForSingleProject = [singlePrHeader, singlePrDescSpan, singlePrPeopleNUmSpan]
    for(let el of childNodesForSingleProject) {// dodanie stworzonych elementów do elementu rodzica LI
        appSingleProjectListEl.appendChild(el)
    }
}


const  initializeProjectsTemplates = (project:Project[]) => { // Funkcja inicjalizująca wzorce singleProject i Project List. 
    let single_project_template_CLONE = single_project_template.content.cloneNode(true);
    app_container.appendChild(single_project_template_CLONE);
    initializeSingleProject(project[project.length-1]);
    initializeProjectList(project) // stworzenie listy projektów
}
//EventListener dla przycisku zatwierdzania formy

const input_form_submit = (
    e:any,
    ...htmlInputs:HTMLInputElement[]
    ) => {
        e.preventDefault();
        const [title_input, description_input, people_input] = htmlInputs;
        if(title_input.value.length > 0 && description_input.value.length > 0 && +people_input.value > 0 && +people_input.value < 10) {
            const project = new Project(title_input.value, description_input.value, +people_input.value)
            project_list.addProjectToList(project)
            const projecListArray = project_list.showProjects
            for(let el of htmlInputs) {
                el.value = ""
            }
            initializeProjectsTemplates(projecListArray)
        } else {
            alert("User input fiels cant be empty")
        }
    }

input_form.addEventListener("submit", (e) => input_form_submit(e, title_input, description_input, people_input)) 