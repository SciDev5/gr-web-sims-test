export default class DeltaTime {
    private t:number;
    constructor() {
        this.t = performance.now();
    }
    public get(updateT=true):number {
        const t = performance.now(), dt = t-this.t;
        if (updateT) this.t = t;
        return dt;
    }
    public update() {
        this.t = performance.now();
    }
    public get dt() { return this.get() }
}