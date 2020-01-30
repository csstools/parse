CSS = {}

initializeCSSObjects(CSS)

function initializeCSSObjects(CSS) {
	var A = Array
	var F = Function
	var O = Object
	var arrp = A.prototype
	var aJoin = arrp.join
	var aPush = arrp.push
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
	var CSSObject = CSS.createClass('Object', function (details) { oAssign(this, details) }, Object)
	var CSSValue = CSS.createClass('Value', CSSObject, CSSObject)
	var CSSDelimiter = CSS.createClass('Delimiter', function (details) { oAssign(this, { value: '' }, details) }, CSSValue, {
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
				return aJoin.call(O(this.value))
			}
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
	CSS.createClass('Number', function (details) { oAssign(this, { value: '', unit: '' }, details) }, CSSValue, {
		value: {
			toString: function toString() {
				return '' + this.value + this.unit
			}
		}
	})
	CSS.createClass('Block', function (details) {
		oAssign(this, { value: new CSSList, delimiterStart: '', delimiterEnd: '' }, details)
	}, CSSValue, {
		value: {
			toString: function toString() {
				aJoin.call(this, '')
			}
		}
	})
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
	(new CSS.CSSList(
		new CSS.CSSWhitespace('\n\t'),
		new CSS.CSSNameIdentifier('color'),
		new CSS.CSSDelimiter(':'),
		new CSS.CSSWhitespace(' '),
		new CSS.CSSNameIdentifier('blue'),
		new CSS.CSSWhitespace('\n'),
	))
])
