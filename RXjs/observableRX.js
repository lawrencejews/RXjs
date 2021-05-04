class Observable {
    constructor(subscribe) {
        this._subscribe = subscribe;
    }
    subscrible() {
        return this._subscribe(observer);
    }
    // ................................................................Retry observable for error data stream
    retry(num) {
        return new Observable(function subscribe(observer) {
            let currentSub;
            const processRequest = (currentAttemptNumber) => {
                currentSub = self.subscribe({
                    next(v) {
                        observer.next(v);
                    },
                    complete() {
                        observer.complete();
                    },
                    error(err) {
                        if (currentAttemptNumber === 0) {
                            observer.error();
                        } else {
                            processRequest(currentAttemptNumber - 1);
                        }
                    },
                });
            };
            processRequest(num);
            return {
                unsubscribe() {
                    currentSub.unsubscribe();
                },
            };
        });
    }
    //...............................................................Concat with observables.
    static concat(...observables) {
        return new Observable(function subscribe(observer) {
            let myObservables = observables.slice();
            let currentSubcription = null;
            let processObservable = () => {
                if (myObservables.length === 0) {
                    observable.complete();
                } else {
                    let observable = myObservables.shift();
                    currentSubcription = observable.subscribe({
                        next(v) {
                            observer.next(v);
                        },
                        error(err) {
                            observer.error(err);
                            currentSubcription.unsubscribe();
                        },
                        complete() {
                            processObservable();
                        },
                    });
                }
                processObservable();
                return {
                    unsubscribe() {
                        currentSubcription.unsubscribe();
                    },
                };
            };
        });
    }
    //..............................................................Set timeout for a subscription.
    static timeout(time) {
        return new Observable(function subscribe(observer) {
            const handle = setTimeout(function () {
                observer.next();
                observer.complete();
            }, time);
            return {
                unsubscribe() {
                    clearTimeout(handle);
                },
            };
        });
    }
    //.............................................................. Data stream into Hot observable.
    static fromEvent(dom, eventName) {
        return new Observable(function subscribe(observer) {
            const handler = (e) => {
                observer.next(e);
            };
            dom.addEventListener(eventName, handler);
            return {
                unsubscribe() {
                    dom.removeEventListener(eventName);
                },
            };
        });
    }
    //................................................................Map function with observables.
    map(projection) {
        const self = this;
        return new Observable(function subscribe(observer) {
            const subscription = self.subscribe({
                next(v) {
                    observer.next(projection(v));
                },
                error(err) {
                    observer.error(err);
                },
            });
            return subscription;
        });
    }
    //................................................................Filter function with observables.
    filter(predicate) {
        const self = this;
        return new Observable(function subscribe(observer) {
            const subscription = self.subscribe({
                next(v) {
                    if (predicate(v)) {
                        observer.next(v);
                    }
                },
                error(err) {
                    observer.error(err);
                },
            });
            return subscription;
        });
  }
  //.................................................................Share observable for Users subscribing
    share() {
        const subject = new Subject();
        this.subscribe(subject);
        return subject;
    }
}

//..................................................................Subjects with Observables
class Subject extends Observable {
    constructor() {
        super(function subscribe(observer) {
            const self = this;
            self.observers.add(observer);
            return {
                unsubscribe() {
                    self.observers.delete(observer);
                },
            };
        });
        this.observers = new Set();
    }
    next(v) {
        for (let observer of [...this.observers]) {
            observer.next(v);
        }
    }
    error(v) {
        for (let observer of [...this.observers]) {
            observer.error(v);
        }
    }
    complete(v) {
        for (let observer of [...this.observers]) {
            observer.complete(v);
        }
    }
}
//............................................................Calling for a Request
const obs = Observable.timeout(500);
obs.subscribe({
    next(v) {
        console.log("next");
    },
    complete() {
        console.log("done");
    },
});
