export function niceName(name:string):string {
    return name.replace(/\.[^/.]+$/, "").replace(/\_/," ").trim();
}