//.....................................................Streams of observables
const tasks = {};

tasks.map((task) =>
    Observable.concat(
        Observable.of(1),
        task.filter(() => false).catch((e) => Observable.console.error(doSomthing(e))),
        Observable.of(-1)
    )
        .mergeAll()
        .scan((acc, curr) => acc + curr, 0)
        .map((value) => value === 0)
        .distinctUntilChanged()
);
//.................................................... Streams allowed of observables.
let animationsAllows = {};

let animationsAllowed = true;
animationsAllowed.subscribe((val) => animationsAllows = val);
try {
  doSomething()
} catch (e) {
  
}