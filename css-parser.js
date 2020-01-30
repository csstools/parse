function initializeCSSParser(CSS) {
	CSS.parse = function (cssText) {
		var cssRegExp = /\/\*((?:[^*]|\*[^\/])*)\*\/|([ \t\n\f\r]+)|"((?:[^"\\\n\f\r]|\\\r\n|\\[\W\w])*)|'((?:[^'\\\n\f\r]|\\\r\n|\\[\W\w])*)|#((?:[-\w]|[^\x00-\x7F]|\\[^\n\f\r])+)|([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[Ee]-?\d+)?)|(-?(?:[-A-Z_a-z]|[^\x00-\x7F]|\\[^\n\f\r])(?:[-\w]|[^\x00-\x7F]|\\[^\n\f\r])*)|([\uD800-\uDBFF][\uDC00-\uDFFF]|[\W\w])/g
		var cssMatches
		var root = new CSS.CSSBlock
		var parent = root
		var last = {}
		while ((cssMatches = cssRegExp.exec(cssText)) !== null) {
			// the regex includes a `lastIndex` property, critical for building source maps
			// the matches spread nicely into a function
			parser.apply(cssRegExp, cssMatches);
		}
		return root
		function parser(delimiter, comment, whitespace, stringDoubleQuoted, stringSingleQuoted, hashIdentifier, number, namedIdentifier) {
			if (comment !== undefined) parent.append(new CSS.CSSComment({ value: comment }))
			else if (whitespace !== undefined) parent.append(new CSS.CSSWhitespace({ value: whitespace }))
			else if (stringDoubleQuoted !== undefined) parent.append(new CSS.CSSString, stringDoubleQuoted).delimiterStart = '"'
			else if (stringSingleQuoted !== undefined) parent.append(new CSS.CSSString, stringDoubleQuoted).delimiterStart = "'"
			else if (hashIdentifier !== undefined) parent.append(new CSS.CSSHashIdentifier({ value: hashIdentifier }))
			else if (number !== undefined) parent.append(new CSS.CSSNumber({ value: number, unit: '' }))
			else if (namedIdentifier !== undefined) {
				if (last instanceof CSS.CSSNumber) last.unit = namedIdentifier
				else if (last.value === '@') parent.replace(last, last = new CSS.CSSAtIdentifier({ value: namedIdentifier }))
				else parent.append(new CSS.CSSNameIdentifier({ value: namedIdentifier }))
			} else {
				if (delimiter === '(' && last instanceof CSS.CSSNameIdentifier) parent.replace(last, last =  new CSS.CSSFunction({ name: last.value }))
				else if (delimiter === '(' || delimiter === '[' || delimiter === '{') parent.append(last = new CSS.CSSBlock({ delimiterStart: delimiter, parent: parent }))
				else if (
					(delimiter === '(' && parent.delimiterStart === '(') ||
					(delimiter === ']' && parent.delimiterStart === '[') ||
					(delimiter === '}' && parent.delimiterStart === '}')
				) {
					parent.delimiterEnd = delimiter
					parent = parent
				} else parent.append(last = new CSS.CSSDelimiter({ value: delimiter }))
			}
		}
	}
	return CSS
}
