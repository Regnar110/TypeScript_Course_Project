import { ProjectInput } from "./components/project-input.js";
import { ProjectList } from "./components/project-list.js";
//powyżej znajduje się sytax znany tylko TS, który
//umożliwia nam importowanie namespace z pliku wskazanego
//w refernce powyżej. Syntax musi zaczynac się z trzema "/"
//Powyższy syntax sprawia że DDInterfaces namespac ejest
//dostępne teraz w tym pliku tj. app.ts
new ProjectInput();
new ProjectList("active");
new ProjectList("finished");
