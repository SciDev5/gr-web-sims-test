import consts from "./consts";
import Tensor from "./data/Tensor";

export type Gen_g = (p:Tensor)=>{g0:Tensor,g1:Tensor};
export type Scale_dλ = (p0:Tensor,p1:Tensor,p2:Tensor)=>number;
export type HorizJumper = (p0:Tensor,p1:Tensor,dτ:number)=>Tensor;

export type GeodesicType = "spacelike"|"timelike"|"null";

export type MetricSign = "timelike-positive"|"spacelike-positive";

type ValueOf_p = [number,number,number,number];

export default class GeodesicIntegrator {
    private p0 = Tensor.vec([0,0,0,0]);
    private p1 = Tensor.vec([0,0,0,0]);
    private λ = 0;
    private τ = 0;

    private type:GeodesicType = "null";

    private dτ_dλ_sq = 0;

    get p():[Tensor,Tensor,number,number] { return [ this.p0, this.p1, this.τ, this.λ ] }

    constructor(
        public readonly g:Gen_g,
        public readonly gSign:MetricSign,
        public readonly dλScaler:Scale_dλ,
        public readonly horizJumper:HorizJumper
    ) {}

    public setP(p0:ValueOf_p,p1:ValueOf_p):void {
        this.p0 = Tensor.vec(p0);
        this.p1 = Tensor.vec(p1);
        this.dτ_dλ_sq = this.get_dτ_dλ_sq();
        this.type = this.dτ_dλ_sq > 0 === (this.gSign === "spacelike-positive") ? "spacelike" : "timelike";
    }
    public makeNull():void {
        this.dτ_dλ_sq = 0;
        this.type = "null";
        this.correctP1();
    }


    public get_dτ_dλ_sq():number {
        const { g0 } = this.g(this.p0), { c } = consts;
        return Tensor.einsteinSum(
            {t:g0,p:[-1,-2]},
            {t:this.p1,p:[-1]},
            {t:this.p1,p:[-2]}
        ).data[0] / c**2;
    }

    public correctP1():void {
        const { g0 } = this.g(this.p0);
        const p1_nt = Tensor.vec([0,...this.p1.data.slice(1)]);
        const k = Tensor.einsteinSum({t:g0,p:[-1,-2]},{t:p1_nt,p:[-1]},{t:p1_nt,p:[-2]}).data[0];
        const z = this.dτ_dλ_sq;
        const p1t = Math.sqrt((z-k)/g0.data[0]);
        this.p1 = Tensor.vec([p1t,...this.p1.data.slice(1)]);
    }

    public getP2(p0:Tensor):Tensor {
        const { g0, g1 } = this.g(p0);
        const _g0_inv = Tensor.einsteinSum({t:g0.inv(),p:[0,0]});

        const _Γμνλ0 = Tensor.einsteinSum(
            {t:_g0_inv,p:[2]},
            {t:Tensor.indexedSum(
                {t:g1,p:[2,1,0]},
                {t:g1,p:[2,0,1]},
                {t:g1.mul(-1),p:[0,1,2]}
            ),p:[0,1,2]}
        ).mul(1/2);
        
        const p2 = Tensor.einsteinSum(
            {t:_Γμνλ0,p:[-1,-2,0]},
            {t:this.p1,p:[-1]},
            {t:this.p1,p:[-2]}
        ).mul(-1);

        return p2;
    }

    public step(amt:number) {
        const p2 = this.getP2(this.p0);

        const
            dλ = amt*this.dλScaler(this.p0,this.p1,p2),
            p2_dλ = p2.mul(dλ),
            p1_dλ = this.p1.mul(dλ);
        this.p1 = Tensor.sum(this.p1, p2_dλ);
        this.p0 = Tensor.sum(this.p0, p1_dλ);
        this.λ += dλ;

        if (this.type !== "null") {
            const sign = (this.gSign === "spacelike-positive") === (this.type === "spacelike") ? 1 : -1;
            const dτ = dλ * Math.sqrt(sign * this.get_dτ_dλ_sq());
            if (isFinite(dτ))
                this.τ += dτ;
        }

        this.p0 = this.horizJumper(this.p0,this.p1,dλ);

        this.correctP1();
    }
}