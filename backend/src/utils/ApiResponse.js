class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        Object.defineProperty(this, "statusCode", {
            value: statusCode,
            enumerable: false,
            writable: true,
            configurable: true
        });

        this.success = true;
        this.message = message;
        this.data = data;
    }
}

export { ApiResponse };
