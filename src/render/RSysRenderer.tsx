import React from "react";
import DeltaTime from "../util/DeltaTime";
import { RSystem } from "./RSystem";

export default abstract class RSysRenderer<R,Rs extends RSystem<R>> extends React.Component<{width:number,height:number,sys:()=>Rs}> {
    protected abstract getR(cnv:HTMLCanvasElement):R;
    private readonly cnvRef = React.createRef<HTMLCanvasElement>();
    private readonly sys:Rs;
    private r?:R;

    private readonly dt = new DeltaTime();
    
    constructor(props:RSysRenderer<R,Rs>["props"]) {
        super(props);
        this.sys = props.sys();
    }

    componentDidMount() {
        const cnv = this.cnvRef.current!;
        this.r = this.getR(cnv);
        this.sys.init(this.r);
        this.dt.update();
        this.scheduleNextLoop(); 
    }
    componentWillUnmount() {
        this.stopLoop();
        if (this.sys.cleanup)
            this.sys.cleanup(this.r!);
    }
    
    private loop():void {
        this.sys.loop(this.r!,this.dt.get());
    }
    private frameRequestId = 0;
    private scheduleNextLoop() {
        this.loop();
        this.frameRequestId = requestAnimationFrame(()=>this.scheduleNextLoop());
    }
    private stopLoop() {
        cancelAnimationFrame(this.frameRequestId);
    }

    render(): React.ReactNode {
        return (
            <canvas ref={this.cnvRef} width={this.props.width} height={this.props.height}/>
        );
    }
}