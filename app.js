"use strict";
const app_container = document.getElementById("app"); // app container 
//TEMPLATES
const project_input_template = document.getElementById("project-input");
const single_project_template = document.getElementById("single-project");
const project_list_template = document.getElementById("project-list");
class Project_List {
    constructor() {
        this.projectList = [];
    }
    get showProjects() {
        console.log(this.projectList);
        return this.projectList;
    }
    addProjectToList(project) {
        this.projectList.push(project);
    }
}
class Project {
    constructor(title, description, people_number) {
        this.title = title;
        this.description = description;
        this.people_number = people_number;
    }
}
// Inicjalizacja project input Template
function initProjectInputTemplate() {
    let project_input_template_clone = project_input_template.content.cloneNode(true);
    app_container.appendChild(project_input_template_clone);
    const project_input_title = document.getElementById("title");
    const project_input_description = document.getElementById("description");
    const project_input_people_number = document.getElementById("people");
    const project_input_form = document.getElementById("project_input_form");
    const project_list = new Project_List(); //Instancja klasy Project_List służąca nam do zawierania
    //w niej nowych projektów wprowadzonych przez użytkownika.
    return {
        project_list: project_list,
        title_input: project_input_title,
        description_input: project_input_description,
        people_input: project_input_people_number,
        input_form: project_input_form
    };
}
//Wywołanie inicjalizacji
const { project_list, title_input, description_input, people_input, input_form } = initProjectInputTemplate();
//KOD
//EventListener dla przycisku zatwierdzania formy
const input_form_submit = (e, title_input, description_input, people_input) => {
    e.preventDefault();
    const project = new Project(title_input.value, description_input.value, +people_input.value);
    project_list === null || project_list === void 0 ? void 0 : project_list.addProjectToList(project);
    project_list === null || project_list === void 0 ? void 0 : project_list.showProjects;
};
input_form === null || input_form === void 0 ? void 0 : input_form.addEventListener("submit", (e) => input_form_submit(e, title_input, description_input, people_input));
