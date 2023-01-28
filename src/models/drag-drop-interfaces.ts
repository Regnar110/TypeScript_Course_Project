//DARG AND DROP INTERFACES

export interface Draggable {
    dragStartHandler(event: DragEvent):void;
    dragEndHandler(event: DragEvent):void;
}

export interface DragTarget {
    dropHandler(event: DragEvent):void;
    dragLeaveHandler(event: DragEvent):void;
    dragOverHandler(event:DragEvent):void; 
}
