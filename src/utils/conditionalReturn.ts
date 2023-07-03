// This is a TypeScript function called "conditionalReturn" that takes in a generic type "T",
// a boolean "condition", a value of type "T" or undefined "value", and an optional "falseConditionReturnValue" of type "T"
const conditionalReturn = <T>(condition: boolean, value: T | undefined, falseConditionReturnValue?: T): T => {
    // If the "value" parameter is undefined, return the "falseConditionReturnValue" parameter if it exists,
    // otherwise return an empty array or object depending on whether the generic type "T" is an array or an object
    if (value === undefined) {
        return falseConditionReturnValue !== undefined ? falseConditionReturnValue : ((Array.isArray(value) ? [] : {}) as T);
    }

    // If the "condition" parameter is true, return the "value" parameter
    if (condition) {
        return value;
    }

    // If the "condition" parameter is false, return the "falseConditionReturnValue" parameter if it exists,
    // otherwise return an empty array or object depending on whether the generic type "T" is an array or an object
    return falseConditionReturnValue !== undefined ? falseConditionReturnValue : ((Array.isArray(value) ? [] : {}) as T);
};

export default conditionalReturn;

/* 
* Example usage of the "conditionalReturn" function
* If "condition" is true, return "value"
* If "condition" is false, return an empty object
const myObject = conditionalReturn(true, { foo: "bar" }); // Returns { foo: "bar" }

*/
