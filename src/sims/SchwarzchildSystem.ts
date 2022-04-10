import GeodesicIntegrator from "../math/GeodesicIntegrator";
import { schwarzchildMetric, schwarzchild_aysmptoteJumper, schwarzchild_dλScaler, schwarzchild_metricSign } from "../math/metrics/ScwarzchildMetric";
import CR2DSystem from "../render/2d/CR2DSystem";

const rs = 0.25;

export default class SchwarzchildSystem implements CR2DSystem {
    private readonly path:{x:number,y:number,τ:number,t1:number,r1:number,r:number,dτ_dλ_sq:number}[] = [];

    private geodesic = new GeodesicIntegrator(
        schwarzchildMetric(rs,4),
        schwarzchild_metricSign,
        schwarzchild_dλScaler(rs),
        schwarzchild_aysmptoteJumper(rs,0.004)
    );


    private addCurrentPToPath():void {
        const
            {p:[{data:[,r,a,b]},{data:[t1,r1]},τ]} = this.geodesic,
            dτ_dλ_sq = this.geodesic.get_dτ_dλ_sq();
            
        const k = r*Math.sin(a);
        const x = k*Math.cos(b), y = k*Math.sin(b);

        this.path.push({x,y,dτ_dλ_sq,τ,t1,r1,r});
    }

    init(ctx: CanvasRenderingContext2D): void {
        this.geodesic.setP([0,2,Math.PI*.5,-0.4],[1,0,0,0.108]);
        // this.tracer.setP([0,0.1],[0,-0.5]);
        // this.geodesic.makeNull();
        this.addCurrentPToPath();
        
    }
    loop(ctx: CanvasRenderingContext2D, dt: number): void {
        // return;

        const N = 1000, dλK_step = 0.004;
        if (this.path.length === N) {
            console.log(this.path);
            this.path.length++;
        }
        if (this.path.length > N) return;

        for (let i = 0; i < 100; i++)
            this.geodesic.step(dλK_step);
        this.addCurrentPToPath();

        ctx.resetTransform();
        const { width, height } = ctx.canvas;
        ctx.clearRect(0,0,width,height);
        ctx.translate(0,height);
        ctx.scale(1,-1);
        
        const maxRShown = 2.5;

        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 2;
        ctx.beginPath();
        // ctx.moveTo(0,height*1/1.5);
        // ctx.lineTo(width,height*1/1.5);
        ctx.ellipse(width/2,height/2,width*rs/maxRShown/2,height*rs/maxRShown/2,0,0,Math.PI*2);
        ctx.stroke();
        ctx.strokeStyle = "#eee";
        ctx.lineWidth = 1;
        ctx.beginPath();
        // ctx.moveTo(0,height*1/1.5);
        // ctx.lineTo(width,height*1/1.5);
        ctx.ellipse(width/2,height/2,width*rs*1.5/maxRShown/2,height*rs*1.5/maxRShown/2,0,0,Math.PI*2);
        ctx.ellipse(width/2,height/2,width*rs*3/maxRShown/2,height*rs*3/maxRShown/2,0,0,Math.PI*2);
        ctx.stroke();

        ctx.strokeStyle = "#07f";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (const {x,y} of this.path) {
            ctx.lineTo(
                Math.max(0,Math.min(width,  (x/maxRShown/2+.5)*width)),
                Math.max(0,Math.min(height, (y/maxRShown/2+.5)*height))
            );
        }
        ctx.stroke();
    }
    cleanup() {
        this.path.length = 0;
    }

}