import RSysRenderer from "../RSysRenderer";
import WebGL2System from "./WebGL2System";

export default class WebGL2SysRenderer extends RSysRenderer<WebGL2RenderingContext,WebGL2System> {
    protected getR(cnv:HTMLCanvasElement):WebGL2RenderingContext {
        const gl = cnv.getContext("webgl2");
        if (!gl) throw new Error("Could not get WebGL context, which is required for this simulator.");
        return gl;
    }
}