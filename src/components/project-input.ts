import { AutoBind } from "../decorators/autobind-decorator.js";
import { Component } from "./base-component.js";
import { Validatable } from "../util/validation.js";
import { validate } from "../util/validation.js";
import { projectState } from "../state/project-state.js";

    export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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