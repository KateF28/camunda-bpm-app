export const takeChangedFormValues = (formFields, event, id, type, value) => {
    let isValidationError;
    formFields.forEach(field => {
        if (field.id === id && type === "string") {
            field.value = event.target.value.toString();
        }
        if (field.id === id && type && type === "boolean") {
            field.value = !value;
        }
        if (field.id === id && type === "long") {
            if (isNaN(event.target.value) || event.target.value.toString().includes(" ")) {
                field.value = event.target.value;
                field.longValidationErr = 'number-error';
                isValidationError = true;
            } else if (event.target.value.toString().includes(".")) {
                field.value = event.target.value;
                field.longValidationErr = 'long-type-integer-error';
                isValidationError = true;
            } else {
                field.value = event.target.value;
                field.longValidationErr = null;
                isValidationError = false;
            }
        }
        if (field.id === id && type === "double") {
            if (isNaN(event.target.value) || event.target.value === "-0.00" || event.target.value.toString().includes(" ")) {
                field.value = event.target.value;
                field.doubleValidationErr = 'number-error';
                isValidationError = true;
            } else if (!/^-?[0-9]+[.][0-9]{2}$/.test(event.target.value)) {
                field.value = event.target.value;
                field.doubleValidationErr = 'double-type-integer-error';
                isValidationError = true;
            } else {
                field.value = event.target.value;
                field.doubleValidationErr = null;
                isValidationError = false;
            }
        }
        if (field.id === id && type && type === "enum") {
            // console.log("select e.target.value", event.target.value)
            field.value = event.target.value;
        }
        if (field.id === id && type && type === "date") {
            field.value = value.value;
            // console.dir(field.value);
        }
        return field;
    });
    return [isValidationError, formFields];
}
