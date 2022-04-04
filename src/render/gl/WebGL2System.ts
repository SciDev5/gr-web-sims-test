export default interface WebGL2System {
    init(gl:WebGL2RenderingContext):void;
    loop(gl:WebGL2RenderingContext,dt:number):void;
    cleanup(gl:WebGL2RenderingContext):void;
}