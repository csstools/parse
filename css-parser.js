parse = {}

parse.value = function (cssText) {
	var cssRegExp = /\/\*((?:[^*]|\*[^\/])*)\*\/|([ \t\n\f\r]+)|"((?:[^"\\\n\f\r]|\\\r\n|\\[\W\w])*)|'((?:[^'\\\n\f\r]|\\\r\n|\\[\W\w])*)|#((?:[-\w]|[^\x00-\x7F]|\\[^\n\f\r])+)|([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[Ee]-?\d+)?)|(-?(?:[-A-Z_a-z]|[^\x00-\x7F]|\\[^\n\f\r])(?:[-\w]|[^\x00-\x7F]|\\[^\n\f\r])*)|([\uD800-\uDBFF][\uDC00-\uDFFF]|[\W\w])/g
	var cssMatches
	var root = new nodes.CSSBlock
	var parent = root
	var last
	while ((cssMatches = cssRegExp.exec(cssText)) !== null) {
		// the regex includes a `lastIndex` property, critical for building source maps
		// the matches spread nicely into a function
		parser.apply(cssRegExp, cssMatches);
	}
	function parser(delimiter, comment, whitespace, stringDoubleQuoted, stringSingleQuoted, hashIdentifier, number, namedIdentifier) {
		if (comment !== undefined) parent.append(new nodes.CSSComment({ value: comment }))
		else if (whitespace !== undefined) parent.append(new nodes.CSSWhitespace({ value: whitespace }))
		else if (stringDoubleQuoted !== undefined) parent.append(new nodes.CSSString, stringDoubleQuoted).delimiterStart = '"'
		else if (stringSingleQuoted !== undefined) parent.append(new nodes.CSSString, stringDoubleQuoted).delimiterStart = "'"
		else if (hashIdentifier !== undefined) parent.append(new nodes.CSSHashIdentifier({ value: hashIdentifier }))
		else if (number !== undefined) parent.append(new nodes.CSSNumber({ value: number, unit: '' }))
		else if (namedIdentifier !== undefined) {
			if (last instanceof nodes.CSSNumber) last.unit = namedIdentifier
			else if (last.value === '@') parent.replace(last, new nodes.CSSAtIdentifier({ value: namedIdentifier }))
			else parent.append(new nodes.CSSNameIdentifier, namedIdentifier)
		} else {
			if (delimiter === '(' && last instanceof nodes.CSSNameIdentifier) parent.replace(last, last =  new nodes.CSSFunction({ name: last.value }))
			else if (delimiter === '(' || delimiter === '[' || delimiter === '{') parent.append(last = new nodes.CSSBlock({ delimiterStart: delimiter, parent: parent }))
			else if (
				(delimiter === '(' && parent.delimiterStart === '(') ||
				(delimiter === ']' && parent.delimiterStart === '[') ||
				(delimiter === '}' && parent.delimiterStart === '}')
			) {
				parent.delimiterEnd = delimiter
				parent = parent
			} else parent.append(last = new nodes.CSSDelimiter({ value: delimiter }))
		}
	}
}
