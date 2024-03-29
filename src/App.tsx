import React from "react";
import CR2DSysRenderer from "./render/2d/CR2DSysRenderer";
// import WebGL2SysRenderer from "./render/gl/WebGL2SysRenderer";
// import TestCR2DSystem from "./sims/TestCR2DSystem";
// import TestGLSystem from "./sims/TestGLSystem";

import "./math/data/Tensor";
import SchwarzchildSystem from "./sims/SchwarzchildSystem";

export default class App extends React.Component {
    render(): React.ReactNode {
        return (
            <div className="App">
                <CR2DSysRenderer width={400} height={400} sys={()=>new SchwarzchildSystem()}/>
                {/* <WebGL2SysRenderer width={100} height={100} sys={()=>new TestGLSystem()}/>
                <CR2DSysRenderer width={100} height={100} sys={()=>new TestCR2DSystem()}/> */}
            </div>
        );
    }
}

