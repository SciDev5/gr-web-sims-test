export default interface CR2DSystem {
    init(ctx:CanvasRenderingContext2D):void;
    loop(ctx:CanvasRenderingContext2D,dt:number):void;
}