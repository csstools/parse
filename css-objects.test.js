
console.log([
	'' + new CSS.CSSComment({ value: ' test ', delimiterStart: '/*', delimiterEnd: '*/' }) === '/* test */',
	'' + new CSS.CSSWhitespace({ value: '\n' }) === '\n',
	'' + new CSS.CSSString({ value: 'test', delimiterStart: '"', delimiterEnd: '"' }) === '"test"',
	'' + new CSS.CSSNameIdentifier({ value: 'test' }) === 'test',
	'' + new CSS.CSSHashIdentifier({ value: 'test' }) === '#test',
	'' + new CSS.CSSAtIdentifier({ value: 'test' }) === '@test',
	'' + new CSS.CSSNumber({ value: '5', unit: 'px' }) === '5px',
	'' + new CSS.CSSBlock({
		value: new CSS.CSSList(
			new CSS.CSSWhitespace({ value: '\n\t' }),
			new CSS.CSSNameIdentifier({ value: 'color' }),
			new CSS.CSSDelimiter({ value: ':' }),
			new CSS.CSSWhitespace({ value: ' ' }),
			new CSS.CSSNameIdentifier({ value: 'blue' }),
			new CSS.CSSWhitespace({ value: '\n' }),
		),
		delimiterStart: '{',
		delimiterEnd: '}'
	}) === '{\n\tcolor: blue\n}'
])

var cssb = new CSS.CSSBlock({
	value: new CSS.CSSList(
		new CSS.CSSNameIdentifier({ value: 'color' }),
		new CSS.CSSDelimiter({ value: ':' })
	),
	delimiterStart: '',
	delimiterEnd: ''
})

cssb.walk(function (node, index) {
	console.log('node', index)
})

cssnib = new CSS.CSSNameIdentifier({ value: 'blue' })
cssnir = new CSS.CSSNameIdentifier({ value: 'rebeccapurple' })

cssb.append(
	new CSS.CSSWhitespace({ value: ' ' }),
	cssnib
)
console.log([ cssnib.index === 3, cssnir.index === -1 ])
console.log([ cssnib.parent === cssb, cssnir.parent === null ])

cssb.replace(cssnib, cssnir)

console.log([ '' + cssb === 'color: rebeccapurple' ])
console.log([ cssnib.index === -1, cssnir.index === 3 ])
console.log([ cssnib.parent === null, cssnir.parent === cssb ])

cssb.remove(cssnir)
console.log([ '' + cssb === 'color: ' ])
console.log([ cssb.value[0] === cssb.value[0].removeSelf() ])
console.log([ '' + cssb === 'color: ' ])
