
function implementMethods<T extends {new(...rest:any[]): {numberStorage:number[]}}>(constructor:T) {
    console.log(constructor)
    return class extends constructor {
        constructor(...rest:any[]) {
            super();
            console.log(constructor)
        }

    }
    
}

@implementMethods
class Calculate {
    numberStorage:number[] = []
    constructor(...rest:number[]) {
        this.numberStorage=rest
    }

    showNumbers() {
        console.log(this.numberStorage)
    }
}
