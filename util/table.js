const MaxReducer = (a, b) => a > b ? a : b;

/**
 * Create a Table display of the provided data
 * @param {string[]} headers Column Headers
 * @param  {...string[]} columns Column data
 */
 export function table(headers, ...columns) {
	// Calculate Column Widths
	let widths = [];
	columns.forEach((c, i) => {
		widths[i] = c.concat([headers[i]]).map(s => s.length).reduce(MaxReducer);
	});

	let output = "\n";

	// Write Headers
	headers.forEach((h, i) => {
		output += ` ${h.padEnd(widths[i], " ")} |`;
	});

	output += "\n";

	// Write Separator
	headers.forEach((h, i) => {
		output += `${"".padEnd(widths[i] + 2, "=")}|`;
	});

	output += "\n";

	let rows = columns[0].length;
	for (let row = 0; row < rows; row++) {
		columns.forEach((c, i) => {
			if (c[row] == "-") {
				output += ` ${"".padEnd(widths[i], "-")} |`;
			} else {
				output += ` ${c[row].padEnd(widths[i], " ")} |`;
			}
		});

		output += "\n";
	}

	return output;
}