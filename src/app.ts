/// <reference path="./components/project-input.ts"/>
/// <reference path="./components/project-list.ts"/>

//powyżej znajduje się sytax znany tylko TS, który
//umożliwia nam importowanie namespace z pliku wskazanego
//w refernce powyżej. Syntax musi zaczynac się z trzema "/"
//Powyższy syntax sprawia że DDInterfaces namespac ejest
//dostępne teraz w tym pliku tj. app.ts

namespace App {
    new ProjectInput()
    new ProjectList("active");
    new ProjectList("finished");
}