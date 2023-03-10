import { AutoBind } from "../decorators/autobind-decorator.js";
import { DragTarget } from "../models/drag-drop-interfaces.js";
import { Component } from "./base-component.js";
import { Project } from "../models/project-model.js";
import { ProjectItem } from "./project-item.js";
import { projectState } from "../state/project-state.js";
import { ProjectStatus } from "../models/project-model.js";

    export class ProjectList extends Component<HTMLDivElement, HTMLElement>
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