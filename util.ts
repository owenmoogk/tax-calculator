export function round(x: number, decimals: number = 2) {
	return parseFloat(x.toFixed(decimals));
}

export function NonNegativeFirstArg(
	target: Object,
	propertyKey: string | symbol,
	descriptor: PropertyDescriptor
): void {
	const originalMethod = descriptor.value;

	descriptor.value = function (...args: any[]) {
		if (args.length > 0 && typeof args[0] === "number" && args[0] < 0) {
			const className = this.constructor?.name ?? "UnknownClass";
			throw new Error(
				`First argument to ${className}.${String(propertyKey)} must be non-negative.`
			);
		}
		return originalMethod.apply(this, args);
	};
}