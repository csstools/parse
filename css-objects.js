CSS = {}

initializeCSSObjects(CSS)

function initializeCSSObjects(CSS) {
	var A = Array
	var F = Function
	var O = Object
	var arrp = A.prototype
	var aIndexOf = arrp.indexOf
	var aJoin = arrp.join
	var aPush = arrp.push
	var aSlice = arrp.slice
	var aSplice = arrp.splice
	var oAssign = O.assign || function (target) {
		for (var i = 0, source; source = ++i in arguments && O(arguments[i]);)
			for (var name in source)
				hasOwnProperty(source, name) && (
					target[name] = source[name]
				)
		return target
	}
	var oCreate = O.create
	CSS.createClass = function (name, Class, Super, proto) {
		name = 'CSS' + name
		Class = CSS[name] = F('a', 'return function ' + name + '(){a.apply(this,arguments)}')(Class)
		proto = O(proto)
		var descriptors = {}
		for (var name in proto.get) descriptors[name] = { configurable: true, get: proto.get[name] }
		for (var name in proto.set) (descriptors[name] = O(descriptors[name])).set = proto.set[name]
		for (var name in proto.value) descriptors[name] = { configurable: true, writable: true, value: proto.value[name] }
		descriptors.constructor = { configurable: true, writable: true, value: Class }
		Class.prototype = oCreate(Super.prototype, descriptors)
		return Class
	}
	var CSSObject = CSS.createClass('Object', function (details) { oAssign(this, { parent: null }, details) }, Object, {
		get: {
			index: function() {
				return CSSBlock.prototype.indexOf.call(O(this.parent), this)
			}
		},
		value: {
			removeSelf: function removeSelf() {
				CSSBlock.prototype.remove.bind(O(this.parent), this)
				return this
			},
			replaceSelf: function replaceSelf() {
				CSSBlock.prototype.replace.bind(O(this.parent), this).apply(null, arguments)
				return this
			}
		}
	})
	var CSSValue = CSS.createClass('Value', CSSObject, CSSObject)
	var CSSDelimiter = CSS.createClass('Delimiter', function (details) { oAssign(this, { parent: null, value: '' }, details) }, CSSValue, {
		value: {
			toString: function toString() {
				return '' + this.value
			}
		}
	})
	var CSSString = CSS.createClass('String', function (details) { oAssign(this, { delimiterStart: '', delimiterEnd: '', value: '' }, details) }, CSSValue, {
		value: {
			toString: function toString() {
				return '' + this.delimiterStart + this.value + this.delimiterEnd
			}
		}
	})
	var CSSList = CSS.createClass('List', function () {
		aPush.apply(this, arguments)
	}, Array, {
		value: {
			toString: function toString() {
				return aJoin.call(this, '')
			}
		}
	})
	var CSSBlock = CSS.createClass('Block', function (details) {
		var value = O(O(details).value)
		oAssign(this, { parent: null, value: new CSSList, delimiterStart: '', delimiterEnd: '' }, details)
		aSplice.bind(O(this.value), 0, O(this.value).length).apply(null, aSlice.call(O(O(details).value)).filter(filterCSSValuesForParent, this))
	}, CSSValue, {
		value: {
			append: function append() {
				aPush.apply(O(this.value), aSlice.call(arguments).filter(filterCSSValuesForParent, this))
			},
			indexOf: function indexOf(indexee) {
				return aIndexOf.call(O(this.value), indexee)
			},
			prepend: function prepend() {
				aSplice.bind(O(this.value), 0, 0).apply(null, aSlice.call(arguments).filter(filterCSSValuesForParent, this))
			},
			remove: function remove(removee) {
				CSSBlock.prototype.replace.call(this, removee)
			},
			replace: function replace(replacee) {
				var index = this.indexOf(replacee)
				if (index > -1) aSplice.bind(this.value, index, 1).apply(null, aSlice.call(arguments, 1).filter(filterCSSValuesForParent, this)).forEach(forEachCSSValueOffParent, this)
			},
			toString: CSSString.prototype.toString
		}
	})
	CSS.createClass('AtIdentifier', CSSDelimiter, CSSValue, {
		value: {
			toString: function toString() {
				return '@' + this.value
			}
		}
	})
	CSS.createClass('Comment', CSSString, CSSValue, {
		value: {
			toString: CSSString.prototype.toString
		}
	})
	CSS.createClass('HashIdentifier', CSSDelimiter, CSSValue, {
		value: {
			toString: function toString() {
				return '#' + this.value
			}
		}
	})
	CSS.createClass('NameIdentifier', CSSDelimiter, CSSValue, {
		value: {
			toString: CSSDelimiter.prototype.toString
		}
	})
	CSS.createClass('Whitespace', CSSDelimiter, CSSValue, {
		value: {
			toString: CSSDelimiter.prototype.toString
		}
	})
	CSS.createClass('Number', function (details) { oAssign(this, { parent: null, value: '', unit: '' }, details) }, CSSValue, {
		value: {
			toString: function toString() {
				return '' + this.value + this.unit
			}
		}
	})
	function filterCSSValuesForParent(node) {
		if (node instanceof CSSValue) return node.parent = this
	}
	function forEachCSSValueOffParent(node) {
		if (O(node).parent === this) return node.parent = null
	}
	return CSS
}

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
