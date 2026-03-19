console.log("test");
const outer = "outer boundary";
function f(x) {
    console.log(outer);
    return x*x; 
}

let y = f(5);

setTimeout(() => {
    console.log("timeout");
    f(10);
}, 1000);



