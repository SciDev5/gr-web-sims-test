import RSysRenderer from "../RSysRenderer";
import CR2DSystem from "./CR2DSystem";

export default class CR2DSysRenderer extends RSysRenderer<CanvasRenderingContext2D,CR2DSystem> {
    protected getR(cnv:HTMLCanvasElement):CanvasRenderingContext2D {
        const ctx = cnv.getContext("2d");
        if (!ctx) throw new Error("Could not get CanvasRenderingContext2D, which is required for this simulator.");
        return ctx;
    }
}