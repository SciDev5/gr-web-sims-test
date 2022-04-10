import consts from "../consts";
import Tensor from "../data/Tensor";
import { Gen_g, HorizJumper as AsymptoteJumper, MetricSign, Scale_dλ } from "../GeodesicIntegrator";

export function schwarzchildMetric(rs:number,dims:2|3|4):Gen_g {
    const { c } = consts;

    const genGs = ([
        null,
        null,
        (r0:number,A0:number,A1r:number,a0:number)=>{
            const g0 = Tensor.diag([
                -A0*c*c,
                1/A0
            ],2);
            const  g1 = Tensor.tN([4,4,4],[
                0,0, // 1/dt
                0,0, // see here that black holes are static over time
    
                -A1r*c*c,0,  // 1/dr
                0,-A1r/(A0*A0)
            ]);
            return {g0,g1};
        },
        (r0:number,A0:number,A1r:number,a0:number)=>{
            const g0 = Tensor.diag([
                -A0*c*c,
                1/A0,
                r0**2,
                (r0*Math.sin(a0))**2,
            ],2);
    
            const  g1 = Tensor.tN([4,4,4],[
                0,0,0, // 1/dt
                0,0,0, // see here that black holes are static over time
                0,0,0,
    
                -A1r*c*c,0,0,  // 1/dr
                0,-A1r/(A0*A0),0,
                0,0,2*r0,
    
                0,0,0,
                0,0,0,
                0,0,0,
            ]);
            return {g0,g1};
        },
        (r0:number,A0:number,A1r:number,a0:number)=>{
            const g0 = Tensor.diag([
                -A0*c*c,
                1/A0,
                r0**2,
                (r0*Math.sin(a0))**2,
            ],2);
    
            const  g1 = Tensor.tN([4,4,4],[
                0,0,0,0, // 1/dt
                0,0,0,0, // see here that black holes are static over time
                0,0,0,0,
                0,0,0,0,
    
                -A1r*c*c,0,0,0,  // 1/dr
                0,-A1r/(A0*A0),0,0,
                0,0,2*r0,0,
                0,0,0,2*r0*Math.sin(a0)**2,
    
                0,0,0,0,
                0,0,0,0,
                0,0,0,0,
                0,0,0,r0**2*Math.sin(2*a0),
            
                0,0,0,0,
                0,0,0,0,
                0,0,0,0,
                0,0,0,0
            ]);
            return {g0,g1};
        }
    ] as const)[dims];

    return ({data:[t0,r0,a0,b0]})=>{
        const A0 = 1-rs/r0, A1r = rs/(r0*r0);

        return genGs(r0,A0,A1r,a0);
    };
}

export const schwarzchild_metricSign:MetricSign = "spacelike-positive";

export function schwarzchild_dλScaler(rs:number):Scale_dλ {
    return (
        {data:[t0,r0,a0,b0]},
        {data:[t1,r1,a1,b1]},
        {data:[t2,r2,a2,b2]}
    )=>{
        return Math.min(1,Math.abs((rs-r0)*r0**2),Math.abs(1/r1));
    };
}

export function schwarzchild_aysmptoteJumper(rs:number,drJ_:number):AsymptoteJumper {
    return (p0,p1,dλ)=>{
        const {data:[,r0,...a0]} = p0, {data:[,r1,...a1]} = p1;
        let drJ = 0;
        if (dλ > 0 && r0 > rs && r0 < rs+drJ_)
            drJ = rs-drJ_-r0;
        if (dλ < 0 && r0 < rs && r0 > rs-drJ_)
            drJ = rs+drJ_-r0;
        if (drJ === 0)
            return p0;
        else {
            const dλJ = drJ/r1;
            return Tensor.vec([0,r0+drJ,...a0.map((v0,i)=>v0+dλJ*a1[i])]);
        }
    };
}