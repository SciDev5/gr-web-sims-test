import WebGL2System from "../render/gl/WebGL2System";

export default class TestGLSystem implements WebGL2System {
    init(gl: WebGL2RenderingContext): void {
        // none
    }
    loop(gl: WebGL2RenderingContext, dt: number): void {        
        gl.viewport(0,0,1,1);
        gl.clearColor(1,0,Math.random(),1);
        gl.clear(gl.COLOR_BUFFER_BIT);

    }
    cleanup(gl: WebGL2RenderingContext): void {
        // none
    }
}