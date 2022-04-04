export default class Arr {
    public static allEqual<T>(arr:T[]|readonly T[],comparator:(a:T,b:T)=>boolean=(a,b)=>a===b):boolean {
        return arr.every(v=>comparator(v,arr[0]));
    }
    public static genFromFn<T>(n:number,fn:(i:number)=>T):T[] {
        return new Array(n).fill(null).map((_,i)=>fn(i));
    }
    public static genFill<T>(n:number,v:T):T[] {
        return new Array(n).fill(v);
    }
}