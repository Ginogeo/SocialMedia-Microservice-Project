console.log("1> running");

process.nextTick(()=>{
    console.log("2> running");
    
})

setImmediate(()=>{
    console.log("3> running");
})

setTimeout(() => {
    console.log("4> running");
},0);

async function neww(){
    return new Promise((resolve)=>{
        resolve("5> running")
        
    })
}
neww().then((result)=>{
    console.log(result)
})

console.log("6> running");

//1 > 6 > 2> 5> 3>4