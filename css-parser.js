function initializeCSSParser(CSS) {
	CSS.parse = function (cssText) {
		var cssRegExp = /\/\*((?:[^*]|\*[^\/])*)\*\/|([ \t\n\f\r]+)|"((?:[^"\\\n\f\r]|\\\r\n|\\[\W\w])*)("|\n|\f|\r|$)|'((?:[^'\\\n\f\r]|\\\r\n|\\[\W\w])*)('|\n|\f|\r|$)|#((?:[-\w]|[^\x00-\x7F]|\\[^\n\f\r])+)|([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[Ee]-?\d+)?)|(-?(?:[-A-Z_a-z]|[^\x00-\x7F]|\\[^\n\f\r])(?:[-\w]|[^\x00-\x7F]|\\[^\n\f\r])*)|([\uD800-\uDBFF][\uDC00-\uDFFF]|[\W\w])/g
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
		function parser(delimiter, comment, whitespace, stringDoubleQuote, stringDoubleQuoteDelimiterEnd, stringSingleQuote, stringSingleQuoteDelimiterEnd, hashIdentifier, number, nameIdentifier) {
			if (comment !== undefined) parent.append(last = new CSS.CSSComment({ value: comment }))
			else if (whitespace !== undefined) parent.append(last = new CSS.CSSWhitespace({ value: whitespace }))
			else if (stringDoubleQuote !== undefined) parent.append(last = new CSS.CSSString({ value: stringDoubleQuote, delimiterStart: '"', delimiterEnd: stringDoubleQuoteDelimiterEnd }))
			else if (stringSingleQuote !== undefined) parent.append(last = new CSS.CSSString({ value: stringSingleQuote, delimiterStart: "'", delimiterEnd: stringSingleQuoteDelimiterEnd }))
			else if (hashIdentifier !== undefined) parent.append(last = new CSS.CSSHashIdentifier({ value: hashIdentifier }))
			else if (number !== undefined) parent.append(last = new CSS.CSSNumber({ value: number, unit: '' }))
			else if (nameIdentifier !== undefined) {
				if (last instanceof CSS.CSSNumber) last.unit = nameIdentifier
				else if (last.value === '@') parent.replace(last, last = new CSS.CSSAtIdentifier({ value: nameIdentifier }))
				else parent.append(last = new CSS.CSSNameIdentifier({ value: nameIdentifier }))
			} else {
				if (delimiter === '(' && last instanceof CSS.CSSNameIdentifier) parent.replace(last, parent = last = new CSS.CSSFunction({ name: last.value, delimiterStart: delimiter }))
				else if (delimiter === '(' || delimiter === '[' || delimiter === '{') parent.append(last = new CSS.CSSBlock({ delimiterStart: delimiter, parent: parent }))
				else if (
					(delimiter === ')' && parent.delimiterStart === '(') ||
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
