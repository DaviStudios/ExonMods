function exonObj(initv, func) {
    // Helper function for deep equality check
    function deepEqual(a, b) {
        if (a === b) return true;
        if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        return keysA.every(key => deepEqual(a[key], b[key]));
    }

    // Create a proxy to observe changes
    function createProxy(obj, callback) {
        return new Proxy(obj, {
            set(target, prop, value) {
                if (!deepEqual(target[prop], value)) {
                    const oldValue = target[prop];
                    target[prop] = value;
                    callback(prop, oldValue, value);
                }
                return true;
            }
        });
    }

    // Initialize proxy
    let proxyVal = createProxy(initv, (prop, oldValue, newValue) => {
        func(prop, oldValue, newValue);
    });

    return {
        get: () => proxyVal,
        set: (nval) => {
            if (!deepEqual(proxyVal, nval)) {
                proxyVal = createProxy(nval, (prop, oldValue, newValue) => {
                    func(prop, oldValue, newValue);
                });
                func(null, initv, nval);
                initv = nval; // Update the reference to the new object
            }
        }
    };
}

// Example usage
const myObj = {
    name: 'Alice',
    age: 30
};

const objWatcher = exonObj(myObj, (prop, oldVal, newVal) => {
    if (prop === null) {
        console.log('Object replaced:', oldVal, '->', newVal);
    } else {
        console.log(`Property ${prop} changed from ${oldVal} to ${newVal}`);
    }
});

const myObjRef = objWatcher.get();
myObjRef.name = 'Bob';  // Triggers property change callback
myObjRef.age = 31;      // Triggers property change callback

objWatcher.set({ name: 'Charlie', age: 25 });

console.log(objWatcher.get())
