"use strict";
const app_container = document.getElementById("app"); // app container 
//TEMPLATES
const project_input_template = document.getElementById("project-input");
const single_project_template = document.getElementById("single-project");
const project_list_template = document.getElementById("project-list");
function Validator(target) {
    console.log(target);
}
class Project_List {
    constructor() {
        this.projectList = [];
    }
    get showProjects() {
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
    let project_input_template_CLONE = project_input_template.content.cloneNode(true);
    app_container.appendChild(project_input_template_CLONE);
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
const initializeProjectList = (project) => {
    const lastProjectAdded = project[project.length - 1];
    let project_input_template_CLONE;
    let next_project_template;
    if (project.length === 1) {
        project_input_template_CLONE = project_list_template.content.cloneNode(true);
        app_container.appendChild(project_input_template_CLONE);
        const appProjectListContainer = document.querySelector('.projects');
        const projectsHeader = appProjectListContainer.firstElementChild.firstElementChild;
        const projectUltag = appProjectListContainer.lastElementChild;
        projectsHeader.textContent = lastProjectAdded.title;
        projectUltag.textContent = lastProjectAdded.description;
    }
    else {
        next_project_template = project_list_template.content.cloneNode(true);
        app_container.appendChild(next_project_template);
        const appProjectListContainer = document.querySelectorAll('.projects')[project.length - 1];
        console.log(appProjectListContainer);
        const projectsHeader = appProjectListContainer.firstElementChild.firstElementChild;
        const projectUltag = appProjectListContainer.lastElementChild;
        projectsHeader.textContent = lastProjectAdded.title;
        projectUltag.textContent = lastProjectAdded.description;
    }
};
const initializeSingleProject = (project) => {
    const appSingleProjectListEl = app_container.querySelector("li");
    while (appSingleProjectListEl.firstChild && appSingleProjectListEl.lastChild) { // usuwa ostatnie node elementy. Tzn że będzie wyświetlany tylko ostatni projekt
        appSingleProjectListEl.removeChild(appSingleProjectListEl.lastChild);
    }
    //Tworzenie elementów dzieci dla elementu li 
    let singlePrHeader = document.createElement("h2");
    let singlePrDescSpan = document.createElement("span");
    let singlePrPeopleNUmSpan = document.createElement("span");
    //Ustawiamy wartości dla elementów sekcji
    singlePrDescSpan.textContent = `Project Description: ${project.description}`;
    singlePrPeopleNUmSpan.textContent = `People commited to project: ${project.people_number}`;
    singlePrHeader.textContent = project.title;
    //tablica z poszczególnymi elementami, które zostaną doczepione jako dzieci do li
    let childNodesForSingleProject = [singlePrHeader, singlePrDescSpan, singlePrPeopleNUmSpan];
    for (let el of childNodesForSingleProject) { // dodanie stworzonych elementów do elementu rodzica LI
        appSingleProjectListEl.appendChild(el);
    }
};
const initializeProjectsTemplates = (project) => {
    let single_project_template_CLONE = single_project_template.content.cloneNode(true);
    app_container.appendChild(single_project_template_CLONE);
    initializeSingleProject(project[project.length - 1]);
    initializeProjectList(project); // stworzenie listy projektów
};
//EventListener dla przycisku zatwierdzania formy
const input_form_submit = (e, ...htmlInputs) => {
    e.preventDefault();
    const [title_input, description_input, people_input] = htmlInputs;
    if (title_input.value.length > 0 && description_input.value.length > 0 && +people_input.value > 0 && +people_input.value < 10) {
        const project = new Project(title_input.value, description_input.value, +people_input.value);
        project_list.addProjectToList(project);
        const projecListArray = project_list.showProjects;
        for (let el of htmlInputs) {
            el.value = "";
        }
        initializeProjectsTemplates(projecListArray);
    }
    else {
        alert("User input fiels cant be empty");
    }
};
input_form.addEventListener("submit", (e) => input_form_submit(e, title_input, description_input, people_input));
