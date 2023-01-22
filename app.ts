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

class Project_List { //Obiekt listy projektów. Do niego dodawane sa poszczególne nowe instancje klasy Project.
    projectList:Project_Interface[]= []
    constructor() {
    }

    get showProjects() {
        console.log(this.projectList);
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
        let project_input_template_clone = project_input_template.content.cloneNode(true)
        app_container.appendChild(project_input_template_clone)

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


//KOD

//EventListener dla przycisku zatwierdzania formy

const input_form_submit = (
    e:any,
    title_input:HTMLInputElement, 
    description_input: HTMLInputElement, 
    people_input:HTMLInputElement
    ) => {
        e.preventDefault()
        const project = new Project(title_input.value, description_input.value, +people_input.value)
        project_list?.addProjectToList(project)
        project_list?.showProjects
    }

input_form.addEventListener("submit", (e) => input_form_submit(e, title_input!, description_input!, people_input!)) 