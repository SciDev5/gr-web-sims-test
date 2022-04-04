export interface RSystem<R> {
    init(r:R):void;
    loop(r:R,dt:number):void;
    cleanup?:(r:R)=>void;
}