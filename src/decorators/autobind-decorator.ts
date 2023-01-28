    //AUTOBIND - funkcja bindująca this do klasy (doczepoiona do metody)
    export function AutoBind(_target:any, _methodName:string, descriptor:PropertyDescriptor) { 
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