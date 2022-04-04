import Arr from "../../util/Arr";


export default class Tensor {
    readonly dim: readonly number[];
    readonly data: readonly number[];
    readonly diag: boolean;

    public get isSquare() { return Arr.allEqual(this.dim) }
    public get nComponents() { return this.dim.reduce((a,b)=>a*b,1) }
    private get diagCompInterval() { return Arr.genFromFn(this.dim.length,i=>this.dim[0]**i).reduce((a,b)=>a+b,1) }

    private constructor(dim:readonly number[],data:readonly number[],diag?:boolean) {
        this.dim = dim;
        this.data = data;
        this.diag = diag ?? false;
    }
    
    private arrI(iDim:number[]):number {
        if (this.dim.length !== iDim.length) throw new Error(`(Tensor).arrI: index dimension incorrect: <expected:[${this.dim.length}] got:[${iDim.length}]>`);
        if (this.dim.some((v,i)=>iDim[i]>=v&&iDim[i]<0)) throw new Error(`(Tensor).arrI: index dimension out of range: <dim:[${this.dim}] index:[${iDim}]>`);
        
        if (this.diag) {
            if (Arr.allEqual(iDim))
                return iDim[0];
            else
                return -1;
        } else {
            let interval = 1, i = 0;
            for (let j = 0; j < this.dim.length; j++) {
                i += interval * iDim[j];
                interval *= this.dim[j];
            }
            return i;
        }
    }
    private arrIInv(i:number):number[] {

        if (this.diag)
            return Arr.genFill(this.dim.length,i);
        else {
            if (i>=this.nComponents||i<0) throw new Error(`(Tensor).arrIInv: index dimension out of range: <dim:[${this.nComponents}/${this.dim}] index:[${i}]>`);

            const intervals:number[] = [];
            let interval = 1;
            for (let j = 0; j < this.dim.length; j++) {
                intervals[j] = interval;
                interval *= this.dim[j];
            }

            return this.dim.map((v,i)=>Math.floor(v/intervals[i])%this.dim[i]);
        }
    }
    private dataAt(iDim:number[]):number {
        return this.data[this.arrI(iDim)] ?? 0;
    }

    public diagify():Tensor {
        if (this.diag) return this; // Already diagonal.
        if (this.isSquare) {
            const { diagCompInterval } = this;
            const diagonalComponents = Arr.genFromFn(this.dim.length,i=>this.data[i*diagCompInterval]);

            return new Tensor(this.dim,diagonalComponents,true);
        } else throw new Error("(Tensor).diagify: cannot diagify non square tensor");
        
    }
    public static sum(...ts:Tensor[]):Tensor { // TODO assumes matching dimension.
        if (ts.length === 0) throw new Error("Tensor.sum: cannot sum zero values");
        const dataSummed = Arr.genFill(ts[0].nComponents,0);
        const { diagCompInterval, dim } = ts[0];
        let guarranteedDiag = true;
        for (const t of ts) {
            if (t.diag)
                t.data.forEach((v,i)=>dataSummed[i*diagCompInterval]+=v);
            else {
                guarranteedDiag = false;
                t.data.forEach((v,i)=>dataSummed[i]+=v);
            }
        }
        const data = guarranteedDiag ? Arr.genFromFn(dim[0],i=>dataSummed[diagCompInterval*i]) : dataSummed;

        return new Tensor(dim,data,guarranteedDiag);
    }
    public mul(n:number):Tensor {
        return new Tensor(this.dim,this.data.map(v=>v*n),this.diag);
    }
    public inv():Tensor {
        if (this.diag)
            return new Tensor(this.dim,this.data.map(v=>1/v),this.diag);
        else
            throw new Error("(Tensor).inv: I'm too lazy to figure out how to invert a non-diagonal tensor. deal with it.");
    }

    /**
     * Einstein sum (dies of math, then dies of death)
     * @param z tensor and param set , index by dimensions of t, value of `>=0` gets mapped to new tensor output, value of `<0` gets einstein-summed.
     */
    public static einsteinSum(...tps:{t:Tensor,p:number[]}[]):Tensor {
        for (const {t,p} of tps)
            if (p.length !== t.dim.length) throw new Error(`Tensor.einsteinSum: tensor params did not match rank: <expected:[${t.dim.length}] got:[${p.length}]>`);

        const
            outVarsRaw:EinsteinSumVar[] = [],
            sumVarsRaw:EinsteinSumVar[] = [];

        for (let n = 0; n < tps.length; n++) {
            const {t,p} = tps[n];
            for (let di = 0; di < p.length; di++) {
                const
                    pv = p[di],
                    dimSz = t.dim[di],
                    varInfo = (pv >= 0 ? outVarsRaw[pv] : sumVarsRaw[-1-pv]) ?? {dimSz,tpis:[]};
                
                if (varInfo.dimSz !== dimSz)
                    throw new Error(`Tensor.einsteinSum: tensor params did not match dimensions: <expected:[${t.dim}][${dimSz}] got:[${varInfo.dimSz}]>`);
                
                varInfo.tpis.push({t:n,pi:di});

                if (pv >= 0) outVarsRaw[pv] = varInfo;
                else         sumVarsRaw[-1-pv] = varInfo;
            }
        }

        const
            outVars = outVarsRaw.filter(v=>v!==undefined),
            sumVars = sumVarsRaw.filter(v=>v!==undefined);

        const
            dim    = outVars.map(v=>v.dimSz), 
            sumDim = sumVars.map(v=>v.dimSz),
            dimTensor    = new Tensor(dim,   []), { nComponents }                 = dimTensor, 
            sumDimTensor = new Tensor(sumDim,[]), { nComponents: nComponentsSum } = sumDimTensor;
        
        const data:number[] = [];
            
        const iDim = Arr.genFill(dim.length,0);
        let i = 0;
        while (i < nComponents) {
            const fullCoords:number[][] = Arr.genFromFn(tps.length,_=>[]);
            let v = 0;

            for (let vi = 0; vi < dim.length; vi++) {
                for (const tpi of outVars[vi].tpis)
                    fullCoords[tpi.t][tpi.pi] = iDim[vi];
            }

            const jDim = Arr.genFill(sumDim.length,0);
            let j = 0;
            while (j < nComponentsSum) {
                for (let vj = 0; vj < sumDim.length; vj++) {
                    for (const tpi of sumVars[vj].tpis)
                        fullCoords[tpi.t][tpi.pi] = jDim[vj];
                }
                
                v += fullCoords.map((coord,k)=>tps[k].t.dataAt(coord)).reduce((a,b)=>a*b);
                
                j++;
                jDim[0]++;
                for (let k = 0; k < jDim.length-1; k++) {
                    if (jDim[k] === sumDim[k]) {
                        jDim[k] = 0;
                        jDim[k+1]++;
                    }
                }
            }

            data[i] = v;

            i++;
            iDim[0]++;
            for (let k = 0; k < iDim.length-1; k++) {
                if (iDim[k] === dim[k]) {
                    iDim[k] = 0;
                    iDim[k+1]++;
                }
            }
        }

        return new Tensor(dim,data);
    }
}

type EinsteinSumVar = {dimSz:number,tpis:{t:number,pi:number}[]};