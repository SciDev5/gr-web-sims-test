import consts from "../math/consts";
import GeodesicIntegrator from "../math/GeodesicIntegrator";
import { schwarzchildMetric, schwarzchild_aysmptoteJumper, schwarzchild_dτScaler } from "../math/metrics/ScwarzchildMetric";
import CR2DSystem from "../render/2d/CR2DSystem";

export default class SchwarzchildSystem implements CR2DSystem {
    private readonly path:{x:number,y:number,t1:number,r1:number,dτ_sq:number}[] = [];

    private geodesic = new GeodesicIntegrator(
        schwarzchildMetric(1,4),
        schwarzchild_dτScaler,
        schwarzchild_aysmptoteJumper(0.004)
    );


    private addCurrentPToPath():void {
        const
            { c } = consts,
            {p:[{data:[,r,a,b]},{data:[t1,r1]},]} = this.geodesic,
            dτ_sq = this.geodesic.get_cdτ_sq()/(c*c);
            
        const k = r*Math.sin(a);
            
        const x = k*Math.cos(b), y = k*Math.sin(b);

        this.path.push({x,y,dτ_sq,t1,r1});
    }

    init(ctx: CanvasRenderingContext2D): void {
        this.geodesic.setP([0,1.499999,Math.PI*.4,0.2],[0,0,1,1]);
        // this.tracer.setP([0,0.1],[0,-0.5]);
        this.geodesic.makeNull();
        this.addCurrentPToPath();
        
    }
    loop(ctx: CanvasRenderingContext2D, dt: number): void {
        // return;

        const N = 500, dτ_step = 0.004;
        if (this.path.length === N) {
            console.log(this.path);
            this.path.length++;
        }
        if (this.path.length > N) return;

        for (let i = 0; i < 10; i++)
            this.geodesic.step(dτ_step);
        this.addCurrentPToPath();

        ctx.resetTransform();
        const { width, height } = ctx.canvas;
        ctx.clearRect(0,0,width,height);
        ctx.translate(0,height);
        ctx.scale(1,-1);
        
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 2;
        ctx.beginPath();
        // ctx.moveTo(0,height*1/1.5);
        // ctx.lineTo(width,height*1/1.5);
        ctx.ellipse(width/2,height/2,width/4,height/4,0,0,Math.PI*2);
        ctx.stroke();

        ctx.strokeStyle = "#07f";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (const {x,y} of this.path) {
            ctx.lineTo(
                Math.max(0,Math.min(width,  (x/4+.5)*width)),
                Math.max(0,Math.min(height, (y/4+.5)*height))
            );
        }
        ctx.stroke();
    }
    cleanup() {
        this.path.length = 0;
    }

}