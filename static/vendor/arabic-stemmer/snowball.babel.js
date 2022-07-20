(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define('snowballFactory', ['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.snowballFactory = mod.exports;
    }
})(this, function (exports) {
    /*!
     * Snowball JavaScript Library v0.6
     * http://snowball.tartarus.org/
     * https://github.com/mazko/jssnowball
     *
     * Copyright 12.03.2016 16:16:30, Oleg Mazko
     * http://www.opensource.org/licenses/bsd-license.html
     */
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.newStemmer = newStemmer;
    exports.algorithms = algorithms;

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var _get = function get(object, property, receiver) {
        if (object === null) object = Function.prototype;
        var desc = Object.getOwnPropertyDescriptor(object, property);

        if (desc === undefined) {
            var parent = Object.getPrototypeOf(object);

            if (parent === null) {
                return undefined;
            } else {
                return get(parent, property, receiver);
            }
        } else if ("value" in desc) {
            return desc.value;
        } else {
            var getter = desc.get;

            if (getter === undefined) {
                return undefined;
            }

            return getter.call(receiver);
        }
    };

    var StringBuffer = function () {
        function StringBuffer() {
            _classCallCheck(this, StringBuffer);
        }

        _createClass(StringBuffer, [{
            key: 'length$esjava$0',
            value: function length$esjava$0() {
                return this.b.length;
            }
        }, {
            key: 'replace$esjava$3',
            value: function replace$esjava$3(start, end, str) {
                if (start === 0 && end === this.b.length) {
                    this.b = str;
                } else {
                    var left = this.b.substring(0, start),
                        right = this.b.substring(end);
                    this.b = left + str + right;
                }
            }
        }, {
            key: 'substring$esjava$2',
            value: function substring$esjava$2(start, end) {
                return this.b.substring(start, end);
            }
        }, {
            key: 'charAt$esjava$1',
            value: function charAt$esjava$1(index) {
                return this.b.charCodeAt(index);
            }
        }, {
            key: 'subSequence$esjava$2',
            value: function subSequence$esjava$2(start, end) {
                throw new Error("NotImpl: CharSequence::subSequence");
            }
        }, {
            key: 'toString$esjava$0',
            value: function toString$esjava$0() {
                return this.b;
            }
        }, {
            key: 'length',
            value: function length() {
                var _get2;

                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                switch (args.length) {
                    case 0:
                        return this.length$esjava$0.apply(this, args);
                }
                return (_get2 = _get(Object.getPrototypeOf(StringBuffer.prototype), 'length', this)).call.apply(_get2, [this].concat(args));
            }
        }, {
            key: 'replace',
            value: function replace() {
                var _get3;

                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    args[_key2] = arguments[_key2];
                }

                switch (args.length) {
                    case 3:
                        return this.replace$esjava$3.apply(this, args);
                }
                return (_get3 = _get(Object.getPrototypeOf(StringBuffer.prototype), 'replace', this)).call.apply(_get3, [this].concat(args));
            }
        }, {
            key: 'substring',
            value: function substring() {
                var _get4;

                for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                    args[_key3] = arguments[_key3];
                }

                switch (args.length) {
                    case 2:
                        return this.substring$esjava$2.apply(this, args);
                }
                return (_get4 = _get(Object.getPrototypeOf(StringBuffer.prototype), 'substring', this)).call.apply(_get4, [this].concat(args));
            }
        }, {
            key: 'charAt',
            value: function charAt() {
                var _get5;

                for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                    args[_key4] = arguments[_key4];
                }

                switch (args.length) {
                    case 1:
                        return this.charAt$esjava$1.apply(this, args);
                }
                return (_get5 = _get(Object.getPrototypeOf(StringBuffer.prototype), 'charAt', this)).call.apply(_get5, [this].concat(args));
            }
        }, {
            key: 'subSequence',
            value: function subSequence() {
                var _get6;

                for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                    args[_key5] = arguments[_key5];
                }

                switch (args.length) {
                    case 2:
                        return this.subSequence$esjava$2.apply(this, args);
                }
                return (_get6 = _get(Object.getPrototypeOf(StringBuffer.prototype), 'subSequence', this)).call.apply(_get6, [this].concat(args));
            }
        }, {
            key: 'toString',
            value: function toString() {
                var _get7;

                for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                    args[_key6] = arguments[_key6];
                }

                switch (args.length) {
                    case 0:
                        return this.toString$esjava$0.apply(this, args);
                }
                return (_get7 = _get(Object.getPrototypeOf(StringBuffer.prototype), 'toString', this)).call.apply(_get7, [this].concat(args));
            }
        }, {
            key: 'b',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$b') ? this._$esjava$b : this._$esjava$b = "";
            },
            set: function set(v) {
                this._$esjava$b = v;
            }
        }]);

        return StringBuffer;
    }();

    var StringBuilder = function (_StringBuffer) {
        _inherits(StringBuilder, _StringBuffer);

        function StringBuilder() {
            _classCallCheck(this, StringBuilder);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(StringBuilder).apply(this, arguments));
        }

        return StringBuilder;
    }(StringBuffer);

    var Among = function () {
        _createClass(Among, null, [{
            key: 'toCharArray$esjava$1',
            value: function toCharArray$esjava$1(s) {
                var sLength = s.length;
                var charArr = new Array(sLength);
                for (var i = 0; i < sLength; i++) {
                    charArr[i] = s.charCodeAt(i);
                }return charArr;
            }
        }]);

        function Among(s, substring_i, result, methodname, obj) {
            _classCallCheck(this, Among);

            this.s = Among.toCharArray$esjava$1(s);
            this.substring_i = substring_i;
            this.result = result;
            this.method = methodname ? obj[methodname] : null;
            this.methodobject = obj;
        }

        _createClass(Among, [{
            key: 's',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$s') ? this._$esjava$s : this._$esjava$s = null;
            },
            set: function set(v) {
                this._$esjava$s = v;
            }
        }, {
            key: 'substring_i',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$substring_i') ? this._$esjava$substring_i : this._$esjava$substring_i = 0;
            },
            set: function set(v) {
                this._$esjava$substring_i = v;
            }
        }, {
            key: 'result',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$result') ? this._$esjava$result : this._$esjava$result = 0;
            },
            set: function set(v) {
                this._$esjava$result = v;
            }
        }, {
            key: 'method',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$method') ? this._$esjava$method : this._$esjava$method = null;
            },
            set: function set(v) {
                this._$esjava$method = v;
            }
        }, {
            key: 'methodobject',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$methodobject') ? this._$esjava$methodobject : this._$esjava$methodobject = null;
            },
            set: function set(v) {
                this._$esjava$methodobject = v;
            }
        }]);

        return Among;
    }();

    var SnowballProgram = function () {
        function SnowballProgram() {
            _classCallCheck(this, SnowballProgram);

            this.current = new StringBuffer();
            this.setCurrent$esjava$1("");
        }

        _createClass(SnowballProgram, [{
            key: 'setCurrent$esjava$1',
            value: function setCurrent$esjava$1(value) {
                this.current.replace(0, this.current.length(), value);
                this.cursor = 0;
                this.limit = this.current.length();
                this.limit_backward = 0;
                this.bra = this.cursor;
                this.ket = this.limit;
            }
        }, {
            key: 'getCurrent$esjava$0',
            value: function getCurrent$esjava$0() {
                var result = this.current.toString();
                this.current = new StringBuffer();
                return result;
            }
        }, {
            key: 'in_grouping$esjava$3',
            value: function in_grouping$esjava$3(s, min, max) {
                if (this.cursor >= this.limit) return false;
                var ch = this.current.charAt(this.cursor);
                if (ch > max || ch < min) return false;
                ch -= min;
                if ((s[ch >> 3] & 0X1 << (ch & 0X7)) === 0) return false;
                this.cursor++;
                return true;
            }
        }, {
            key: 'in_grouping_b$esjava$3',
            value: function in_grouping_b$esjava$3(s, min, max) {
                if (this.cursor <= this.limit_backward) return false;
                var ch = this.current.charAt(this.cursor - 1);
                if (ch > max || ch < min) return false;
                ch -= min;
                if ((s[ch >> 3] & 0X1 << (ch & 0X7)) === 0) return false;
                this.cursor--;
                return true;
            }
        }, {
            key: 'out_grouping$esjava$3',
            value: function out_grouping$esjava$3(s, min, max) {
                if (this.cursor >= this.limit) return false;
                var ch = this.current.charAt(this.cursor);
                if (ch > max || ch < min) {
                    this.cursor++;
                    return true;
                }
                ch -= min;
                if ((s[ch >> 3] & 0X1 << (ch & 0X7)) === 0) {
                    this.cursor++;
                    return true;
                }
                return false;
            }
        }, {
            key: 'out_grouping_b$esjava$3',
            value: function out_grouping_b$esjava$3(s, min, max) {
                if (this.cursor <= this.limit_backward) return false;
                var ch = this.current.charAt(this.cursor - 1);
                if (ch > max || ch < min) {
                    this.cursor--;
                    return true;
                }
                ch -= min;
                if ((s[ch >> 3] & 0X1 << (ch & 0X7)) === 0) {
                    this.cursor--;
                    return true;
                }
                return false;
            }
        }, {
            key: 'eq_s$esjava$1',
            value: function eq_s$esjava$1(s) {
                if (this.limit - this.cursor < s.length) return false;
                var i = void 0;
                for (i = 0; i !== s.length; i++) {
                    if (this.current.charAt(this.cursor + i) !== s.charCodeAt(i)) return false;
                }
                this.cursor += s.length;
                return true;
            }
        }, {
            key: 'eq_s_b$esjava$1',
            value: function eq_s_b$esjava$1(s) {
                if (this.cursor - this.limit_backward < s.length) return false;
                var i = void 0;
                for (i = 0; i !== s.length; i++) {
                    if (this.current.charAt(this.cursor - s.length + i) !== s.charCodeAt(i)) return false;
                }
                this.cursor -= s.length;
                return true;
            }
        }, {
            key: 'find_among$esjava$1',
            value: function find_among$esjava$1(v) {
                var i = 0;
                var j = v.length;
                var c = this.cursor;
                var l = this.limit;
                var common_i = 0;
                var common_j = 0;
                var first_key_inspected = false;
                while (true) {
                    var k = i + (j - i >> 1);
                    var diff = 0;
                    var common = common_i < common_j ? common_i : common_j;
                    var w = v[k];
                    var i2 = void 0;
                    for (i2 = common; i2 < w.s.length; i2++) {
                        if (c + common === l) {
                            diff = -1;
                            break;
                        }
                        diff = this.current.charAt(c + common) - w.s[i2];
                        if (diff !== 0) break;
                        common++;
                    }
                    if (diff < 0) {
                        j = k;
                        common_j = common;
                    } else {
                        i = k;
                        common_i = common;
                    }
                    if (j - i <= 1) {
                        if (i > 0) break;
                        if (j === i) break;
                        if (first_key_inspected) break;
                        first_key_inspected = true;
                    }
                }
                while (true) {
                    var _w = v[i];
                    if (common_i >= _w.s.length) {
                        this.cursor = c + _w.s.length;
                        if (_w.method === null) return _w.result;
                        var res = void 0;
                        res = _w.method.call(_w.methodobject);
                        this.cursor = c + _w.s.length;
                        if (res) return _w.result;
                    }
                    i = _w.substring_i;
                    if (i < 0) return 0;
                }
            }
        }, {
            key: 'find_among_b$esjava$1',
            value: function find_among_b$esjava$1(v) {
                var i = 0;
                var j = v.length;
                var c = this.cursor;
                var lb = this.limit_backward;
                var common_i = 0;
                var common_j = 0;
                var first_key_inspected = false;
                while (true) {
                    var k = i + (j - i >> 1);
                    var diff = 0;
                    var common = common_i < common_j ? common_i : common_j;
                    var w = v[k];
                    var i2 = void 0;
                    for (i2 = w.s.length - 1 - common; i2 >= 0; i2--) {
                        if (c - common === lb) {
                            diff = -1;
                            break;
                        }
                        diff = this.current.charAt(c - 1 - common) - w.s[i2];
                        if (diff !== 0) break;
                        common++;
                    }
                    if (diff < 0) {
                        j = k;
                        common_j = common;
                    } else {
                        i = k;
                        common_i = common;
                    }
                    if (j - i <= 1) {
                        if (i > 0) break;
                        if (j === i) break;
                        if (first_key_inspected) break;
                        first_key_inspected = true;
                    }
                }
                while (true) {
                    var _w2 = v[i];
                    if (common_i >= _w2.s.length) {
                        this.cursor = c - _w2.s.length;
                        if (_w2.method === null) return _w2.result;
                        var res = void 0;
                        res = _w2.method.call(_w2.methodobject);
                        this.cursor = c - _w2.s.length;
                        if (res) return _w2.result;
                    }
                    i = _w2.substring_i;
                    if (i < 0) return 0;
                }
            }
        }, {
            key: 'replace_s$esjava$3',
            value: function replace_s$esjava$3(c_bra, c_ket, s) {
                var adjustment = s.length - (c_ket - c_bra);
                this.current.replace(c_bra, c_ket, s);
                this.limit += adjustment;
                if (this.cursor >= c_ket) this.cursor += adjustment;else if (this.cursor > c_bra) this.cursor = c_bra;
                return adjustment;
            }
        }, {
            key: 'slice_check$esjava$0',
            value: function slice_check$esjava$0() {
                if (this.bra < 0 || this.bra > this.ket || this.ket > this.limit || this.limit > this.current.length()) {
                    throw new Error("Snowball: faulty slice operation");
                }
            }
        }, {
            key: 'slice_from$esjava$1',
            value: function slice_from$esjava$1(s) {
                this.slice_check$esjava$0();
                this.replace_s$esjava$3(this.bra, this.ket, s);
            }
        }, {
            key: 'slice_del$esjava$0',
            value: function slice_del$esjava$0() {
                this.slice_from$esjava$1("");
            }
        }, {
            key: 'insert$esjava$3',
            value: function insert$esjava$3(c_bra, c_ket, s) {
                var adjustment = this.replace_s$esjava$3(c_bra, c_ket, s);
                if (c_bra <= this.bra) this.bra += adjustment;
                if (c_bra <= this.ket) this.ket += adjustment;
            }
        }, {
            key: 'slice_to$esjava$1',
            value: function slice_to$esjava$1(s) {
                this.slice_check$esjava$0();
                s.replace(0, s.length(), this.current.substring(this.bra, this.ket));
                return s;
            }
        }, {
            key: 'setCurrent',
            value: function setCurrent() {
                var _get8;

                for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
                    args[_key7] = arguments[_key7];
                }

                switch (args.length) {
                    case 1:
                        return this.setCurrent$esjava$1.apply(this, args);
                }
                return (_get8 = _get(Object.getPrototypeOf(SnowballProgram.prototype), 'setCurrent', this)).call.apply(_get8, [this].concat(args));
            }
        }, {
            key: 'getCurrent',
            value: function getCurrent() {
                var _get9;

                for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
                    args[_key8] = arguments[_key8];
                }

                switch (args.length) {
                    case 0:
                        return this.getCurrent$esjava$0.apply(this, args);
                }
                return (_get9 = _get(Object.getPrototypeOf(SnowballProgram.prototype), 'getCurrent', this)).call.apply(_get9, [this].concat(args));
            }
        }, {
            key: 'in_grouping',
            value: function in_grouping() {
                var _get10;

                for (var _len9 = arguments.length, args = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
                    args[_key9] = arguments[_key9];
                }

                switch (args.length) {
                    case 3:
                        return this.in_grouping$esjava$3.apply(this, args);
                }
                return (_get10 = _get(Object.getPrototypeOf(SnowballProgram.prototype), 'in_grouping', this)).call.apply(_get10, [this].concat(args));
            }
        }, {
            key: 'in_grouping_b',
            value: function in_grouping_b() {
                var _get11;

                for (var _len10 = arguments.length, args = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
                    args[_key10] = arguments[_key10];
                }

                switch (args.length) {
                    case 3:
                        return this.in_grouping_b$esjava$3.apply(this, args);
                }
                return (_get11 = _get(Object.getPrototypeOf(SnowballProgram.prototype), 'in_grouping_b', this)).call.apply(_get11, [this].concat(args));
            }
        }, {
            key: 'out_grouping',
            value: function out_grouping() {
                var _get12;

                for (var _len11 = arguments.length, args = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
                    args[_key11] = arguments[_key11];
                }

                switch (args.length) {
                    case 3:
                        return this.out_grouping$esjava$3.apply(this, args);
                }
                return (_get12 = _get(Object.getPrototypeOf(SnowballProgram.prototype), 'out_grouping', this)).call.apply(_get12, [this].concat(args));
            }
        }, {
            key: 'out_grouping_b',
            value: function out_grouping_b() {
                var _get13;

                for (var _len12 = arguments.length, args = Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
                    args[_key12] = arguments[_key12];
                }

                switch (args.length) {
                    case 3:
                        return this.out_grouping_b$esjava$3.apply(this, args);
                }
                return (_get13 = _get(Object.getPrototypeOf(SnowballProgram.prototype), 'out_grouping_b', this)).call.apply(_get13, [this].concat(args));
            }
        }, {
            key: 'eq_s',
            value: function eq_s() {
                var _get14;

                for (var _len13 = arguments.length, args = Array(_len13), _key13 = 0; _key13 < _len13; _key13++) {
                    args[_key13] = arguments[_key13];
                }

                switch (args.length) {
                    case 1:
                        return this.eq_s$esjava$1.apply(this, args);
                }
                return (_get14 = _get(Object.getPrototypeOf(SnowballProgram.prototype), 'eq_s', this)).call.apply(_get14, [this].concat(args));
            }
        }, {
            key: 'eq_s_b',
            value: function eq_s_b() {
                var _get15;

                for (var _len14 = arguments.length, args = Array(_len14), _key14 = 0; _key14 < _len14; _key14++) {
                    args[_key14] = arguments[_key14];
                }

                switch (args.length) {
                    case 1:
                        return this.eq_s_b$esjava$1.apply(this, args);
                }
                return (_get15 = _get(Object.getPrototypeOf(SnowballProgram.prototype), 'eq_s_b', this)).call.apply(_get15, [this].concat(args));
            }
        }, {
            key: 'find_among',
            value: function find_among() {
                var _get16;

                for (var _len15 = arguments.length, args = Array(_len15), _key15 = 0; _key15 < _len15; _key15++) {
                    args[_key15] = arguments[_key15];
                }

                switch (args.length) {
                    case 1:
                        return this.find_among$esjava$1.apply(this, args);
                }
                return (_get16 = _get(Object.getPrototypeOf(SnowballProgram.prototype), 'find_among', this)).call.apply(_get16, [this].concat(args));
            }
        }, {
            key: 'find_among_b',
            value: function find_among_b() {
                var _get17;

                for (var _len16 = arguments.length, args = Array(_len16), _key16 = 0; _key16 < _len16; _key16++) {
                    args[_key16] = arguments[_key16];
                }

                switch (args.length) {
                    case 1:
                        return this.find_among_b$esjava$1.apply(this, args);
                }
                return (_get17 = _get(Object.getPrototypeOf(SnowballProgram.prototype), 'find_among_b', this)).call.apply(_get17, [this].concat(args));
            }
        }, {
            key: 'replace_s',
            value: function replace_s() {
                var _get18;

                for (var _len17 = arguments.length, args = Array(_len17), _key17 = 0; _key17 < _len17; _key17++) {
                    args[_key17] = arguments[_key17];
                }

                switch (args.length) {
                    case 3:
                        return this.replace_s$esjava$3.apply(this, args);
                }
                return (_get18 = _get(Object.getPrototypeOf(SnowballProgram.prototype), 'replace_s', this)).call.apply(_get18, [this].concat(args));
            }
        }, {
            key: 'slice_check',
            value: function slice_check() {
                var _get19;

                for (var _len18 = arguments.length, args = Array(_len18), _key18 = 0; _key18 < _len18; _key18++) {
                    args[_key18] = arguments[_key18];
                }

                switch (args.length) {
                    case 0:
                        return this.slice_check$esjava$0.apply(this, args);
                }
                return (_get19 = _get(Object.getPrototypeOf(SnowballProgram.prototype), 'slice_check', this)).call.apply(_get19, [this].concat(args));
            }
        }, {
            key: 'slice_from',
            value: function slice_from() {
                var _get20;

                for (var _len19 = arguments.length, args = Array(_len19), _key19 = 0; _key19 < _len19; _key19++) {
                    args[_key19] = arguments[_key19];
                }

                switch (args.length) {
                    case 1:
                        return this.slice_from$esjava$1.apply(this, args);
                }
                return (_get20 = _get(Object.getPrototypeOf(SnowballProgram.prototype), 'slice_from', this)).call.apply(_get20, [this].concat(args));
            }
        }, {
            key: 'slice_del',
            value: function slice_del() {
                var _get21;

                for (var _len20 = arguments.length, args = Array(_len20), _key20 = 0; _key20 < _len20; _key20++) {
                    args[_key20] = arguments[_key20];
                }

                switch (args.length) {
                    case 0:
                        return this.slice_del$esjava$0.apply(this, args);
                }
                return (_get21 = _get(Object.getPrototypeOf(SnowballProgram.prototype), 'slice_del', this)).call.apply(_get21, [this].concat(args));
            }
        }, {
            key: 'insert',
            value: function insert() {
                var _get22;

                for (var _len21 = arguments.length, args = Array(_len21), _key21 = 0; _key21 < _len21; _key21++) {
                    args[_key21] = arguments[_key21];
                }

                switch (args.length) {
                    case 3:
                        return this.insert$esjava$3.apply(this, args);
                }
                return (_get22 = _get(Object.getPrototypeOf(SnowballProgram.prototype), 'insert', this)).call.apply(_get22, [this].concat(args));
            }
        }, {
            key: 'slice_to',
            value: function slice_to() {
                var _get23;

                for (var _len22 = arguments.length, args = Array(_len22), _key22 = 0; _key22 < _len22; _key22++) {
                    args[_key22] = arguments[_key22];
                }

                switch (args.length) {
                    case 1:
                        return this.slice_to$esjava$1.apply(this, args);
                }
                return (_get23 = _get(Object.getPrototypeOf(SnowballProgram.prototype), 'slice_to', this)).call.apply(_get23, [this].concat(args));
            }
        }, {
            key: 'current',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$current') ? this._$esjava$current : this._$esjava$current = null;
            },
            set: function set(v) {
                this._$esjava$current = v;
            }
        }, {
            key: 'cursor',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$cursor') ? this._$esjava$cursor : this._$esjava$cursor = 0;
            },
            set: function set(v) {
                this._$esjava$cursor = v;
            }
        }, {
            key: 'limit',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$limit') ? this._$esjava$limit : this._$esjava$limit = 0;
            },
            set: function set(v) {
                this._$esjava$limit = v;
            }
        }, {
            key: 'limit_backward',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$limit_backward') ? this._$esjava$limit_backward : this._$esjava$limit_backward = 0;
            },
            set: function set(v) {
                this._$esjava$limit_backward = v;
            }
        }, {
            key: 'bra',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$bra') ? this._$esjava$bra : this._$esjava$bra = 0;
            },
            set: function set(v) {
                this._$esjava$bra = v;
            }
        }, {
            key: 'ket',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$ket') ? this._$esjava$ket : this._$esjava$ket = 0;
            },
            set: function set(v) {
                this._$esjava$ket = v;
            }
        }]);

        return SnowballProgram;
    }();

    var SnowballStemmer = function (_SnowballProgram) {
        _inherits(SnowballStemmer, _SnowballProgram);

        function SnowballStemmer() {
            _classCallCheck(this, SnowballStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(SnowballStemmer).apply(this, arguments));
        }

        _createClass(SnowballStemmer, [{
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                throw 'NotImpl < stem$esjava$0 >';
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get24;

                for (var _len23 = arguments.length, args = Array(_len23), _key23 = 0; _key23 < _len23; _key23++) {
                    args[_key23] = arguments[_key23];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get24 = _get(Object.getPrototypeOf(SnowballStemmer.prototype), 'stem', this)).call.apply(_get24, [this].concat(args));
            }
        }]);

        return SnowballStemmer;
    }(SnowballProgram);

    var arabicStemmer = function (_SnowballStemmer) {
        _inherits(arabicStemmer, _SnowballStemmer);

        function arabicStemmer() {
            _classCallCheck(this, arabicStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(arabicStemmer).apply(this, arguments));
        }

        _createClass(arabicStemmer, [{
            key: 'r_Normalize_pre$esjava$0',
            value: function r_Normalize_pre$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                for (v_1 = this.current.length(); v_1 > 0; v_1--) {
                    lab0: do {
                        v_2 = this.cursor;
                        lab1: do {
                            this.bra = this.cursor;
                            among_var = this.find_among$esjava$1(arabicStemmer.a_0);
                            if (among_var === 0) {
                                break lab1;
                            }
                            this.ket = this.cursor;
                            switch (among_var) {
                                case 0:
                                    break lab1;
                                case 1:
                                    this.slice_del$esjava$0();
                                    break;
                                case 2:
                                    this.slice_del$esjava$0();
                                    break;
                                case 3:
                                    this.slice_del$esjava$0();
                                    break;
                                case 4:
                                    this.slice_del$esjava$0();
                                    break;
                                case 5:
                                    this.slice_from$esjava$1("0");
                                    break;
                                case 6:
                                    this.slice_from$esjava$1("1");
                                    break;
                                case 7:
                                    this.slice_from$esjava$1("2");
                                    break;
                                case 8:
                                    this.slice_from$esjava$1("3");
                                    break;
                                case 9:
                                    this.slice_from$esjava$1("4");
                                    break;
                                case 10:
                                    this.slice_from$esjava$1("5");
                                    break;
                                case 11:
                                    this.slice_from$esjava$1("6");
                                    break;
                                case 12:
                                    this.slice_from$esjava$1("7");
                                    break;
                                case 13:
                                    this.slice_from$esjava$1("8");
                                    break;
                                case 14:
                                    this.slice_from$esjava$1("9");
                                    break;
                                case 15:
                                    this.slice_del$esjava$0();
                                    break;
                                case 16:
                                    this.slice_from$esjava$1('\u0621');
                                    break;
                                case 17:
                                    this.slice_from$esjava$1('\u0623');
                                    break;
                                case 18:
                                    this.slice_from$esjava$1('\u0625');
                                    break;
                                case 19:
                                    this.slice_from$esjava$1('\u0626');
                                    break;
                                case 20:
                                    this.slice_from$esjava$1('\u0622');
                                    break;
                                case 21:
                                    this.slice_from$esjava$1('\u0624');
                                    break;
                                case 22:
                                    this.slice_from$esjava$1('\u0627');
                                    break;
                                case 23:
                                    this.slice_from$esjava$1('\u0628');
                                    break;
                                case 24:
                                    this.slice_from$esjava$1('\u0629');
                                    break;
                                case 25:
                                    this.slice_from$esjava$1('\u062A');
                                    break;
                                case 26:
                                    this.slice_from$esjava$1('\u062B');
                                    break;
                                case 27:
                                    this.slice_from$esjava$1('\u062C');
                                    break;
                                case 28:
                                    this.slice_from$esjava$1('\u062D');
                                    break;
                                case 29:
                                    this.slice_from$esjava$1('\u062E');
                                    break;
                                case 30:
                                    this.slice_from$esjava$1('\u062F');
                                    break;
                                case 31:
                                    this.slice_from$esjava$1('\u0630');
                                    break;
                                case 32:
                                    this.slice_from$esjava$1('\u0631');
                                    break;
                                case 33:
                                    this.slice_from$esjava$1('\u0632');
                                    break;
                                case 34:
                                    this.slice_from$esjava$1('\u0633');
                                    break;
                                case 35:
                                    this.slice_from$esjava$1('\u0634');
                                    break;
                                case 36:
                                    this.slice_from$esjava$1('\u0635');
                                    break;
                                case 37:
                                    this.slice_from$esjava$1('\u0636');
                                    break;
                                case 38:
                                    this.slice_from$esjava$1('\u0637');
                                    break;
                                case 39:
                                    this.slice_from$esjava$1('\u0638');
                                    break;
                                case 40:
                                    this.slice_from$esjava$1('\u0639');
                                    break;
                                case 41:
                                    this.slice_from$esjava$1('\u063A');
                                    break;
                                case 42:
                                    this.slice_from$esjava$1('\u0641');
                                    break;
                                case 43:
                                    this.slice_from$esjava$1('\u0642');
                                    break;
                                case 44:
                                    this.slice_from$esjava$1('\u0643');
                                    break;
                                case 45:
                                    this.slice_from$esjava$1('\u0644');
                                    break;
                                case 46:
                                    this.slice_from$esjava$1('\u0645');
                                    break;
                                case 47:
                                    this.slice_from$esjava$1('\u0646');
                                    break;
                                case 48:
                                    this.slice_from$esjava$1('\u0647');
                                    break;
                                case 49:
                                    this.slice_from$esjava$1('\u0648');
                                    break;
                                case 50:
                                    this.slice_from$esjava$1('\u0649');
                                    break;
                                case 51:
                                    this.slice_from$esjava$1('\u064A');
                                    break;
                                case 52:
                                    this.slice_from$esjava$1('\u0644\u0627');
                                    break;
                                case 53:
                                    this.slice_from$esjava$1('\u0644\u0623');
                                    break;
                                case 54:
                                    this.slice_from$esjava$1('\u0644\u0625');
                                    break;
                                case 55:
                                    this.slice_from$esjava$1('\u0644\u0622');
                                    break;
                            }
                            break lab0;
                        } while (false);
                        this.cursor = v_2;
                        if (this.cursor >= this.limit) {
                            return false;
                        }
                        this.cursor++;
                    } while (false);
                }
                return true;
            }
        }, {
            key: 'r_Normalize_post$esjava$0',
            value: function r_Normalize_post$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                v_1 = this.cursor;
                lab0: do {
                    this.limit_backward = this.cursor;
                    this.cursor = this.limit;
                    this.ket = this.cursor;
                    among_var = this.find_among_b$esjava$1(arabicStemmer.a_1);
                    if (among_var === 0) {
                        break lab0;
                    }
                    this.bra = this.cursor;
                    switch (among_var) {
                        case 0:
                            break lab0;
                        case 1:
                            this.slice_from$esjava$1('\u0621');
                            break;
                        case 2:
                            this.slice_from$esjava$1('\u0621');
                            break;
                        case 3:
                            this.slice_from$esjava$1('\u0621');
                            break;
                    }
                    this.cursor = this.limit_backward;
                } while (false);
                this.cursor = v_1;
                v_2 = this.cursor;
                lab1: do {
                    for (v_3 = this.I_word_len; v_3 > 0; v_3--) {
                        lab2: do {
                            v_4 = this.cursor;
                            lab3: do {
                                this.bra = this.cursor;
                                among_var = this.find_among$esjava$1(arabicStemmer.a_2);
                                if (among_var === 0) {
                                    break lab3;
                                }
                                this.ket = this.cursor;
                                switch (among_var) {
                                    case 0:
                                        break lab3;
                                    case 1:
                                        this.slice_from$esjava$1('\u0627');
                                        break;
                                    case 2:
                                        this.slice_from$esjava$1('\u0648');
                                        break;
                                    case 3:
                                        this.slice_from$esjava$1('\u064A');
                                        break;
                                }
                                break lab2;
                            } while (false);
                            this.cursor = v_4;
                            if (this.cursor >= this.limit) {
                                break lab1;
                            }
                            this.cursor++;
                        } while (false);
                    }
                } while (false);
                this.cursor = v_2;
                return true;
            }
        }, {
            key: 'r_Checks1$esjava$0',
            value: function r_Checks1$esjava$0() {
                var among_var = void 0;
                this.I_word_len = this.current.length();
                this.bra = this.cursor;
                among_var = this.find_among$esjava$1(arabicStemmer.a_3);
                if (among_var === 0) {
                    return false;
                }
                this.ket = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!(this.I_word_len > 4)) {
                            return false;
                        }
                        this.B_is_noun = true;
                        this.B_is_verb = false;
                        this.B_is_defined = true;
                        break;
                    case 2:
                        if (!(this.I_word_len > 3)) {
                            return false;
                        }
                        this.B_is_noun = true;
                        this.B_is_verb = false;
                        this.B_is_defined = true;
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Checks2$esjava$0',
            value: function r_Checks2$esjava$0() {
                var among_var = void 0;
                this.I_word_len = this.current.length();
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(arabicStemmer.a_4);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!(this.I_word_len > 2)) {
                            return false;
                        }
                        this.B_is_noun = true;
                        this.B_is_verb = false;
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Prefix_Step1$esjava$0',
            value: function r_Prefix_Step1$esjava$0() {
                var among_var = void 0;
                this.I_word_len = this.current.length();
                this.bra = this.cursor;
                among_var = this.find_among$esjava$1(arabicStemmer.a_5);
                if (among_var === 0) {
                    return false;
                }
                this.ket = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!(this.I_word_len > 3)) {
                            return false;
                        }
                        this.slice_from$esjava$1('\u0623');
                        break;
                    case 2:
                        if (!(this.I_word_len > 3)) {
                            return false;
                        }
                        this.slice_from$esjava$1('\u0622');
                        break;
                    case 3:
                        if (!(this.I_word_len > 3)) {
                            return false;
                        }
                        this.slice_from$esjava$1('\u0623');
                        break;
                    case 4:
                        if (!(this.I_word_len > 3)) {
                            return false;
                        }
                        this.slice_from$esjava$1('\u0627');
                        break;
                    case 5:
                        if (!(this.I_word_len > 3)) {
                            return false;
                        }
                        this.slice_from$esjava$1('\u0625');
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Prefix_Step2a$esjava$0',
            value: function r_Prefix_Step2a$esjava$0() {
                var among_var = void 0;
                this.I_word_len = this.current.length();
                this.bra = this.cursor;
                among_var = this.find_among$esjava$1(arabicStemmer.a_6);
                if (among_var === 0) {
                    return false;
                }
                this.ket = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!(this.I_word_len > 5)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!(this.I_word_len > 5)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Prefix_Step2b$esjava$0',
            value: function r_Prefix_Step2b$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                this.I_word_len = this.current.length();
                {
                    v_1 = this.cursor;
                    lab0: do {
                        if (!this.eq_s$esjava$1('\u0641\u0627')) {
                            break lab0;
                        }
                        return false;
                    } while (false);
                    this.cursor = v_1;
                }
                {
                    v_2 = this.cursor;
                    lab1: do {
                        if (!this.eq_s$esjava$1('\u0648\u0627')) {
                            break lab1;
                        }
                        return false;
                    } while (false);
                    this.cursor = v_2;
                }
                this.bra = this.cursor;
                among_var = this.find_among$esjava$1(arabicStemmer.a_7);
                if (among_var === 0) {
                    return false;
                }
                this.ket = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!(this.I_word_len > 3)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!(this.I_word_len > 3)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Prefix_Step3a_Noun$esjava$0',
            value: function r_Prefix_Step3a_Noun$esjava$0() {
                var among_var = void 0;
                this.I_word_len = this.current.length();
                this.bra = this.cursor;
                among_var = this.find_among$esjava$1(arabicStemmer.a_8);
                if (among_var === 0) {
                    return false;
                }
                this.ket = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!(this.I_word_len > 5)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!(this.I_word_len > 4)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Prefix_Step3b_Noun$esjava$0',
            value: function r_Prefix_Step3b_Noun$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                this.I_word_len = this.current.length();
                {
                    v_1 = this.cursor;
                    lab0: do {
                        if (!this.eq_s$esjava$1('\u0628\u0627')) {
                            break lab0;
                        }
                        return false;
                    } while (false);
                    this.cursor = v_1;
                }
                this.bra = this.cursor;
                among_var = this.find_among$esjava$1(arabicStemmer.a_9);
                if (among_var === 0) {
                    return false;
                }
                this.ket = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!(this.I_word_len > 3)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!(this.I_word_len > 4)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 3:
                        if (!(this.I_word_len > 4)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 4:
                        if (!(this.I_word_len > 3)) {
                            return false;
                        }
                        this.slice_from$esjava$1('\u0628');
                        break;
                    case 5:
                        if (!(this.I_word_len > 3)) {
                            return false;
                        }
                        this.slice_from$esjava$1('\u0643');
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Prefix_Step3_Verb$esjava$0',
            value: function r_Prefix_Step3_Verb$esjava$0() {
                var among_var = void 0;
                this.I_word_len = this.current.length();
                this.bra = this.cursor;
                among_var = this.find_among$esjava$1(arabicStemmer.a_10);
                if (among_var === 0) {
                    return false;
                }
                this.ket = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!(this.I_word_len > 4)) {
                            return false;
                        }
                        this.slice_from$esjava$1('\u064A');
                        break;
                    case 2:
                        if (!(this.I_word_len > 4)) {
                            return false;
                        }
                        this.slice_from$esjava$1('\u062A');
                        break;
                    case 3:
                        if (!(this.I_word_len > 4)) {
                            return false;
                        }
                        this.slice_from$esjava$1('\u0646');
                        break;
                    case 4:
                        if (!(this.I_word_len > 4)) {
                            return false;
                        }
                        this.slice_from$esjava$1('\u0623');
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Prefix_Step4_Verb$esjava$0',
            value: function r_Prefix_Step4_Verb$esjava$0() {
                var among_var = void 0;
                this.I_word_len = this.current.length();
                this.bra = this.cursor;
                among_var = this.find_among$esjava$1(arabicStemmer.a_11);
                if (among_var === 0) {
                    return false;
                }
                this.ket = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!(this.I_word_len > 4)) {
                            return false;
                        }
                        this.B_is_verb = true;
                        this.B_is_noun = false;
                        this.slice_from$esjava$1('\u0627\u0633\u062A');
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Suffix_Noun_Step1a$esjava$0',
            value: function r_Suffix_Noun_Step1a$esjava$0() {
                var among_var = void 0;
                this.I_word_len = this.current.length();
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(arabicStemmer.a_12);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!(this.I_word_len >= 4)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!(this.I_word_len >= 5)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 3:
                        if (!(this.I_word_len >= 6)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Suffix_Noun_Step1b$esjava$0',
            value: function r_Suffix_Noun_Step1b$esjava$0() {
                var among_var = void 0;
                this.I_word_len = this.current.length();
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(arabicStemmer.a_13);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!(this.I_word_len > 5)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Suffix_Noun_Step2a$esjava$0',
            value: function r_Suffix_Noun_Step2a$esjava$0() {
                var among_var = void 0;
                this.I_word_len = this.current.length();
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(arabicStemmer.a_14);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!(this.I_word_len > 4)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Suffix_Noun_Step2b$esjava$0',
            value: function r_Suffix_Noun_Step2b$esjava$0() {
                var among_var = void 0;
                this.I_word_len = this.current.length();
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(arabicStemmer.a_15);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!(this.I_word_len >= 5)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Suffix_Noun_Step2c1$esjava$0',
            value: function r_Suffix_Noun_Step2c1$esjava$0() {
                var among_var = void 0;
                this.I_word_len = this.current.length();
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(arabicStemmer.a_16);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!(this.I_word_len >= 4)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Suffix_Noun_Step2c2$esjava$0',
            value: function r_Suffix_Noun_Step2c2$esjava$0() {
                var among_var = void 0;
                this.I_word_len = this.current.length();
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(arabicStemmer.a_17);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!(this.I_word_len >= 3)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Suffix_Noun_Step3$esjava$0',
            value: function r_Suffix_Noun_Step3$esjava$0() {
                var among_var = void 0;
                this.I_word_len = this.current.length();
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(arabicStemmer.a_18);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!(this.I_word_len >= 3)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Suffix_Verb_Step1$esjava$0',
            value: function r_Suffix_Verb_Step1$esjava$0() {
                var among_var = void 0;
                this.I_word_len = this.current.length();
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(arabicStemmer.a_19);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!(this.I_word_len >= 4)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!(this.I_word_len >= 5)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 3:
                        if (!(this.I_word_len >= 6)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Suffix_Verb_Step2a$esjava$0',
            value: function r_Suffix_Verb_Step2a$esjava$0() {
                var among_var = void 0;
                this.I_word_len = this.current.length();
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(arabicStemmer.a_20);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!(this.I_word_len >= 4)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!(this.I_word_len >= 4)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 3:
                        if (!(this.I_word_len >= 5)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 4:
                        if (!(this.I_word_len > 5)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 5:
                        if (!(this.I_word_len >= 6)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Suffix_Verb_Step2b$esjava$0',
            value: function r_Suffix_Verb_Step2b$esjava$0() {
                var among_var = void 0;
                this.I_word_len = this.current.length();
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(arabicStemmer.a_21);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!(this.I_word_len >= 5)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Suffix_Verb_Step2c$esjava$0',
            value: function r_Suffix_Verb_Step2c$esjava$0() {
                var among_var = void 0;
                this.I_word_len = this.current.length();
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(arabicStemmer.a_22);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!(this.I_word_len >= 4)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!(this.I_word_len >= 6)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Suffix_All_alef_maqsura$esjava$0',
            value: function r_Suffix_All_alef_maqsura$esjava$0() {
                var among_var = void 0;
                this.I_word_len = this.current.length();
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(arabicStemmer.a_23);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_from$esjava$1('\u064A');
                        break;
                }
                return true;
            }
        }, {
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_8 = void 0;
                var v_9 = void 0;
                var v_10 = void 0;
                var v_11 = void 0;
                var v_13 = void 0;
                var v_14 = void 0;
                var v_16 = void 0;
                var v_17 = void 0;
                var v_18 = void 0;
                var v_19 = void 0;
                var v_20 = void 0;
                var v_21 = void 0;
                var v_22 = void 0;
                this.B_is_noun = true;
                this.B_is_verb = true;
                this.B_is_defined = false;
                v_1 = this.cursor;
                lab0: do {
                    if (!this.r_Checks1$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = v_1;
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                v_2 = this.limit - this.cursor;
                lab1: do {
                    if (!this.r_Checks2$esjava$0()) {
                        break lab1;
                    }
                } while (false);
                this.cursor = this.limit - v_2;
                this.cursor = this.limit_backward;
                v_3 = this.cursor;
                lab2: do {
                    if (!this.r_Normalize_pre$esjava$0()) {
                        break lab2;
                    }
                } while (false);
                this.cursor = v_3;
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                v_4 = this.limit - this.cursor;
                lab3: do {
                    lab4: do {
                        v_5 = this.limit - this.cursor;
                        lab5: do {
                            if (!this.B_is_verb) {
                                break lab5;
                            }
                            lab6: do {
                                v_6 = this.limit - this.cursor;
                                lab7: do {
                                    {
                                        var v_7 = 1;
                                        replab8: while (true) {
                                            v_8 = this.limit - this.cursor;
                                            lab9: do {
                                                if (!this.r_Suffix_Verb_Step1$esjava$0()) {
                                                    break lab9;
                                                }
                                                v_7--;
                                                continue replab8;
                                            } while (false);
                                            this.cursor = this.limit - v_8;
                                            break replab8;
                                        }
                                        if (v_7 > 0) {
                                            break lab7;
                                        }
                                    }
                                    lab10: do {
                                        v_9 = this.limit - this.cursor;
                                        lab11: do {
                                            if (!this.r_Suffix_Verb_Step2a$esjava$0()) {
                                                break lab11;
                                            }
                                            break lab10;
                                        } while (false);
                                        this.cursor = this.limit - v_9;
                                        lab12: do {
                                            if (!this.r_Suffix_Verb_Step2c$esjava$0()) {
                                                break lab12;
                                            }
                                            break lab10;
                                        } while (false);
                                        this.cursor = this.limit - v_9;
                                        if (this.cursor <= this.limit_backward) {
                                            break lab7;
                                        }
                                        this.cursor--;
                                    } while (false);
                                    break lab6;
                                } while (false);
                                this.cursor = this.limit - v_6;
                                lab13: do {
                                    if (!this.r_Suffix_Verb_Step2b$esjava$0()) {
                                        break lab13;
                                    }
                                    break lab6;
                                } while (false);
                                this.cursor = this.limit - v_6;
                                if (!this.r_Suffix_Verb_Step2a$esjava$0()) {
                                    break lab5;
                                }
                            } while (false);
                            break lab4;
                        } while (false);
                        this.cursor = this.limit - v_5;
                        lab14: do {
                            if (!this.B_is_noun) {
                                break lab14;
                            }
                            v_10 = this.limit - this.cursor;
                            lab15: do {
                                lab16: do {
                                    v_11 = this.limit - this.cursor;
                                    lab17: do {
                                        if (!this.r_Suffix_Noun_Step2c2$esjava$0()) {
                                            break lab17;
                                        }
                                        break lab16;
                                    } while (false);
                                    this.cursor = this.limit - v_11;
                                    lab18: do {
                                        lab19: do {
                                            if (!this.B_is_defined) {
                                                break lab19;
                                            }
                                            break lab18;
                                        } while (false);
                                        if (!this.r_Suffix_Noun_Step1a$esjava$0()) {
                                            break lab18;
                                        }
                                        lab20: do {
                                            v_13 = this.limit - this.cursor;
                                            lab21: do {
                                                if (!this.r_Suffix_Noun_Step2a$esjava$0()) {
                                                    break lab21;
                                                }
                                                break lab20;
                                            } while (false);
                                            this.cursor = this.limit - v_13;
                                            lab22: do {
                                                if (!this.r_Suffix_Noun_Step2b$esjava$0()) {
                                                    break lab22;
                                                }
                                                break lab20;
                                            } while (false);
                                            this.cursor = this.limit - v_13;
                                            lab23: do {
                                                if (!this.r_Suffix_Noun_Step2c1$esjava$0()) {
                                                    break lab23;
                                                }
                                                break lab20;
                                            } while (false);
                                            this.cursor = this.limit - v_13;
                                            if (this.cursor <= this.limit_backward) {
                                                break lab18;
                                            }
                                            this.cursor--;
                                        } while (false);
                                        break lab16;
                                    } while (false);
                                    this.cursor = this.limit - v_11;
                                    lab24: do {
                                        if (!this.r_Suffix_Noun_Step1b$esjava$0()) {
                                            break lab24;
                                        }
                                        lab25: do {
                                            v_14 = this.limit - this.cursor;
                                            lab26: do {
                                                if (!this.r_Suffix_Noun_Step2a$esjava$0()) {
                                                    break lab26;
                                                }
                                                break lab25;
                                            } while (false);
                                            this.cursor = this.limit - v_14;
                                            lab27: do {
                                                if (!this.r_Suffix_Noun_Step2b$esjava$0()) {
                                                    break lab27;
                                                }
                                                break lab25;
                                            } while (false);
                                            this.cursor = this.limit - v_14;
                                            if (!this.r_Suffix_Noun_Step2c1$esjava$0()) {
                                                break lab24;
                                            }
                                        } while (false);
                                        break lab16;
                                    } while (false);
                                    this.cursor = this.limit - v_11;
                                    lab28: do {
                                        lab29: do {
                                            if (!this.B_is_defined) {
                                                break lab29;
                                            }
                                            break lab28;
                                        } while (false);
                                        if (!this.r_Suffix_Noun_Step2a$esjava$0()) {
                                            break lab28;
                                        }
                                        break lab16;
                                    } while (false);
                                    this.cursor = this.limit - v_11;
                                    if (!this.r_Suffix_Noun_Step2b$esjava$0()) {
                                        this.cursor = this.limit - v_10;
                                        break lab15;
                                    }
                                } while (false);
                            } while (false);
                            if (!this.r_Suffix_Noun_Step3$esjava$0()) {
                                break lab14;
                            }
                            break lab4;
                        } while (false);
                        this.cursor = this.limit - v_5;
                        if (!this.r_Suffix_All_alef_maqsura$esjava$0()) {
                            break lab3;
                        }
                    } while (false);
                } while (false);
                this.cursor = this.limit - v_4;
                this.cursor = this.limit_backward;
                v_16 = this.cursor;
                lab30: do {
                    v_17 = this.cursor;
                    lab31: do {
                        if (!this.r_Prefix_Step1$esjava$0()) {
                            this.cursor = v_17;
                            break lab31;
                        }
                    } while (false);
                    v_18 = this.cursor;
                    lab32: do {
                        lab33: do {
                            v_19 = this.cursor;
                            lab34: do {
                                if (!this.r_Prefix_Step2a$esjava$0()) {
                                    break lab34;
                                }
                                break lab33;
                            } while (false);
                            this.cursor = v_19;
                            if (!this.r_Prefix_Step2b$esjava$0()) {
                                this.cursor = v_18;
                                break lab32;
                            }
                        } while (false);
                    } while (false);
                    lab35: do {
                        v_20 = this.cursor;
                        lab36: do {
                            if (!this.r_Prefix_Step3a_Noun$esjava$0()) {
                                break lab36;
                            }
                            break lab35;
                        } while (false);
                        this.cursor = v_20;
                        lab37: do {
                            if (!this.B_is_noun) {
                                break lab37;
                            }
                            if (!this.r_Prefix_Step3b_Noun$esjava$0()) {
                                break lab37;
                            }
                            break lab35;
                        } while (false);
                        this.cursor = v_20;
                        if (!this.B_is_verb) {
                            break lab30;
                        }
                        v_21 = this.cursor;
                        lab38: do {
                            if (!this.r_Prefix_Step3_Verb$esjava$0()) {
                                this.cursor = v_21;
                                break lab38;
                            }
                        } while (false);
                        if (!this.r_Prefix_Step4_Verb$esjava$0()) {
                            break lab30;
                        }
                    } while (false);
                } while (false);
                this.cursor = v_16;
                v_22 = this.cursor;
                lab39: do {
                    if (!this.r_Normalize_post$esjava$0()) {
                        break lab39;
                    }
                } while (false);
                this.cursor = v_22;
                return true;
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get25;

                for (var _len24 = arguments.length, args = Array(_len24), _key24 = 0; _key24 < _len24; _key24++) {
                    args[_key24] = arguments[_key24];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get25 = _get(Object.getPrototypeOf(arabicStemmer.prototype), 'stem', this)).call.apply(_get25, [this].concat(args));
            }
        }, {
            key: 'B_is_defined',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$B_is_defined') ? this._$esjava$B_is_defined : this._$esjava$B_is_defined = false;
            },
            set: function set(v) {
                this._$esjava$B_is_defined = v;
            }
        }, {
            key: 'B_is_verb',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$B_is_verb') ? this._$esjava$B_is_verb : this._$esjava$B_is_verb = false;
            },
            set: function set(v) {
                this._$esjava$B_is_verb = v;
            }
        }, {
            key: 'B_is_noun',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$B_is_noun') ? this._$esjava$B_is_noun : this._$esjava$B_is_noun = false;
            },
            set: function set(v) {
                this._$esjava$B_is_noun = v;
            }
        }, {
            key: 'I_word_len',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_word_len') ? this._$esjava$I_word_len : this._$esjava$I_word_len = 0;
            },
            set: function set(v) {
                this._$esjava$I_word_len = v;
            }
        }], [{
            key: 'a_0',
            get: function get() {
                delete arabicStemmer.a_0;
                return arabicStemmer.a_0 = [new Among("!", -1, 3), new Among("\"", -1, 3), new Among("%", -1, 3), new Among("*", -1, 3), new Among(",", -1, 3), new Among(".", -1, 3), new Among("/", -1, 3), new Among(":", -1, 3), new Among(";", -1, 3), new Among("?", -1, 3), new Among("\\", -1, 3), new Among('\u060C', -1, 4), new Among('\u061B', -1, 4), new Among('\u061F', -1, 4), new Among('\u0640', -1, 2), new Among('\u064B', -1, 1), new Among('\u064C', -1, 1), new Among('\u064D', -1, 1), new Among('\u064E', -1, 1), new Among('\u064F', -1, 1), new Among('\u0650', -1, 1), new Among('\u0651', -1, 1), new Among('\u0652', -1, 1), new Among('\u0660', -1, 5), new Among('\u0661', -1, 6), new Among('\u0662', -1, 7), new Among('\u0663', -1, 8), new Among('\u0664', -1, 9), new Among('\u0665', -1, 10), new Among('\u0666', -1, 11), new Among('\u0667', -1, 12), new Among('\u0668', -1, 13), new Among('\u0669', -1, 14), new Among('\u066A', -1, 15), new Among('\u066B', -1, 15), new Among('\u066C', -1, 15), new Among('\uFE80', -1, 16), new Among('\uFE81', -1, 20), new Among('\uFE82', -1, 20), new Among('\uFE83', -1, 17), new Among('\uFE84', -1, 17), new Among('\uFE85', -1, 21), new Among('\uFE86', -1, 21), new Among('\uFE87', -1, 18), new Among('\uFE88', -1, 18), new Among('\uFE89', -1, 19), new Among('\uFE8A', -1, 19), new Among('\uFE8B', -1, 19), new Among('\uFE8C', -1, 19), new Among('\uFE8D', -1, 22), new Among('\uFE8E', -1, 22), new Among('\uFE8F', -1, 23), new Among('\uFE90', -1, 23), new Among('\uFE91', -1, 23), new Among('\uFE92', -1, 23), new Among('\uFE93', -1, 24), new Among('\uFE94', -1, 24), new Among('\uFE95', -1, 25), new Among('\uFE96', -1, 25), new Among('\uFE97', -1, 25), new Among('\uFE98', -1, 25), new Among('\uFE99', -1, 26), new Among('\uFE9A', -1, 26), new Among('\uFE9B', -1, 26), new Among('\uFE9C', -1, 26), new Among('\uFE9D', -1, 27), new Among('\uFE9E', -1, 27), new Among('\uFE9F', -1, 27), new Among('\uFEA0', -1, 27), new Among('\uFEA1', -1, 28), new Among('\uFEA2', -1, 28), new Among('\uFEA3', -1, 28), new Among('\uFEA4', -1, 28), new Among('\uFEA5', -1, 29), new Among('\uFEA6', -1, 29), new Among('\uFEA7', -1, 29), new Among('\uFEA8', -1, 29), new Among('\uFEA9', -1, 30), new Among('\uFEAA', -1, 30), new Among('\uFEAB', -1, 31), new Among('\uFEAC', -1, 31), new Among('\uFEAD', -1, 32), new Among('\uFEAE', -1, 32), new Among('\uFEAF', -1, 33), new Among('\uFEB0', -1, 33), new Among('\uFEB1', -1, 34), new Among('\uFEB2', -1, 34), new Among('\uFEB3', -1, 34), new Among('\uFEB4', -1, 34), new Among('\uFEB5', -1, 35), new Among('\uFEB6', -1, 35), new Among('\uFEB7', -1, 35), new Among('\uFEB8', -1, 35), new Among('\uFEB9', -1, 36), new Among('\uFEBA', -1, 36), new Among('\uFEBB', -1, 36), new Among('\uFEBC', -1, 36), new Among('\uFEBD', -1, 37), new Among('\uFEBE', -1, 37), new Among('\uFEBF', -1, 37), new Among('\uFEC0', -1, 37), new Among('\uFEC1', -1, 38), new Among('\uFEC2', -1, 38), new Among('\uFEC3', -1, 38), new Among('\uFEC4', -1, 38), new Among('\uFEC5', -1, 39), new Among('\uFEC6', -1, 39), new Among('\uFEC7', -1, 39), new Among('\uFEC8', -1, 39), new Among('\uFEC9', -1, 40), new Among('\uFECA', -1, 40), new Among('\uFECB', -1, 40), new Among('\uFECC', -1, 40), new Among('\uFECD', -1, 41), new Among('\uFECE', -1, 41), new Among('\uFECF', -1, 41), new Among('\uFED0', -1, 41), new Among('\uFED1', -1, 42), new Among('\uFED2', -1, 42), new Among('\uFED3', -1, 42), new Among('\uFED4', -1, 42), new Among('\uFED5', -1, 43), new Among('\uFED6', -1, 43), new Among('\uFED7', -1, 43), new Among('\uFED8', -1, 43), new Among('\uFED9', -1, 44), new Among('\uFEDA', -1, 44), new Among('\uFEDB', -1, 44), new Among('\uFEDC', -1, 44), new Among('\uFEDD', -1, 45), new Among('\uFEDE', -1, 45), new Among('\uFEDF', -1, 45), new Among('\uFEE0', -1, 45), new Among('\uFEE1', -1, 46), new Among('\uFEE2', -1, 46), new Among('\uFEE3', -1, 46), new Among('\uFEE4', -1, 46), new Among('\uFEE5', -1, 47), new Among('\uFEE6', -1, 47), new Among('\uFEE7', -1, 47), new Among('\uFEE8', -1, 47), new Among('\uFEE9', -1, 48), new Among('\uFEEA', -1, 48), new Among('\uFEEB', -1, 48), new Among('\uFEEC', -1, 48), new Among('\uFEED', -1, 49), new Among('\uFEEE', -1, 49), new Among('\uFEEF', -1, 50), new Among('\uFEF0', -1, 50), new Among('\uFEF1', -1, 51), new Among('\uFEF2', -1, 51), new Among('\uFEF3', -1, 51), new Among('\uFEF4', -1, 51), new Among('\uFEF5', -1, 55), new Among('\uFEF6', -1, 55), new Among('\uFEF7', -1, 53), new Among('\uFEF8', -1, 53), new Among('\uFEF9', -1, 54), new Among('\uFEFA', -1, 54), new Among('\uFEFB', -1, 52), new Among('\uFEFC', -1, 52)];
            }
        }, {
            key: 'a_1',
            get: function get() {
                delete arabicStemmer.a_1;
                return arabicStemmer.a_1 = [new Among('\u0622', -1, 1), new Among('\u0623', -1, 1), new Among('\u0624', -1, 2), new Among('\u0625', -1, 1), new Among('\u0626', -1, 3)];
            }
        }, {
            key: 'a_2',
            get: function get() {
                delete arabicStemmer.a_2;
                return arabicStemmer.a_2 = [new Among('\u0622', -1, 1), new Among('\u0623', -1, 1), new Among('\u0624', -1, 2), new Among('\u0625', -1, 1), new Among('\u0626', -1, 3)];
            }
        }, {
            key: 'a_3',
            get: function get() {
                delete arabicStemmer.a_3;
                return arabicStemmer.a_3 = [new Among('\u0627\u0644', -1, 2), new Among('\u0628\u0627\u0644', -1, 1), new Among('\u0643\u0627\u0644', -1, 1), new Among('\u0644\u0644', -1, 2)];
            }
        }, {
            key: 'a_4',
            get: function get() {
                delete arabicStemmer.a_4;
                return arabicStemmer.a_4 = [new Among('\u0629', -1, 1)];
            }
        }, {
            key: 'a_5',
            get: function get() {
                delete arabicStemmer.a_5;
                return arabicStemmer.a_5 = [new Among('\u0623\u0622', -1, 2), new Among('\u0623\u0623', -1, 1), new Among('\u0623\u0624', -1, 3), new Among('\u0623\u0625', -1, 5), new Among('\u0623\u0627', -1, 4)];
            }
        }, {
            key: 'a_6',
            get: function get() {
                delete arabicStemmer.a_6;
                return arabicStemmer.a_6 = [new Among('\u0641\u0627\u0644', -1, 1), new Among('\u0648\u0627\u0644', -1, 2)];
            }
        }, {
            key: 'a_7',
            get: function get() {
                delete arabicStemmer.a_7;
                return arabicStemmer.a_7 = [new Among('\u0641', -1, 1), new Among('\u0648', -1, 2)];
            }
        }, {
            key: 'a_8',
            get: function get() {
                delete arabicStemmer.a_8;
                return arabicStemmer.a_8 = [new Among('\u0627\u0644', -1, 2), new Among('\u0628\u0627\u0644', -1, 1), new Among('\u0643\u0627\u0644', -1, 1), new Among('\u0644\u0644', -1, 2)];
            }
        }, {
            key: 'a_9',
            get: function get() {
                delete arabicStemmer.a_9;
                return arabicStemmer.a_9 = [new Among('\u0628', -1, 1), new Among('\u0628\u0628', 0, 4), new Among('\u0643', -1, 2), new Among('\u0643\u0643', 2, 5), new Among('\u0644', -1, 3)];
            }
        }, {
            key: 'a_10',
            get: function get() {
                delete arabicStemmer.a_10;
                return arabicStemmer.a_10 = [new Among('\u0633\u0623', -1, 4), new Among('\u0633\u062A', -1, 2), new Among('\u0633\u0646', -1, 3), new Among('\u0633\u064A', -1, 1)];
            }
        }, {
            key: 'a_11',
            get: function get() {
                delete arabicStemmer.a_11;
                return arabicStemmer.a_11 = [new Among('\u062A\u0633\u062A', -1, 1), new Among('\u0646\u0633\u062A', -1, 1), new Among('\u064A\u0633\u062A', -1, 1)];
            }
        }, {
            key: 'a_12',
            get: function get() {
                delete arabicStemmer.a_12;
                return arabicStemmer.a_12 = [new Among('\u0643\u0645\u0627', -1, 3), new Among('\u0647\u0645\u0627', -1, 3), new Among('\u0646\u0627', -1, 2), new Among('\u0647\u0627', -1, 2), new Among('\u0643', -1, 1), new Among('\u0643\u0645', -1, 2), new Among('\u0647\u0645', -1, 2), new Among('\u0647\u0646', -1, 2), new Among('\u0647', -1, 1), new Among('\u064A', -1, 1)];
            }
        }, {
            key: 'a_13',
            get: function get() {
                delete arabicStemmer.a_13;
                return arabicStemmer.a_13 = [new Among('\u0646', -1, 1)];
            }
        }, {
            key: 'a_14',
            get: function get() {
                delete arabicStemmer.a_14;
                return arabicStemmer.a_14 = [new Among('\u0627', -1, 1), new Among('\u0648', -1, 1), new Among('\u064A', -1, 1)];
            }
        }, {
            key: 'a_15',
            get: function get() {
                delete arabicStemmer.a_15;
                return arabicStemmer.a_15 = [new Among('\u0627\u062A', -1, 1)];
            }
        }, {
            key: 'a_16',
            get: function get() {
                delete arabicStemmer.a_16;
                return arabicStemmer.a_16 = [new Among('\u062A', -1, 1)];
            }
        }, {
            key: 'a_17',
            get: function get() {
                delete arabicStemmer.a_17;
                return arabicStemmer.a_17 = [new Among('\u0629', -1, 1)];
            }
        }, {
            key: 'a_18',
            get: function get() {
                delete arabicStemmer.a_18;
                return arabicStemmer.a_18 = [new Among('\u064A', -1, 1)];
            }
        }, {
            key: 'a_19',
            get: function get() {
                delete arabicStemmer.a_19;
                return arabicStemmer.a_19 = [new Among('\u0643\u0645\u0627', -1, 3), new Among('\u0647\u0645\u0627', -1, 3), new Among('\u0646\u0627', -1, 2), new Among('\u0647\u0627', -1, 2), new Among('\u0643', -1, 1), new Among('\u0643\u0645', -1, 2), new Among('\u0647\u0645', -1, 2), new Among('\u0643\u0646', -1, 2), new Among('\u0647\u0646', -1, 2), new Among('\u0647', -1, 1), new Among('\u0643\u0645\u0648', -1, 3), new Among('\u0646\u064A', -1, 2)];
            }
        }, {
            key: 'a_20',
            get: function get() {
                delete arabicStemmer.a_20;
                return arabicStemmer.a_20 = [new Among('\u0627', -1, 2), new Among('\u062A\u0627', 0, 3), new Among('\u062A\u0645\u0627', 0, 5), new Among('\u0646\u0627', 0, 3), new Among('\u062A', -1, 1), new Among('\u0646', -1, 2), new Among('\u0627\u0646', 5, 4), new Among('\u062A\u0646', 5, 3), new Among('\u0648\u0646', 5, 4), new Among('\u064A\u0646', 5, 4), new Among('\u064A', -1, 2)];
            }
        }, {
            key: 'a_21',
            get: function get() {
                delete arabicStemmer.a_21;
                return arabicStemmer.a_21 = [new Among('\u0648\u0627', -1, 1), new Among('\u062A\u0645', -1, 1)];
            }
        }, {
            key: 'a_22',
            get: function get() {
                delete arabicStemmer.a_22;
                return arabicStemmer.a_22 = [new Among('\u0648', -1, 1), new Among('\u062A\u0645\u0648', 0, 2)];
            }
        }, {
            key: 'a_23',
            get: function get() {
                delete arabicStemmer.a_23;
                return arabicStemmer.a_23 = [new Among('\u0649', -1, 1)];
            }
        }]);

        return arabicStemmer;
    }(SnowballStemmer);

    var armenianStemmer = function (_SnowballStemmer2) {
        _inherits(armenianStemmer, _SnowballStemmer2);

        function armenianStemmer() {
            _classCallCheck(this, armenianStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(armenianStemmer).apply(this, arguments));
        }

        _createClass(armenianStemmer, [{
            key: 'r_mark_regions$esjava$0',
            value: function r_mark_regions$esjava$0() {
                var v_1 = void 0;
                this.I_pV = this.limit;
                this.I_p2 = this.limit;
                v_1 = this.cursor;
                lab0: do {
                    golab1: while (true) {
                        lab2: do {
                            if (!this.in_grouping$esjava$3(armenianStemmer.g_v, 1377, 1413)) {
                                break lab2;
                            }
                            break golab1;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab0;
                        }
                        this.cursor++;
                    }
                    this.I_pV = this.cursor;
                    golab3: while (true) {
                        lab4: do {
                            if (!this.out_grouping$esjava$3(armenianStemmer.g_v, 1377, 1413)) {
                                break lab4;
                            }
                            break golab3;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab0;
                        }
                        this.cursor++;
                    }
                    golab5: while (true) {
                        lab6: do {
                            if (!this.in_grouping$esjava$3(armenianStemmer.g_v, 1377, 1413)) {
                                break lab6;
                            }
                            break golab5;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab0;
                        }
                        this.cursor++;
                    }
                    golab7: while (true) {
                        lab8: do {
                            if (!this.out_grouping$esjava$3(armenianStemmer.g_v, 1377, 1413)) {
                                break lab8;
                            }
                            break golab7;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab0;
                        }
                        this.cursor++;
                    }
                    this.I_p2 = this.cursor;
                } while (false);
                this.cursor = v_1;
                return true;
            }
        }, {
            key: 'r_R2$esjava$0',
            value: function r_R2$esjava$0() {
                if (!(this.I_p2 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_adjective$esjava$0',
            value: function r_adjective$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(armenianStemmer.a_0);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_verb$esjava$0',
            value: function r_verb$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(armenianStemmer.a_1);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_noun$esjava$0',
            value: function r_noun$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(armenianStemmer.a_2);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_ending$esjava$0',
            value: function r_ending$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(armenianStemmer.a_3);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_R2$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                v_1 = this.cursor;
                lab0: do {
                    if (!this.r_mark_regions$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = v_1;
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                v_2 = this.limit - this.cursor;
                if (this.cursor < this.I_pV) {
                    return false;
                }
                this.cursor = this.I_pV;
                v_3 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_2;
                v_4 = this.limit - this.cursor;
                lab1: do {
                    if (!this.r_ending$esjava$0()) {
                        break lab1;
                    }
                } while (false);
                this.cursor = this.limit - v_4;
                v_5 = this.limit - this.cursor;
                lab2: do {
                    if (!this.r_verb$esjava$0()) {
                        break lab2;
                    }
                } while (false);
                this.cursor = this.limit - v_5;
                v_6 = this.limit - this.cursor;
                lab3: do {
                    if (!this.r_adjective$esjava$0()) {
                        break lab3;
                    }
                } while (false);
                this.cursor = this.limit - v_6;
                v_7 = this.limit - this.cursor;
                lab4: do {
                    if (!this.r_noun$esjava$0()) {
                        break lab4;
                    }
                } while (false);
                this.cursor = this.limit - v_7;
                this.limit_backward = v_3;
                this.cursor = this.limit_backward;
                return true;
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get26;

                for (var _len25 = arguments.length, args = Array(_len25), _key25 = 0; _key25 < _len25; _key25++) {
                    args[_key25] = arguments[_key25];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get26 = _get(Object.getPrototypeOf(armenianStemmer.prototype), 'stem', this)).call.apply(_get26, [this].concat(args));
            }
        }, {
            key: 'I_p2',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p2') ? this._$esjava$I_p2 : this._$esjava$I_p2 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p2 = v;
            }
        }, {
            key: 'I_pV',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_pV') ? this._$esjava$I_pV : this._$esjava$I_pV = 0;
            },
            set: function set(v) {
                this._$esjava$I_pV = v;
            }
        }], [{
            key: 'a_0',
            get: function get() {
                delete armenianStemmer.a_0;
                return armenianStemmer.a_0 = [new Among('\u0580\u0578\u0580\u0564', -1, 1), new Among('\u0565\u0580\u0578\u0580\u0564', 0, 1), new Among('\u0561\u056C\u056B', -1, 1), new Among('\u0561\u056F\u056B', -1, 1), new Among('\u0578\u0580\u0561\u056F', -1, 1), new Among('\u0565\u0572', -1, 1), new Among('\u0561\u056F\u0561\u0576', -1, 1), new Among('\u0561\u0580\u0561\u0576', -1, 1), new Among('\u0565\u0576', -1, 1), new Among('\u0565\u056F\u0565\u0576', 8, 1), new Among('\u0565\u0580\u0565\u0576', 8, 1), new Among('\u0578\u0580\u0567\u0576', -1, 1), new Among('\u056B\u0576', -1, 1), new Among('\u0563\u056B\u0576', 12, 1), new Among('\u0578\u057E\u056B\u0576', 12, 1), new Among('\u056C\u0561\u0575\u0576', -1, 1), new Among('\u057E\u0578\u0582\u0576', -1, 1), new Among('\u057A\u0565\u057D', -1, 1), new Among('\u056B\u057E', -1, 1), new Among('\u0561\u057F', -1, 1), new Among('\u0561\u057E\u0565\u057F', -1, 1), new Among('\u056F\u0578\u057F', -1, 1), new Among('\u0562\u0561\u0580', -1, 1)];
            }
        }, {
            key: 'a_1',
            get: function get() {
                delete armenianStemmer.a_1;
                return armenianStemmer.a_1 = [new Among('\u0561', -1, 1), new Among('\u0561\u0581\u0561', 0, 1), new Among('\u0565\u0581\u0561', 0, 1), new Among('\u057E\u0565', -1, 1), new Among('\u0561\u0581\u0580\u056B', -1, 1), new Among('\u0561\u0581\u056B', -1, 1), new Among('\u0565\u0581\u056B', -1, 1), new Among('\u057E\u0565\u0581\u056B', 6, 1), new Among('\u0561\u056C', -1, 1), new Among('\u0568\u0561\u056C', 8, 1), new Among('\u0561\u0576\u0561\u056C', 8, 1), new Among('\u0565\u0576\u0561\u056C', 8, 1), new Among('\u0561\u0581\u0576\u0561\u056C', 8, 1), new Among('\u0565\u056C', -1, 1), new Among('\u0568\u0565\u056C', 13, 1), new Among('\u0576\u0565\u056C', 13, 1), new Among('\u0581\u0576\u0565\u056C', 15, 1), new Among('\u0565\u0581\u0576\u0565\u056C', 16, 1), new Among('\u0579\u0565\u056C', 13, 1), new Among('\u057E\u0565\u056C', 13, 1), new Among('\u0561\u0581\u057E\u0565\u056C', 19, 1), new Among('\u0565\u0581\u057E\u0565\u056C', 19, 1), new Among('\u057F\u0565\u056C', 13, 1), new Among('\u0561\u057F\u0565\u056C', 22, 1), new Among('\u0578\u057F\u0565\u056C', 22, 1), new Among('\u056F\u0578\u057F\u0565\u056C', 24, 1), new Among('\u057E\u0561\u056E', -1, 1), new Among('\u0578\u0582\u0574', -1, 1), new Among('\u057E\u0578\u0582\u0574', 27, 1), new Among('\u0561\u0576', -1, 1), new Among('\u0581\u0561\u0576', 29, 1), new Among('\u0561\u0581\u0561\u0576', 30, 1), new Among('\u0561\u0581\u0580\u056B\u0576', -1, 1), new Among('\u0561\u0581\u056B\u0576', -1, 1), new Among('\u0565\u0581\u056B\u0576', -1, 1), new Among('\u057E\u0565\u0581\u056B\u0576', 34, 1), new Among('\u0561\u056C\u056B\u057D', -1, 1), new Among('\u0565\u056C\u056B\u057D', -1, 1), new Among('\u0561\u057E', -1, 1), new Among('\u0561\u0581\u0561\u057E', 38, 1), new Among('\u0565\u0581\u0561\u057E', 38, 1), new Among('\u0561\u056C\u0578\u057E', -1, 1), new Among('\u0565\u056C\u0578\u057E', -1, 1), new Among('\u0561\u0580', -1, 1), new Among('\u0561\u0581\u0561\u0580', 43, 1), new Among('\u0565\u0581\u0561\u0580', 43, 1), new Among('\u0561\u0581\u0580\u056B\u0580', -1, 1), new Among('\u0561\u0581\u056B\u0580', -1, 1), new Among('\u0565\u0581\u056B\u0580', -1, 1), new Among('\u057E\u0565\u0581\u056B\u0580', 48, 1), new Among('\u0561\u0581', -1, 1), new Among('\u0565\u0581', -1, 1), new Among('\u0561\u0581\u0580\u0565\u0581', 51, 1), new Among('\u0561\u056C\u0578\u0582\u0581', -1, 1), new Among('\u0565\u056C\u0578\u0582\u0581', -1, 1), new Among('\u0561\u056C\u0578\u0582', -1, 1), new Among('\u0565\u056C\u0578\u0582', -1, 1), new Among('\u0561\u0584', -1, 1), new Among('\u0581\u0561\u0584', 57, 1), new Among('\u0561\u0581\u0561\u0584', 58, 1), new Among('\u0561\u0581\u0580\u056B\u0584', -1, 1), new Among('\u0561\u0581\u056B\u0584', -1, 1), new Among('\u0565\u0581\u056B\u0584', -1, 1), new Among('\u057E\u0565\u0581\u056B\u0584', 62, 1), new Among('\u0561\u0576\u0584', -1, 1), new Among('\u0581\u0561\u0576\u0584', 64, 1), new Among('\u0561\u0581\u0561\u0576\u0584', 65, 1), new Among('\u0561\u0581\u0580\u056B\u0576\u0584', -1, 1), new Among('\u0561\u0581\u056B\u0576\u0584', -1, 1), new Among('\u0565\u0581\u056B\u0576\u0584', -1, 1), new Among('\u057E\u0565\u0581\u056B\u0576\u0584', 69, 1)];
            }
        }, {
            key: 'a_2',
            get: function get() {
                delete armenianStemmer.a_2;
                return armenianStemmer.a_2 = [new Among('\u0578\u0580\u0564', -1, 1), new Among('\u0578\u0582\u0575\u0569', -1, 1), new Among('\u0578\u0582\u0570\u056B', -1, 1), new Among('\u0581\u056B', -1, 1), new Among('\u056B\u056C', -1, 1), new Among('\u0561\u056F', -1, 1), new Among('\u0575\u0561\u056F', 5, 1), new Among('\u0561\u0576\u0561\u056F', 5, 1), new Among('\u056B\u056F', -1, 1), new Among('\u0578\u0582\u056F', -1, 1), new Among('\u0561\u0576', -1, 1), new Among('\u057A\u0561\u0576', 10, 1), new Among('\u057D\u057F\u0561\u0576', 10, 1), new Among('\u0561\u0580\u0561\u0576', 10, 1), new Among('\u0565\u0572\u0567\u0576', -1, 1), new Among('\u0575\u0578\u0582\u0576', -1, 1), new Among('\u0578\u0582\u0569\u0575\u0578\u0582\u0576', 15, 1), new Among('\u0561\u056E\u0578', -1, 1), new Among('\u056B\u0579', -1, 1), new Among('\u0578\u0582\u057D', -1, 1), new Among('\u0578\u0582\u057D\u057F', -1, 1), new Among('\u0563\u0561\u0580', -1, 1), new Among('\u057E\u0578\u0580', -1, 1), new Among('\u0561\u057E\u0578\u0580', 22, 1), new Among('\u0578\u0581', -1, 1), new Among('\u0561\u0576\u0585\u0581', -1, 1), new Among('\u0578\u0582', -1, 1), new Among('\u0584', -1, 1), new Among('\u0579\u0565\u0584', 27, 1), new Among('\u056B\u0584', 27, 1), new Among('\u0561\u056C\u056B\u0584', 29, 1), new Among('\u0561\u0576\u056B\u0584', 29, 1), new Among('\u057E\u0561\u056E\u0584', 27, 1), new Among('\u0578\u0582\u0575\u0584', 27, 1), new Among('\u0565\u0576\u0584', 27, 1), new Among('\u0578\u0576\u0584', 27, 1), new Among('\u0578\u0582\u0576\u0584', 27, 1), new Among('\u0574\u0578\u0582\u0576\u0584', 36, 1), new Among('\u056B\u0579\u0584', 27, 1), new Among('\u0561\u0580\u0584', 27, 1)];
            }
        }, {
            key: 'a_3',
            get: function get() {
                delete armenianStemmer.a_3;
                return armenianStemmer.a_3 = [new Among('\u057D\u0561', -1, 1), new Among('\u057E\u0561', -1, 1), new Among('\u0561\u0574\u0562', -1, 1), new Among('\u0564', -1, 1), new Among('\u0561\u0576\u0564', 3, 1), new Among('\u0578\u0582\u0569\u0575\u0561\u0576\u0564', 4, 1), new Among('\u057E\u0561\u0576\u0564', 4, 1), new Among('\u0578\u057B\u0564', 3, 1), new Among('\u0565\u0580\u0564', 3, 1), new Among('\u0576\u0565\u0580\u0564', 8, 1), new Among('\u0578\u0582\u0564', 3, 1), new Among('\u0568', -1, 1), new Among('\u0561\u0576\u0568', 11, 1), new Among('\u0578\u0582\u0569\u0575\u0561\u0576\u0568', 12, 1), new Among('\u057E\u0561\u0576\u0568', 12, 1), new Among('\u0578\u057B\u0568', 11, 1), new Among('\u0565\u0580\u0568', 11, 1), new Among('\u0576\u0565\u0580\u0568', 16, 1), new Among('\u056B', -1, 1), new Among('\u057E\u056B', 18, 1), new Among('\u0565\u0580\u056B', 18, 1), new Among('\u0576\u0565\u0580\u056B', 20, 1), new Among('\u0561\u0576\u0578\u0582\u0574', -1, 1), new Among('\u0565\u0580\u0578\u0582\u0574', -1, 1), new Among('\u0576\u0565\u0580\u0578\u0582\u0574', 23, 1), new Among('\u0576', -1, 1), new Among('\u0561\u0576', 25, 1), new Among('\u0578\u0582\u0569\u0575\u0561\u0576', 26, 1), new Among('\u057E\u0561\u0576', 26, 1), new Among('\u056B\u0576', 25, 1), new Among('\u0565\u0580\u056B\u0576', 29, 1), new Among('\u0576\u0565\u0580\u056B\u0576', 30, 1), new Among('\u0578\u0582\u0569\u0575\u0561\u0576\u0576', 25, 1), new Among('\u0565\u0580\u0576', 25, 1), new Among('\u0576\u0565\u0580\u0576', 33, 1), new Among('\u0578\u0582\u0576', 25, 1), new Among('\u0578\u057B', -1, 1), new Among('\u0578\u0582\u0569\u0575\u0561\u0576\u057D', -1, 1), new Among('\u057E\u0561\u0576\u057D', -1, 1), new Among('\u0578\u057B\u057D', -1, 1), new Among('\u0578\u057E', -1, 1), new Among('\u0561\u0576\u0578\u057E', 40, 1), new Among('\u057E\u0578\u057E', 40, 1), new Among('\u0565\u0580\u0578\u057E', 40, 1), new Among('\u0576\u0565\u0580\u0578\u057E', 43, 1), new Among('\u0565\u0580', -1, 1), new Among('\u0576\u0565\u0580', 45, 1), new Among('\u0581', -1, 1), new Among('\u056B\u0581', 47, 1), new Among('\u057E\u0561\u0576\u056B\u0581', 48, 1), new Among('\u0578\u057B\u056B\u0581', 48, 1), new Among('\u057E\u056B\u0581', 48, 1), new Among('\u0565\u0580\u056B\u0581', 48, 1), new Among('\u0576\u0565\u0580\u056B\u0581', 52, 1), new Among('\u0581\u056B\u0581', 48, 1), new Among('\u0578\u0581', 47, 1), new Among('\u0578\u0582\u0581', 47, 1)];
            }
        }, {
            key: 'g_v',
            get: function get() {
                delete armenianStemmer.g_v;
                return armenianStemmer.g_v = [209, 4, 128, 0, 18];
            }
        }]);

        return armenianStemmer;
    }(SnowballStemmer);

    var basqueStemmer = function (_SnowballStemmer3) {
        _inherits(basqueStemmer, _SnowballStemmer3);

        function basqueStemmer() {
            _classCallCheck(this, basqueStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(basqueStemmer).apply(this, arguments));
        }

        _createClass(basqueStemmer, [{
            key: 'r_mark_regions$esjava$0',
            value: function r_mark_regions$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_6 = void 0;
                var v_8 = void 0;
                this.I_pV = this.limit;
                this.I_p1 = this.limit;
                this.I_p2 = this.limit;
                v_1 = this.cursor;
                lab0: do {
                    lab1: do {
                        v_2 = this.cursor;
                        lab2: do {
                            if (!this.in_grouping$esjava$3(basqueStemmer.g_v, 97, 117)) {
                                break lab2;
                            }
                            lab3: do {
                                v_3 = this.cursor;
                                lab4: do {
                                    if (!this.out_grouping$esjava$3(basqueStemmer.g_v, 97, 117)) {
                                        break lab4;
                                    }
                                    golab5: while (true) {
                                        lab6: do {
                                            if (!this.in_grouping$esjava$3(basqueStemmer.g_v, 97, 117)) {
                                                break lab6;
                                            }
                                            break golab5;
                                        } while (false);
                                        if (this.cursor >= this.limit) {
                                            break lab4;
                                        }
                                        this.cursor++;
                                    }
                                    break lab3;
                                } while (false);
                                this.cursor = v_3;
                                if (!this.in_grouping$esjava$3(basqueStemmer.g_v, 97, 117)) {
                                    break lab2;
                                }
                                golab7: while (true) {
                                    lab8: do {
                                        if (!this.out_grouping$esjava$3(basqueStemmer.g_v, 97, 117)) {
                                            break lab8;
                                        }
                                        break golab7;
                                    } while (false);
                                    if (this.cursor >= this.limit) {
                                        break lab2;
                                    }
                                    this.cursor++;
                                }
                            } while (false);
                            break lab1;
                        } while (false);
                        this.cursor = v_2;
                        if (!this.out_grouping$esjava$3(basqueStemmer.g_v, 97, 117)) {
                            break lab0;
                        }
                        lab9: do {
                            v_6 = this.cursor;
                            lab10: do {
                                if (!this.out_grouping$esjava$3(basqueStemmer.g_v, 97, 117)) {
                                    break lab10;
                                }
                                golab11: while (true) {
                                    lab12: do {
                                        if (!this.in_grouping$esjava$3(basqueStemmer.g_v, 97, 117)) {
                                            break lab12;
                                        }
                                        break golab11;
                                    } while (false);
                                    if (this.cursor >= this.limit) {
                                        break lab10;
                                    }
                                    this.cursor++;
                                }
                                break lab9;
                            } while (false);
                            this.cursor = v_6;
                            if (!this.in_grouping$esjava$3(basqueStemmer.g_v, 97, 117)) {
                                break lab0;
                            }
                            if (this.cursor >= this.limit) {
                                break lab0;
                            }
                            this.cursor++;
                        } while (false);
                    } while (false);
                    this.I_pV = this.cursor;
                } while (false);
                this.cursor = v_1;
                v_8 = this.cursor;
                lab13: do {
                    golab14: while (true) {
                        lab15: do {
                            if (!this.in_grouping$esjava$3(basqueStemmer.g_v, 97, 117)) {
                                break lab15;
                            }
                            break golab14;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab13;
                        }
                        this.cursor++;
                    }
                    golab16: while (true) {
                        lab17: do {
                            if (!this.out_grouping$esjava$3(basqueStemmer.g_v, 97, 117)) {
                                break lab17;
                            }
                            break golab16;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab13;
                        }
                        this.cursor++;
                    }
                    this.I_p1 = this.cursor;
                    golab18: while (true) {
                        lab19: do {
                            if (!this.in_grouping$esjava$3(basqueStemmer.g_v, 97, 117)) {
                                break lab19;
                            }
                            break golab18;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab13;
                        }
                        this.cursor++;
                    }
                    golab20: while (true) {
                        lab21: do {
                            if (!this.out_grouping$esjava$3(basqueStemmer.g_v, 97, 117)) {
                                break lab21;
                            }
                            break golab20;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab13;
                        }
                        this.cursor++;
                    }
                    this.I_p2 = this.cursor;
                } while (false);
                this.cursor = v_8;
                return true;
            }
        }, {
            key: 'r_RV$esjava$0',
            value: function r_RV$esjava$0() {
                if (!(this.I_pV <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_R2$esjava$0',
            value: function r_R2$esjava$0() {
                if (!(this.I_p2 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_R1$esjava$0',
            value: function r_R1$esjava$0() {
                if (!(this.I_p1 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_aditzak$esjava$0',
            value: function r_aditzak$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(basqueStemmer.a_0);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!this.r_RV$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 3:
                        this.slice_from$esjava$1("atseden");
                        break;
                    case 4:
                        this.slice_from$esjava$1("arabera");
                        break;
                    case 5:
                        this.slice_from$esjava$1("baditu");
                        break;
                }
                return true;
            }
        }, {
            key: 'r_izenak$esjava$0',
            value: function r_izenak$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(basqueStemmer.a_1);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!this.r_RV$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 3:
                        this.slice_from$esjava$1("jok");
                        break;
                    case 4:
                        if (!this.r_R1$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 5:
                        this.slice_from$esjava$1("tra");
                        break;
                    case 6:
                        this.slice_from$esjava$1("minutu");
                        break;
                    case 7:
                        this.slice_from$esjava$1("zehar");
                        break;
                    case 8:
                        this.slice_from$esjava$1("geldi");
                        break;
                    case 9:
                        this.slice_from$esjava$1("igaro");
                        break;
                    case 10:
                        this.slice_from$esjava$1("aurka");
                        break;
                }
                return true;
            }
        }, {
            key: 'r_adjetiboak$esjava$0',
            value: function r_adjetiboak$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(basqueStemmer.a_2);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!this.r_RV$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        this.slice_from$esjava$1("z");
                        break;
                }
                return true;
            }
        }, {
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                v_1 = this.cursor;
                lab0: do {
                    if (!this.r_mark_regions$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = v_1;
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                replab1: while (true) {
                    v_2 = this.limit - this.cursor;
                    lab2: do {
                        if (!this.r_aditzak$esjava$0()) {
                            break lab2;
                        }
                        continue replab1;
                    } while (false);
                    this.cursor = this.limit - v_2;
                    break replab1;
                }
                replab3: while (true) {
                    v_3 = this.limit - this.cursor;
                    lab4: do {
                        if (!this.r_izenak$esjava$0()) {
                            break lab4;
                        }
                        continue replab3;
                    } while (false);
                    this.cursor = this.limit - v_3;
                    break replab3;
                }
                v_4 = this.limit - this.cursor;
                lab5: do {
                    if (!this.r_adjetiboak$esjava$0()) {
                        break lab5;
                    }
                } while (false);
                this.cursor = this.limit - v_4;
                this.cursor = this.limit_backward;
                return true;
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get27;

                for (var _len26 = arguments.length, args = Array(_len26), _key26 = 0; _key26 < _len26; _key26++) {
                    args[_key26] = arguments[_key26];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get27 = _get(Object.getPrototypeOf(basqueStemmer.prototype), 'stem', this)).call.apply(_get27, [this].concat(args));
            }
        }, {
            key: 'I_p2',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p2') ? this._$esjava$I_p2 : this._$esjava$I_p2 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p2 = v;
            }
        }, {
            key: 'I_p1',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p1') ? this._$esjava$I_p1 : this._$esjava$I_p1 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p1 = v;
            }
        }, {
            key: 'I_pV',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_pV') ? this._$esjava$I_pV : this._$esjava$I_pV = 0;
            },
            set: function set(v) {
                this._$esjava$I_pV = v;
            }
        }], [{
            key: 'a_0',
            get: function get() {
                delete basqueStemmer.a_0;
                return basqueStemmer.a_0 = [new Among("idea", -1, 1), new Among("bidea", 0, 1), new Among("kidea", 0, 1), new Among("pidea", 0, 1), new Among("kundea", -1, 1), new Among("galea", -1, 1), new Among("tailea", -1, 1), new Among("tzailea", -1, 1), new Among("gunea", -1, 1), new Among("kunea", -1, 1), new Among("tzaga", -1, 1), new Among("gaia", -1, 1), new Among("aldia", -1, 1), new Among("taldia", 12, 1), new Among("karia", -1, 1), new Among("garria", -1, 2), new Among("karria", -1, 1), new Among("ka", -1, 1), new Among("tzaka", 17, 1), new Among("la", -1, 1), new Among("mena", -1, 1), new Among("pena", -1, 1), new Among("kina", -1, 1), new Among("ezina", -1, 1), new Among("tezina", 23, 1), new Among("kuna", -1, 1), new Among("tuna", -1, 1), new Among("kizuna", -1, 1), new Among("era", -1, 1), new Among("bera", 28, 1), new Among("arabera", 29, 4), new Among("kera", 28, 1), new Among("pera", 28, 1), new Among("orra", -1, 1), new Among("korra", 33, 1), new Among("dura", -1, 1), new Among("gura", -1, 1), new Among("kura", -1, 1), new Among("tura", -1, 1), new Among("eta", -1, 1), new Among("keta", 39, 1), new Among("gailua", -1, 1), new Among("eza", -1, 1), new Among("erreza", 42, 1), new Among("tza", -1, 2), new Among("gaitza", 44, 1), new Among("kaitza", 44, 1), new Among("kuntza", 44, 1), new Among("ide", -1, 1), new Among("bide", 48, 1), new Among("kide", 48, 1), new Among("pide", 48, 1), new Among("kunde", -1, 1), new Among("tzake", -1, 1), new Among("tzeke", -1, 1), new Among("le", -1, 1), new Among("gale", 55, 1), new Among("taile", 55, 1), new Among("tzaile", 55, 1), new Among("gune", -1, 1), new Among("kune", -1, 1), new Among("tze", -1, 1), new Among("atze", 61, 1), new Among("gai", -1, 1), new Among("aldi", -1, 1), new Among("taldi", 64, 1), new Among("ki", -1, 1), new Among("ari", -1, 1), new Among("kari", 67, 1), new Among("lari", 67, 1), new Among("tari", 67, 1), new Among("etari", 70, 1), new Among("garri", -1, 2), new Among("karri", -1, 1), new Among("arazi", -1, 1), new Among("tarazi", 74, 1), new Among("an", -1, 1), new Among("ean", 76, 1), new Among("rean", 77, 1), new Among("kan", 76, 1), new Among("etan", 76, 1), new Among("atseden", -1, 3), new Among("men", -1, 1), new Among("pen", -1, 1), new Among("kin", -1, 1), new Among("rekin", 84, 1), new Among("ezin", -1, 1), new Among("tezin", 86, 1), new Among("tun", -1, 1), new Among("kizun", -1, 1), new Among("go", -1, 1), new Among("ago", 90, 1), new Among("tio", -1, 1), new Among("dako", -1, 1), new Among("or", -1, 1), new Among("kor", 94, 1), new Among("tzat", -1, 1), new Among("du", -1, 1), new Among("gailu", -1, 1), new Among("tu", -1, 1), new Among("atu", 99, 1), new Among("aldatu", 100, 1), new Among("tatu", 100, 1), new Among("baditu", 99, 5), new Among("ez", -1, 1), new Among("errez", 104, 1), new Among("tzez", 104, 1), new Among("gaitz", -1, 1), new Among("kaitz", -1, 1)];
            }
        }, {
            key: 'a_1',
            get: function get() {
                delete basqueStemmer.a_1;
                return basqueStemmer.a_1 = [new Among("ada", -1, 1), new Among("kada", 0, 1), new Among("anda", -1, 1), new Among("denda", -1, 1), new Among("gabea", -1, 1), new Among("kabea", -1, 1), new Among("aldea", -1, 1), new Among("kaldea", 6, 1), new Among("taldea", 6, 1), new Among("ordea", -1, 1), new Among("zalea", -1, 1), new Among("tzalea", 10, 1), new Among("gilea", -1, 1), new Among("emea", -1, 1), new Among("kumea", -1, 1), new Among("nea", -1, 1), new Among("enea", 15, 1), new Among("zionea", 15, 1), new Among("unea", 15, 1), new Among("gunea", 18, 1), new Among("pea", -1, 1), new Among("aurrea", -1, 1), new Among("tea", -1, 1), new Among("kotea", 22, 1), new Among("artea", 22, 1), new Among("ostea", 22, 1), new Among("etxea", -1, 1), new Among("ga", -1, 1), new Among("anga", 27, 1), new Among("gaia", -1, 1), new Among("aldia", -1, 1), new Among("taldia", 30, 1), new Among("handia", -1, 1), new Among("mendia", -1, 1), new Among("geia", -1, 1), new Among("egia", -1, 1), new Among("degia", 35, 1), new Among("tegia", 35, 1), new Among("nahia", -1, 1), new Among("ohia", -1, 1), new Among("kia", -1, 1), new Among("tokia", 40, 1), new Among("oia", -1, 1), new Among("koia", 42, 1), new Among("aria", -1, 1), new Among("karia", 44, 1), new Among("laria", 44, 1), new Among("taria", 44, 1), new Among("eria", -1, 1), new Among("keria", 48, 1), new Among("teria", 48, 1), new Among("garria", -1, 2), new Among("larria", -1, 1), new Among("kirria", -1, 1), new Among("duria", -1, 1), new Among("asia", -1, 1), new Among("tia", -1, 1), new Among("ezia", -1, 1), new Among("bizia", -1, 1), new Among("ontzia", -1, 1), new Among("ka", -1, 1), new Among("joka", 60, 3), new Among("aurka", 60, 10), new Among("ska", 60, 1), new Among("xka", 60, 1), new Among("zka", 60, 1), new Among("gibela", -1, 1), new Among("gela", -1, 1), new Among("kaila", -1, 1), new Among("skila", -1, 1), new Among("tila", -1, 1), new Among("ola", -1, 1), new Among("na", -1, 1), new Among("kana", 72, 1), new Among("ena", 72, 1), new Among("garrena", 74, 1), new Among("gerrena", 74, 1), new Among("urrena", 74, 1), new Among("zaina", 72, 1), new Among("tzaina", 78, 1), new Among("kina", 72, 1), new Among("mina", 72, 1), new Among("garna", 72, 1), new Among("una", 72, 1), new Among("duna", 83, 1), new Among("asuna", 83, 1), new Among("tasuna", 85, 1), new Among("ondoa", -1, 1), new Among("kondoa", 87, 1), new Among("ngoa", -1, 1), new Among("zioa", -1, 1), new Among("koa", -1, 1), new Among("takoa", 91, 1), new Among("zkoa", 91, 1), new Among("noa", -1, 1), new Among("zinoa", 94, 1), new Among("aroa", -1, 1), new Among("taroa", 96, 1), new Among("zaroa", 96, 1), new Among("eroa", -1, 1), new Among("oroa", -1, 1), new Among("osoa", -1, 1), new Among("toa", -1, 1), new Among("ttoa", 102, 1), new Among("ztoa", 102, 1), new Among("txoa", -1, 1), new Among("tzoa", -1, 1), new Among('\u00F1oa', -1, 1), new Among("ra", -1, 1), new Among("ara", 108, 1), new Among("dara", 109, 1), new Among("liara", 109, 1), new Among("tiara", 109, 1), new Among("tara", 109, 1), new Among("etara", 113, 1), new Among("tzara", 109, 1), new Among("bera", 108, 1), new Among("kera", 108, 1), new Among("pera", 108, 1), new Among("ora", 108, 2), new Among("tzarra", 108, 1), new Among("korra", 108, 1), new Among("tra", 108, 1), new Among("sa", -1, 1), new Among("osa", 123, 1), new Among("ta", -1, 1), new Among("eta", 125, 1), new Among("keta", 126, 1), new Among("sta", 125, 1), new Among("dua", -1, 1), new Among("mendua", 129, 1), new Among("ordua", 129, 1), new Among("lekua", -1, 1), new Among("burua", -1, 1), new Among("durua", -1, 1), new Among("tsua", -1, 1), new Among("tua", -1, 1), new Among("mentua", 136, 1), new Among("estua", 136, 1), new Among("txua", -1, 1), new Among("zua", -1, 1), new Among("tzua", 140, 1), new Among("za", -1, 1), new Among("eza", 142, 1), new Among("eroza", 142, 1), new Among("tza", 142, 2), new Among("koitza", 145, 1), new Among("antza", 145, 1), new Among("gintza", 145, 1), new Among("kintza", 145, 1), new Among("kuntza", 145, 1), new Among("gabe", -1, 1), new Among("kabe", -1, 1), new Among("kide", -1, 1), new Among("alde", -1, 1), new Among("kalde", 154, 1), new Among("talde", 154, 1), new Among("orde", -1, 1), new Among("ge", -1, 1), new Among("zale", -1, 1), new Among("tzale", 159, 1), new Among("gile", -1, 1), new Among("eme", -1, 1), new Among("kume", -1, 1), new Among("ne", -1, 1), new Among("zione", 164, 1), new Among("une", 164, 1), new Among("gune", 166, 1), new Among("pe", -1, 1), new Among("aurre", -1, 1), new Among("te", -1, 1), new Among("kote", 170, 1), new Among("arte", 170, 1), new Among("oste", 170, 1), new Among("etxe", -1, 1), new Among("gai", -1, 1), new Among("di", -1, 1), new Among("aldi", 176, 1), new Among("taldi", 177, 1), new Among("geldi", 176, 8), new Among("handi", 176, 1), new Among("mendi", 176, 1), new Among("gei", -1, 1), new Among("egi", -1, 1), new Among("degi", 183, 1), new Among("tegi", 183, 1), new Among("nahi", -1, 1), new Among("ohi", -1, 1), new Among("ki", -1, 1), new Among("toki", 188, 1), new Among("oi", -1, 1), new Among("goi", 190, 1), new Among("koi", 190, 1), new Among("ari", -1, 1), new Among("kari", 193, 1), new Among("lari", 193, 1), new Among("tari", 193, 1), new Among("garri", -1, 2), new Among("larri", -1, 1), new Among("kirri", -1, 1), new Among("duri", -1, 1), new Among("asi", -1, 1), new Among("ti", -1, 1), new Among("ontzi", -1, 1), new Among('\u00F1i', -1, 1), new Among("ak", -1, 1), new Among("ek", -1, 1), new Among("tarik", -1, 1), new Among("gibel", -1, 1), new Among("ail", -1, 1), new Among("kail", 209, 1), new Among("kan", -1, 1), new Among("tan", -1, 1), new Among("etan", 212, 1), new Among("en", -1, 4), new Among("ren", 214, 2), new Among("garren", 215, 1), new Among("gerren", 215, 1), new Among("urren", 215, 1), new Among("ten", 214, 4), new Among("tzen", 214, 4), new Among("zain", -1, 1), new Among("tzain", 221, 1), new Among("kin", -1, 1), new Among("min", -1, 1), new Among("dun", -1, 1), new Among("asun", -1, 1), new Among("tasun", 226, 1), new Among("aizun", -1, 1), new Among("ondo", -1, 1), new Among("kondo", 229, 1), new Among("go", -1, 1), new Among("ngo", 231, 1), new Among("zio", -1, 1), new Among("ko", -1, 1), new Among("trako", 234, 5), new Among("tako", 234, 1), new Among("etako", 236, 1), new Among("eko", 234, 1), new Among("tariko", 234, 1), new Among("sko", 234, 1), new Among("tuko", 234, 1), new Among("minutuko", 241, 6), new Among("zko", 234, 1), new Among("no", -1, 1), new Among("zino", 244, 1), new Among("ro", -1, 1), new Among("aro", 246, 1), new Among("igaro", 247, 9), new Among("taro", 247, 1), new Among("zaro", 247, 1), new Among("ero", 246, 1), new Among("giro", 246, 1), new Among("oro", 246, 1), new Among("oso", -1, 1), new Among("to", -1, 1), new Among("tto", 255, 1), new Among("zto", 255, 1), new Among("txo", -1, 1), new Among("tzo", -1, 1), new Among("gintzo", 259, 1), new Among('\u00F1o', -1, 1), new Among("zp", -1, 1), new Among("ar", -1, 1), new Among("dar", 263, 1), new Among("behar", 263, 1), new Among("zehar", 263, 7), new Among("liar", 263, 1), new Among("tiar", 263, 1), new Among("tar", 263, 1), new Among("tzar", 263, 1), new Among("or", -1, 2), new Among("kor", 271, 1), new Among("os", -1, 1), new Among("ket", -1, 1), new Among("du", -1, 1), new Among("mendu", 275, 1), new Among("ordu", 275, 1), new Among("leku", -1, 1), new Among("buru", -1, 2), new Among("duru", -1, 1), new Among("tsu", -1, 1), new Among("tu", -1, 1), new Among("tatu", 282, 4), new Among("mentu", 282, 1), new Among("estu", 282, 1), new Among("txu", -1, 1), new Among("zu", -1, 1), new Among("tzu", 287, 1), new Among("gintzu", 288, 1), new Among("z", -1, 1), new Among("ez", 290, 1), new Among("eroz", 290, 1), new Among("tz", 290, 1), new Among("koitz", 293, 1)];
            }
        }, {
            key: 'a_2',
            get: function get() {
                delete basqueStemmer.a_2;
                return basqueStemmer.a_2 = [new Among("zlea", -1, 2), new Among("keria", -1, 1), new Among("la", -1, 1), new Among("era", -1, 1), new Among("dade", -1, 1), new Among("tade", -1, 1), new Among("date", -1, 1), new Among("tate", -1, 1), new Among("gi", -1, 1), new Among("ki", -1, 1), new Among("ik", -1, 1), new Among("lanik", 10, 1), new Among("rik", 10, 1), new Among("larik", 12, 1), new Among("ztik", 10, 1), new Among("go", -1, 1), new Among("ro", -1, 1), new Among("ero", 16, 1), new Among("to", -1, 1)];
            }
        }, {
            key: 'g_v',
            get: function get() {
                delete basqueStemmer.g_v;
                return basqueStemmer.g_v = [17, 65, 16];
            }
        }]);

        return basqueStemmer;
    }(SnowballStemmer);

    var catalanStemmer = function (_SnowballStemmer4) {
        _inherits(catalanStemmer, _SnowballStemmer4);

        function catalanStemmer() {
            _classCallCheck(this, catalanStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(catalanStemmer).apply(this, arguments));
        }

        _createClass(catalanStemmer, [{
            key: 'r_mark_regions$esjava$0',
            value: function r_mark_regions$esjava$0() {
                var v_1 = void 0;
                this.I_p1 = this.limit;
                this.I_p2 = this.limit;
                v_1 = this.cursor;
                lab0: do {
                    golab1: while (true) {
                        lab2: do {
                            if (!this.in_grouping$esjava$3(catalanStemmer.g_v, 97, 252)) {
                                break lab2;
                            }
                            break golab1;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab0;
                        }
                        this.cursor++;
                    }
                    golab3: while (true) {
                        lab4: do {
                            if (!this.out_grouping$esjava$3(catalanStemmer.g_v, 97, 252)) {
                                break lab4;
                            }
                            break golab3;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab0;
                        }
                        this.cursor++;
                    }
                    this.I_p1 = this.cursor;
                    golab5: while (true) {
                        lab6: do {
                            if (!this.in_grouping$esjava$3(catalanStemmer.g_v, 97, 252)) {
                                break lab6;
                            }
                            break golab5;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab0;
                        }
                        this.cursor++;
                    }
                    golab7: while (true) {
                        lab8: do {
                            if (!this.out_grouping$esjava$3(catalanStemmer.g_v, 97, 252)) {
                                break lab8;
                            }
                            break golab7;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab0;
                        }
                        this.cursor++;
                    }
                    this.I_p2 = this.cursor;
                } while (false);
                this.cursor = v_1;
                return true;
            }
        }, {
            key: 'r_cleaning$esjava$0',
            value: function r_cleaning$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                replab0: while (true) {
                    v_1 = this.cursor;
                    lab1: do {
                        this.bra = this.cursor;
                        among_var = this.find_among$esjava$1(catalanStemmer.a_0);
                        if (among_var === 0) {
                            break lab1;
                        }
                        this.ket = this.cursor;
                        switch (among_var) {
                            case 0:
                                break lab1;
                            case 1:
                                this.slice_from$esjava$1("a");
                                break;
                            case 2:
                                this.slice_from$esjava$1("a");
                                break;
                            case 3:
                                this.slice_from$esjava$1("e");
                                break;
                            case 4:
                                this.slice_from$esjava$1("e");
                                break;
                            case 5:
                                this.slice_from$esjava$1("i");
                                break;
                            case 6:
                                this.slice_from$esjava$1("i");
                                break;
                            case 7:
                                this.slice_from$esjava$1("o");
                                break;
                            case 8:
                                this.slice_from$esjava$1("o");
                                break;
                            case 9:
                                this.slice_from$esjava$1("u");
                                break;
                            case 10:
                                this.slice_from$esjava$1("u");
                                break;
                            case 11:
                                this.slice_from$esjava$1("i");
                                break;
                            case 12:
                                this.slice_from$esjava$1(".");
                                break;
                            case 13:
                                if (this.cursor >= this.limit) {
                                    break lab1;
                                }
                                this.cursor++;
                                break;
                        }
                        continue replab0;
                    } while (false);
                    this.cursor = v_1;
                    break replab0;
                }
                return true;
            }
        }, {
            key: 'r_R1$esjava$0',
            value: function r_R1$esjava$0() {
                if (!(this.I_p1 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_R2$esjava$0',
            value: function r_R2$esjava$0() {
                if (!(this.I_p2 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_attached_pronoun$esjava$0',
            value: function r_attached_pronoun$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(catalanStemmer.a_1);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!this.r_R1$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_standard_suffix$esjava$0',
            value: function r_standard_suffix$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(catalanStemmer.a_2);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!this.r_R1$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 3:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_from$esjava$1("log");
                        break;
                    case 4:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_from$esjava$1("ic");
                        break;
                    case 5:
                        if (!this.r_R1$esjava$0()) {
                            return false;
                        }
                        this.slice_from$esjava$1("c");
                        break;
                }
                return true;
            }
        }, {
            key: 'r_verb_suffix$esjava$0',
            value: function r_verb_suffix$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(catalanStemmer.a_3);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!this.r_R1$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_residual_suffix$esjava$0',
            value: function r_residual_suffix$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(catalanStemmer.a_4);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!this.r_R1$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!this.r_R1$esjava$0()) {
                            return false;
                        }
                        this.slice_from$esjava$1("ic");
                        break;
                }
                return true;
            }
        }, {
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                v_1 = this.cursor;
                lab0: do {
                    if (!this.r_mark_regions$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = v_1;
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                v_2 = this.limit - this.cursor;
                lab1: do {
                    if (!this.r_attached_pronoun$esjava$0()) {
                        break lab1;
                    }
                } while (false);
                this.cursor = this.limit - v_2;
                v_3 = this.limit - this.cursor;
                lab2: do {
                    lab3: do {
                        v_4 = this.limit - this.cursor;
                        lab4: do {
                            if (!this.r_standard_suffix$esjava$0()) {
                                break lab4;
                            }
                            break lab3;
                        } while (false);
                        this.cursor = this.limit - v_4;
                        if (!this.r_verb_suffix$esjava$0()) {
                            break lab2;
                        }
                    } while (false);
                } while (false);
                this.cursor = this.limit - v_3;
                v_5 = this.limit - this.cursor;
                lab5: do {
                    if (!this.r_residual_suffix$esjava$0()) {
                        break lab5;
                    }
                } while (false);
                this.cursor = this.limit - v_5;
                this.cursor = this.limit_backward;
                v_6 = this.cursor;
                lab6: do {
                    if (!this.r_cleaning$esjava$0()) {
                        break lab6;
                    }
                } while (false);
                this.cursor = v_6;
                return true;
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get28;

                for (var _len27 = arguments.length, args = Array(_len27), _key27 = 0; _key27 < _len27; _key27++) {
                    args[_key27] = arguments[_key27];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get28 = _get(Object.getPrototypeOf(catalanStemmer.prototype), 'stem', this)).call.apply(_get28, [this].concat(args));
            }
        }, {
            key: 'I_p2',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p2') ? this._$esjava$I_p2 : this._$esjava$I_p2 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p2 = v;
            }
        }, {
            key: 'I_p1',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p1') ? this._$esjava$I_p1 : this._$esjava$I_p1 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p1 = v;
            }
        }], [{
            key: 'a_0',
            get: function get() {
                delete catalanStemmer.a_0;
                return catalanStemmer.a_0 = [new Among("", -1, 13), new Among('\u00B7', 0, 12), new Among('\u00E0', 0, 2), new Among('\u00E1', 0, 1), new Among('\u00E8', 0, 4), new Among('\u00E9', 0, 3), new Among('\u00EC', 0, 6), new Among('\u00ED', 0, 5), new Among('\u00EF', 0, 11), new Among('\u00F2', 0, 8), new Among('\u00F3', 0, 7), new Among('\u00FA', 0, 9), new Among('\u00FC', 0, 10)];
            }
        }, {
            key: 'a_1',
            get: function get() {
                delete catalanStemmer.a_1;
                return catalanStemmer.a_1 = [new Among("la", -1, 1), new Among("-la", 0, 1), new Among("sela", 0, 1), new Among("le", -1, 1), new Among("me", -1, 1), new Among("-me", 4, 1), new Among("se", -1, 1), new Among("-te", -1, 1), new Among("hi", -1, 1), new Among("'hi", 8, 1), new Among("li", -1, 1), new Among("-li", 10, 1), new Among("'l", -1, 1), new Among("'m", -1, 1), new Among("-m", -1, 1), new Among("'n", -1, 1), new Among("-n", -1, 1), new Among("ho", -1, 1), new Among("'ho", 17, 1), new Among("lo", -1, 1), new Among("selo", 19, 1), new Among("'s", -1, 1), new Among("las", -1, 1), new Among("selas", 22, 1), new Among("les", -1, 1), new Among("-les", 24, 1), new Among("'ls", -1, 1), new Among("-ls", -1, 1), new Among("'ns", -1, 1), new Among("-ns", -1, 1), new Among("ens", -1, 1), new Among("los", -1, 1), new Among("selos", 31, 1), new Among("nos", -1, 1), new Among("-nos", 33, 1), new Among("vos", -1, 1), new Among("us", -1, 1), new Among("-us", 36, 1), new Among("'t", -1, 1)];
            }
        }, {
            key: 'a_2',
            get: function get() {
                delete catalanStemmer.a_2;
                return catalanStemmer.a_2 = [new Among("ica", -1, 4), new Among('l\u00F3gica', 0, 3), new Among("enca", -1, 1), new Among("ada", -1, 2), new Among("ancia", -1, 1), new Among("encia", -1, 1), new Among('\u00E8ncia', -1, 1), new Among('\u00EDcia', -1, 1), new Among("logia", -1, 3), new Among("inia", -1, 1), new Among('\u00EDinia', 9, 1), new Among("eria", -1, 1), new Among('\u00E0ria', -1, 1), new Among('at\u00F2ria', -1, 1), new Among("alla", -1, 1), new Among("ella", -1, 1), new Among('\u00EDvola', -1, 1), new Among("ima", -1, 1), new Among('\u00EDssima', 17, 1), new Among('qu\u00EDssima', 18, 5), new Among("ana", -1, 1), new Among("ina", -1, 1), new Among("era", -1, 1), new Among("sfera", 22, 1), new Among("ora", -1, 1), new Among("dora", 24, 1), new Among("adora", 25, 1), new Among("adura", -1, 1), new Among("esa", -1, 1), new Among("osa", -1, 1), new Among("assa", -1, 1), new Among("essa", -1, 1), new Among("issa", -1, 1), new Among("eta", -1, 1), new Among("ita", -1, 1), new Among("ota", -1, 1), new Among("ista", -1, 1), new Among("ialista", 36, 1), new Among("ionista", 36, 1), new Among("iva", -1, 1), new Among("ativa", 39, 1), new Among('n\u00E7a', -1, 1), new Among('log\u00EDa', -1, 3), new Among("ic", -1, 4), new Among('\u00EDstic', 43, 1), new Among("enc", -1, 1), new Among("esc", -1, 1), new Among("ud", -1, 1), new Among("atge", -1, 1), new Among("ble", -1, 1), new Among("able", 49, 1), new Among("ible", 49, 1), new Among("isme", -1, 1), new Among("ialisme", 52, 1), new Among("ionisme", 52, 1), new Among("ivisme", 52, 1), new Among("aire", -1, 1), new Among("icte", -1, 1), new Among("iste", -1, 1), new Among("ici", -1, 1), new Among('\u00EDci', -1, 1), new Among("logi", -1, 3), new Among("ari", -1, 1), new Among("tori", -1, 1), new Among("al", -1, 1), new Among("il", -1, 1), new Among("all", -1, 1), new Among("ell", -1, 1), new Among('\u00EDvol', -1, 1), new Among("isam", -1, 1), new Among("issem", -1, 1), new Among('\u00ECssem', -1, 1), new Among('\u00EDssem', -1, 1), new Among('\u00EDssim', -1, 1), new Among('qu\u00EDssim', 73, 5), new Among("amen", -1, 1), new Among('\u00ECssin', -1, 1), new Among("ar", -1, 1), new Among("ificar", 77, 1), new Among("egar", 77, 1), new Among("ejar", 77, 1), new Among("itar", 77, 1), new Among("itzar", 77, 1), new Among("fer", -1, 1), new Among("or", -1, 1), new Among("dor", 84, 1), new Among("dur", -1, 1), new Among("doras", -1, 1), new Among("ics", -1, 4), new Among('l\u00F3gics', 88, 3), new Among("uds", -1, 1), new Among("nces", -1, 1), new Among("ades", -1, 2), new Among("ancies", -1, 1), new Among("encies", -1, 1), new Among('\u00E8ncies', -1, 1), new Among('\u00EDcies', -1, 1), new Among("logies", -1, 3), new Among("inies", -1, 1), new Among('\u00EDnies', -1, 1), new Among("eries", -1, 1), new Among('\u00E0ries', -1, 1), new Among('at\u00F2ries', -1, 1), new Among("bles", -1, 1), new Among("ables", 103, 1), new Among("ibles", 103, 1), new Among("imes", -1, 1), new Among('\u00EDssimes', 106, 1), new Among('qu\u00EDssimes', 107, 5), new Among("formes", -1, 1), new Among("ismes", -1, 1), new Among("ialismes", 110, 1), new Among("ines", -1, 1), new Among("eres", -1, 1), new Among("ores", -1, 1), new Among("dores", 114, 1), new Among("idores", 115, 1), new Among("dures", -1, 1), new Among("eses", -1, 1), new Among("oses", -1, 1), new Among("asses", -1, 1), new Among("ictes", -1, 1), new Among("ites", -1, 1), new Among("otes", -1, 1), new Among("istes", -1, 1), new Among("ialistes", 124, 1), new Among("ionistes", 124, 1), new Among("iques", -1, 4), new Among('l\u00F3giques', 127, 3), new Among("ives", -1, 1), new Among("atives", 129, 1), new Among('log\u00EDes', -1, 3), new Among('alleng\u00FCes', -1, 1), new Among("icis", -1, 1), new Among('\u00EDcis', -1, 1), new Among("logis", -1, 3), new Among("aris", -1, 1), new Among("toris", -1, 1), new Among("ls", -1, 1), new Among("als", 138, 1), new Among("ells", 138, 1), new Among("ims", -1, 1), new Among('\u00EDssims', 141, 1), new Among('qu\u00EDssims', 142, 5), new Among("ions", -1, 1), new Among("cions", 144, 1), new Among("acions", 145, 2), new Among("esos", -1, 1), new Among("osos", -1, 1), new Among("assos", -1, 1), new Among("issos", -1, 1), new Among("ers", -1, 1), new Among("ors", -1, 1), new Among("dors", 152, 1), new Among("adors", 153, 1), new Among("idors", 153, 1), new Among("ats", -1, 1), new Among("itats", 156, 1), new Among("bilitats", 157, 1), new Among("ivitats", 157, 1), new Among("ativitats", 159, 1), new Among('\u00EFtats', 156, 1), new Among("ets", -1, 1), new Among("ants", -1, 1), new Among("ents", -1, 1), new Among("ments", 164, 1), new Among("aments", 165, 1), new Among("ots", -1, 1), new Among("uts", -1, 1), new Among("ius", -1, 1), new Among("trius", 169, 1), new Among("atius", 169, 1), new Among('\u00E8s', -1, 1), new Among('\u00E9s', -1, 1), new Among('\u00EDs', -1, 1), new Among('d\u00EDs', 174, 1), new Among('\u00F3s', -1, 1), new Among("itat", -1, 1), new Among("bilitat", 177, 1), new Among("ivitat", 177, 1), new Among("ativitat", 179, 1), new Among('\u00EFtat', -1, 1), new Among("et", -1, 1), new Among("ant", -1, 1), new Among("ent", -1, 1), new Among("ient", 184, 1), new Among("ment", 184, 1), new Among("ament", 186, 1), new Among("isament", 187, 1), new Among("ot", -1, 1), new Among("isseu", -1, 1), new Among('\u00ECsseu', -1, 1), new Among('\u00EDsseu', -1, 1), new Among("triu", -1, 1), new Among('\u00EDssiu', -1, 1), new Among("atiu", -1, 1), new Among('\u00F3', -1, 1), new Among('i\u00F3', 196, 1), new Among('ci\u00F3', 197, 1), new Among('aci\u00F3', 198, 1)];
            }
        }, {
            key: 'a_3',
            get: function get() {
                delete catalanStemmer.a_3;
                return catalanStemmer.a_3 = [new Among("aba", -1, 1), new Among("esca", -1, 1), new Among("isca", -1, 1), new Among('\u00EFsca', -1, 1), new Among("ada", -1, 1), new Among("ida", -1, 1), new Among("uda", -1, 1), new Among('\u00EFda', -1, 1), new Among("ia", -1, 1), new Among("aria", 8, 1), new Among("iria", 8, 1), new Among("ara", -1, 1), new Among("iera", -1, 1), new Among("ira", -1, 1), new Among("adora", -1, 1), new Among('\u00EFra', -1, 1), new Among("ava", -1, 1), new Among("ixa", -1, 1), new Among("itza", -1, 1), new Among('\u00EDa', -1, 1), new Among('ar\u00EDa', 19, 1), new Among('er\u00EDa', 19, 1), new Among('ir\u00EDa', 19, 1), new Among('\u00EFa', -1, 1), new Among("isc", -1, 1), new Among('\u00EFsc', -1, 1), new Among("ad", -1, 1), new Among("ed", -1, 1), new Among("id", -1, 1), new Among("ie", -1, 1), new Among("re", -1, 1), new Among("dre", 30, 1), new Among("ase", -1, 1), new Among("iese", -1, 1), new Among("aste", -1, 1), new Among("iste", -1, 1), new Among("ii", -1, 1), new Among("ini", -1, 1), new Among("esqui", -1, 1), new Among("eixi", -1, 1), new Among("itzi", -1, 1), new Among("am", -1, 1), new Among("em", -1, 1), new Among("arem", 42, 1), new Among("irem", 42, 1), new Among('\u00E0rem', 42, 1), new Among('\u00EDrem', 42, 1), new Among('\u00E0ssem', 42, 1), new Among('\u00E9ssem', 42, 1), new Among("iguem", 42, 1), new Among('\u00EFguem', 42, 1), new Among("avem", 42, 1), new Among('\u00E0vem', 42, 1), new Among('\u00E1vem', 42, 1), new Among('ir\u00ECem', 42, 1), new Among('\u00EDem', 42, 1), new Among('ar\u00EDem', 55, 1), new Among('ir\u00EDem', 55, 1), new Among("assim", -1, 1), new Among("essim", -1, 1), new Among("issim", -1, 1), new Among('\u00E0ssim', -1, 1), new Among('\u00E8ssim', -1, 1), new Among('\u00E9ssim', -1, 1), new Among('\u00EDssim', -1, 1), new Among('\u00EFm', -1, 1), new Among("an", -1, 1), new Among("aban", 66, 1), new Among("arian", 66, 1), new Among("aran", 66, 1), new Among("ieran", 66, 1), new Among("iran", 66, 1), new Among('\u00EDan', 66, 1), new Among('ar\u00EDan', 72, 1), new Among('er\u00EDan', 72, 1), new Among('ir\u00EDan', 72, 1), new Among("en", -1, 1), new Among("ien", 76, 1), new Among("arien", 77, 1), new Among("irien", 77, 1), new Among("aren", 76, 1), new Among("eren", 76, 1), new Among("iren", 76, 1), new Among('\u00E0ren', 76, 1), new Among('\u00EFren', 76, 1), new Among("asen", 76, 1), new Among("iesen", 76, 1), new Among("assen", 76, 1), new Among("essen", 76, 1), new Among("issen", 76, 1), new Among('\u00E9ssen', 76, 1), new Among('\u00EFssen', 76, 1), new Among("esquen", 76, 1), new Among("isquen", 76, 1), new Among('\u00EFsquen', 76, 1), new Among("aven", 76, 1), new Among("ixen", 76, 1), new Among("eixen", 96, 1), new Among('\u00EFxen', 76, 1), new Among('\u00EFen', 76, 1), new Among("in", -1, 1), new Among("inin", 100, 1), new Among("sin", 100, 1), new Among("isin", 102, 1), new Among("assin", 102, 1), new Among("essin", 102, 1), new Among("issin", 102, 1), new Among('\u00EFssin', 102, 1), new Among("esquin", 100, 1), new Among("eixin", 100, 1), new Among("aron", -1, 1), new Among("ieron", -1, 1), new Among('ar\u00E1n', -1, 1), new Among('er\u00E1n', -1, 1), new Among('ir\u00E1n', -1, 1), new Among('i\u00EFn', -1, 1), new Among("ado", -1, 1), new Among("ido", -1, 1), new Among("ando", -1, 2), new Among("iendo", -1, 1), new Among("io", -1, 1), new Among("ixo", -1, 1), new Among("eixo", 121, 1), new Among('\u00EFxo', -1, 1), new Among("itzo", -1, 1), new Among("ar", -1, 1), new Among("tzar", 125, 1), new Among("er", -1, 1), new Among("eixer", 127, 1), new Among("ir", -1, 1), new Among("ador", -1, 1), new Among("as", -1, 1), new Among("abas", 131, 1), new Among("adas", 131, 1), new Among("idas", 131, 1), new Among("aras", 131, 1), new Among("ieras", 131, 1), new Among('\u00EDas', 131, 1), new Among('ar\u00EDas', 137, 1), new Among('er\u00EDas', 137, 1), new Among('ir\u00EDas', 137, 1), new Among("ids", -1, 1), new Among("es", -1, 1), new Among("ades", 142, 1), new Among("ides", 142, 1), new Among("udes", 142, 1), new Among('\u00EFdes', 142, 1), new Among("atges", 142, 1), new Among("ies", 142, 1), new Among("aries", 148, 1), new Among("iries", 148, 1), new Among("ares", 142, 1), new Among("ires", 142, 1), new Among("adores", 142, 1), new Among('\u00EFres', 142, 1), new Among("ases", 142, 1), new Among("ieses", 142, 1), new Among("asses", 142, 1), new Among("esses", 142, 1), new Among("isses", 142, 1), new Among('\u00EFsses', 142, 1), new Among("ques", 142, 1), new Among("esques", 161, 1), new Among('\u00EFsques', 161, 1), new Among("aves", 142, 1), new Among("ixes", 142, 1), new Among("eixes", 165, 1), new Among('\u00EFxes', 142, 1), new Among('\u00EFes', 142, 1), new Among("abais", -1, 1), new Among("arais", -1, 1), new Among("ierais", -1, 1), new Among('\u00EDais', -1, 1), new Among('ar\u00EDais', 172, 1), new Among('er\u00EDais', 172, 1), new Among('ir\u00EDais', 172, 1), new Among("aseis", -1, 1), new Among("ieseis", -1, 1), new Among("asteis", -1, 1), new Among("isteis", -1, 1), new Among("inis", -1, 1), new Among("sis", -1, 1), new Among("isis", 181, 1), new Among("assis", 181, 1), new Among("essis", 181, 1), new Among("issis", 181, 1), new Among('\u00EFssis', 181, 1), new Among("esquis", -1, 1), new Among("eixis", -1, 1), new Among("itzis", -1, 1), new Among('\u00E1is', -1, 1), new Among('ar\u00E9is', -1, 1), new Among('er\u00E9is', -1, 1), new Among('ir\u00E9is', -1, 1), new Among("ams", -1, 1), new Among("ados", -1, 1), new Among("idos", -1, 1), new Among("amos", -1, 1), new Among('\u00E1bamos', 197, 1), new Among('\u00E1ramos', 197, 1), new Among('i\u00E9ramos', 197, 1), new Among('\u00EDamos', 197, 1), new Among('ar\u00EDamos', 201, 1), new Among('er\u00EDamos', 201, 1), new Among('ir\u00EDamos', 201, 1), new Among("aremos", -1, 1), new Among("eremos", -1, 1), new Among("iremos", -1, 1), new Among('\u00E1semos', -1, 1), new Among('i\u00E9semos', -1, 1), new Among("imos", -1, 1), new Among("adors", -1, 1), new Among("ass", -1, 1), new Among("erass", 212, 1), new Among("ess", -1, 1), new Among("ats", -1, 1), new Among("its", -1, 1), new Among("ents", -1, 1), new Among('\u00E0s', -1, 1), new Among('ar\u00E0s', 218, 1), new Among('ir\u00E0s', 218, 1), new Among('ar\u00E1s', -1, 1), new Among('er\u00E1s', -1, 1), new Among('ir\u00E1s', -1, 1), new Among('\u00E9s', -1, 1), new Among('ar\u00E9s', 224, 1), new Among('\u00EDs', -1, 1), new Among('i\u00EFs', -1, 1), new Among("at", -1, 1), new Among("it", -1, 1), new Among("ant", -1, 1), new Among("ent", -1, 1), new Among("int", -1, 1), new Among("ut", -1, 1), new Among('\u00EFt', -1, 1), new Among("au", -1, 1), new Among("erau", 235, 1), new Among("ieu", -1, 1), new Among("ineu", -1, 1), new Among("areu", -1, 1), new Among("ireu", -1, 1), new Among('\u00E0reu', -1, 1), new Among('\u00EDreu', -1, 1), new Among("asseu", -1, 1), new Among("esseu", -1, 1), new Among("eresseu", 244, 1), new Among('\u00E0sseu', -1, 1), new Among('\u00E9sseu', -1, 1), new Among("igueu", -1, 1), new Among('\u00EFgueu', -1, 1), new Among('\u00E0veu', -1, 1), new Among('\u00E1veu', -1, 1), new Among("itzeu", -1, 1), new Among('\u00ECeu', -1, 1), new Among('ir\u00ECeu', 253, 1), new Among('\u00EDeu', -1, 1), new Among('ar\u00EDeu', 255, 1), new Among('ir\u00EDeu', 255, 1), new Among("assiu", -1, 1), new Among("issiu", -1, 1), new Among('\u00E0ssiu', -1, 1), new Among('\u00E8ssiu', -1, 1), new Among('\u00E9ssiu', -1, 1), new Among('\u00EDssiu', -1, 1), new Among('\u00EFu', -1, 1), new Among("ix", -1, 1), new Among("eix", 265, 1), new Among('\u00EFx', -1, 1), new Among("itz", -1, 1), new Among('i\u00E0', -1, 1), new Among('ar\u00E0', -1, 1), new Among('ir\u00E0', -1, 1), new Among('itz\u00E0', -1, 1), new Among('ar\u00E1', -1, 1), new Among('er\u00E1', -1, 1), new Among('ir\u00E1', -1, 1), new Among('ir\u00E8', -1, 1), new Among('ar\u00E9', -1, 1), new Among('er\u00E9', -1, 1), new Among('ir\u00E9', -1, 1), new Among('\u00ED', -1, 1), new Among('i\u00EF', -1, 1), new Among('i\u00F3', -1, 1)];
            }
        }, {
            key: 'a_4',
            get: function get() {
                delete catalanStemmer.a_4;
                return catalanStemmer.a_4 = [new Among("a", -1, 1), new Among("e", -1, 1), new Among("i", -1, 1), new Among('\u00EFn', -1, 1), new Among("o", -1, 1), new Among("ir", -1, 1), new Among("s", -1, 1), new Among("is", 6, 1), new Among("os", 6, 1), new Among('\u00EFs', 6, 1), new Among("it", -1, 1), new Among("eu", -1, 1), new Among("iu", -1, 1), new Among("iqu", -1, 2), new Among("itz", -1, 1), new Among('\u00E0', -1, 1), new Among('\u00E1', -1, 1), new Among('\u00E9', -1, 1), new Among('\u00EC', -1, 1), new Among('\u00ED', -1, 1), new Among('\u00EF', -1, 1), new Among('\u00F3', -1, 1)];
            }
        }, {
            key: 'g_v',
            get: function get() {
                delete catalanStemmer.g_v;
                return catalanStemmer.g_v = [17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128, 129, 81, 6, 10];
            }
        }]);

        return catalanStemmer;
    }(SnowballStemmer);

    var czechStemmer = function (_SnowballStemmer5) {
        _inherits(czechStemmer, _SnowballStemmer5);

        function czechStemmer() {
            _classCallCheck(this, czechStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(czechStemmer).apply(this, arguments));
        }

        _createClass(czechStemmer, [{
            key: 'r_mark_regions$esjava$0',
            value: function r_mark_regions$esjava$0() {
                var v_1 = void 0;
                this.I_pV = this.limit;
                this.I_p1 = this.limit;
                v_1 = this.cursor;
                lab0: do {
                    golab1: while (true) {
                        lab2: do {
                            if (!this.out_grouping$esjava$3(czechStemmer.g_v, 97, 367)) {
                                break lab2;
                            }
                            break golab1;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab0;
                        }
                        this.cursor++;
                    }
                    this.I_pV = this.cursor;
                    golab3: while (true) {
                        lab4: do {
                            if (!this.out_grouping$esjava$3(czechStemmer.g_v, 97, 367)) {
                                break lab4;
                            }
                            break golab3;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab0;
                        }
                        this.cursor++;
                    }
                    golab5: while (true) {
                        lab6: do {
                            if (!this.in_grouping$esjava$3(czechStemmer.g_v, 97, 367)) {
                                break lab6;
                            }
                            break golab5;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab0;
                        }
                        this.cursor++;
                    }
                    this.I_p1 = this.cursor;
                } while (false);
                this.cursor = v_1;
                return true;
            }
        }, {
            key: 'r_RV$esjava$0',
            value: function r_RV$esjava$0() {
                if (!(this.I_pV <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_R1$esjava$0',
            value: function r_R1$esjava$0() {
                if (!(this.I_p1 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_palatalise$esjava$0',
            value: function r_palatalise$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(czechStemmer.a_0);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_RV$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_from$esjava$1("k");
                        break;
                    case 2:
                        this.slice_from$esjava$1("h");
                        break;
                    case 3:
                        this.slice_from$esjava$1("ck");
                        break;
                    case 4:
                        this.slice_from$esjava$1("sk");
                        break;
                }
                return true;
            }
        }, {
            key: 'r_do_possessive$esjava$0',
            value: function r_do_possessive$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(czechStemmer.a_1);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_RV$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        this.slice_del$esjava$0();
                        v_1 = this.limit - this.cursor;
                        lab0: do {
                            if (!this.r_palatalise$esjava$0()) {
                                this.cursor = this.limit - v_1;
                                break lab0;
                            }
                        } while (false);
                        break;
                }
                return true;
            }
        }, {
            key: 'r_do_case$esjava$0',
            value: function r_do_case$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(czechStemmer.a_2);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        this.slice_del$esjava$0();
                        v_1 = this.limit - this.cursor;
                        lab0: do {
                            if (!this.r_palatalise$esjava$0()) {
                                this.cursor = this.limit - v_1;
                                break lab0;
                            }
                        } while (false);
                        break;
                    case 3:
                        this.slice_from$esjava$1("e");
                        v_2 = this.limit - this.cursor;
                        lab1: do {
                            if (!this.r_palatalise$esjava$0()) {
                                this.cursor = this.limit - v_2;
                                break lab1;
                            }
                        } while (false);
                        break;
                }
                return true;
            }
        }, {
            key: 'r_do_derivational$esjava$0',
            value: function r_do_derivational$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(czechStemmer.a_3);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_R1$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        this.slice_from$esjava$1("i");
                        if (!this.r_palatalise$esjava$0()) {
                            return false;
                        }
                        break;
                    case 3:
                        this.slice_from$esjava$1("e");
                        if (!this.r_palatalise$esjava$0()) {
                            return false;
                        }
                        break;
                    case 4:
                        this.slice_from$esjava$1('\u00E9');
                        if (!this.r_palatalise$esjava$0()) {
                            return false;
                        }
                        break;
                    case 5:
                        this.slice_from$esjava$1('\u011B');
                        if (!this.r_palatalise$esjava$0()) {
                            return false;
                        }
                        break;
                    case 6:
                        this.slice_from$esjava$1('\u00ED');
                        if (!this.r_palatalise$esjava$0()) {
                            return false;
                        }
                        break;
                }
                return true;
            }
        }, {
            key: 'r_do_deriv_single$esjava$0',
            value: function r_do_deriv_single$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(czechStemmer.a_4);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_do_augmentative$esjava$0',
            value: function r_do_augmentative$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(czechStemmer.a_5);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        this.slice_from$esjava$1("i");
                        if (!this.r_palatalise$esjava$0()) {
                            return false;
                        }
                        break;
                }
                return true;
            }
        }, {
            key: 'r_do_diminutive$esjava$0',
            value: function r_do_diminutive$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(czechStemmer.a_6);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        this.slice_from$esjava$1("e");
                        if (!this.r_palatalise$esjava$0()) {
                            return false;
                        }
                        break;
                    case 3:
                        this.slice_from$esjava$1('\u00E9');
                        if (!this.r_palatalise$esjava$0()) {
                            return false;
                        }
                        break;
                    case 4:
                        this.slice_from$esjava$1("i");
                        if (!this.r_palatalise$esjava$0()) {
                            return false;
                        }
                        break;
                    case 5:
                        this.slice_from$esjava$1('\u00ED');
                        if (!this.r_palatalise$esjava$0()) {
                            return false;
                        }
                        break;
                    case 6:
                        this.slice_from$esjava$1('\u00E1');
                        break;
                    case 7:
                        this.slice_from$esjava$1("a");
                        break;
                    case 8:
                        this.slice_from$esjava$1("o");
                        break;
                    case 9:
                        this.slice_from$esjava$1("u");
                        break;
                }
                return true;
            }
        }, {
            key: 'r_do_comparative$esjava$0',
            value: function r_do_comparative$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(czechStemmer.a_7);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_from$esjava$1('\u011B');
                        if (!this.r_palatalise$esjava$0()) {
                            return false;
                        }
                        break;
                    case 2:
                        this.slice_from$esjava$1("e");
                        if (!this.r_palatalise$esjava$0()) {
                            return false;
                        }
                        break;
                }
                return true;
            }
        }, {
            key: 'r_do_aggressive$esjava$0',
            value: function r_do_aggressive$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                v_1 = this.limit - this.cursor;
                lab0: do {
                    if (!this.r_do_comparative$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = this.limit - v_1;
                v_2 = this.limit - this.cursor;
                lab1: do {
                    if (!this.r_do_diminutive$esjava$0()) {
                        break lab1;
                    }
                } while (false);
                this.cursor = this.limit - v_2;
                v_3 = this.limit - this.cursor;
                lab2: do {
                    if (!this.r_do_augmentative$esjava$0()) {
                        break lab2;
                    }
                } while (false);
                this.cursor = this.limit - v_3;
                lab3: do {
                    v_4 = this.limit - this.cursor;
                    lab4: do {
                        if (!this.r_do_derivational$esjava$0()) {
                            break lab4;
                        }
                        break lab3;
                    } while (false);
                    this.cursor = this.limit - v_4;
                    if (!this.r_do_deriv_single$esjava$0()) {
                        return false;
                    }
                } while (false);
                return true;
            }
        }, {
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                var v_1 = void 0;
                v_1 = this.cursor;
                lab0: do {
                    if (!this.r_mark_regions$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = v_1;
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                if (!this.r_do_case$esjava$0()) {
                    return false;
                }
                if (!this.r_do_possessive$esjava$0()) {
                    return false;
                }
                if (!this.r_do_aggressive$esjava$0()) {
                    return false;
                }
                this.cursor = this.limit_backward;
                return true;
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get29;

                for (var _len28 = arguments.length, args = Array(_len28), _key28 = 0; _key28 < _len28; _key28++) {
                    args[_key28] = arguments[_key28];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get29 = _get(Object.getPrototypeOf(czechStemmer.prototype), 'stem', this)).call.apply(_get29, [this].concat(args));
            }
        }, {
            key: 'I_p1',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p1') ? this._$esjava$I_p1 : this._$esjava$I_p1 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p1 = v;
            }
        }, {
            key: 'I_pV',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_pV') ? this._$esjava$I_pV : this._$esjava$I_pV = 0;
            },
            set: function set(v) {
                this._$esjava$I_pV = v;
            }
        }], [{
            key: 'a_0',
            get: function get() {
                delete czechStemmer.a_0;
                return czechStemmer.a_0 = [new Among("ce", -1, 1), new Among("ze", -1, 2), new Among('\u017Ee', -1, 2), new Among("ci", -1, 1), new Among('\u010Dti', -1, 3), new Among('\u0161ti', -1, 4), new Among("zi", -1, 2), new Among('\u010Di', -1, 1), new Among('\u017Ei', -1, 2), new Among('\u010Dt\u00E9', -1, 3), new Among('\u0161t\u00E9', -1, 4), new Among('\u010D', -1, 1), new Among('\u010Dt\u011B', -1, 3), new Among('\u0161t\u011B', -1, 4)];
            }
        }, {
            key: 'a_1',
            get: function get() {
                delete czechStemmer.a_1;
                return czechStemmer.a_1 = [new Among("in", -1, 2), new Among("ov", -1, 1), new Among('\u016Fv', -1, 1)];
            }
        }, {
            key: 'a_2',
            get: function get() {
                delete czechStemmer.a_2;
                return czechStemmer.a_2 = [new Among("a", -1, 1), new Among("ama", 0, 1), new Among("ata", 0, 1), new Among("e", -1, 2), new Among('\u011Bte', 3, 2), new Among("ech", -1, 2), new Among("atech", 5, 1), new Among("ich", -1, 2), new Among('\u00E1ch', -1, 1), new Among('\u00EDch', -1, 2), new Among('\u00FDch', -1, 1), new Among("i", -1, 2), new Among("mi", 11, 1), new Among("ami", 12, 1), new Among("emi", 12, 2), new Among('\u00EDmi', 12, 2), new Among('\u00FDmi', 12, 1), new Among('\u011Bmi', 12, 2), new Among('\u011Bti', 11, 2), new Among("ovi", 11, 1), new Among("em", -1, 3), new Among('\u011Btem', 20, 1), new Among('\u00E1m', -1, 1), new Among('\u00E9m', -1, 2), new Among('\u00EDm', -1, 2), new Among('\u00FDm', -1, 1), new Among('at\u016Fm', -1, 1), new Among("o", -1, 1), new Among("iho", 27, 2), new Among('\u00E9ho', 27, 2), new Among('\u00EDho', 27, 2), new Among("es", -1, 2), new Among("os", -1, 1), new Among("us", -1, 1), new Among("at", -1, 1), new Among("u", -1, 1), new Among("imu", 35, 2), new Among('\u00E9mu', 35, 2), new Among("ou", 35, 1), new Among("y", -1, 1), new Among("aty", 39, 1), new Among('\u00E1', -1, 1), new Among('\u00E9', -1, 1), new Among('ov\u00E9', 42, 1), new Among('\u00ED', -1, 2), new Among('\u00FD', -1, 1), new Among('\u011B', -1, 2), new Among('\u016F', -1, 1)];
            }
        }, {
            key: 'a_3',
            get: function get() {
                delete czechStemmer.a_3;
                return czechStemmer.a_3 = [new Among("ob", -1, 1), new Among("itb", -1, 2), new Among("ec", -1, 3), new Among("inec", 2, 2), new Among("obinec", 3, 1), new Among("ovec", 2, 1), new Among("ic", -1, 2), new Among("enic", 6, 3), new Among("och", -1, 1), new Among('\u00E1sek', -1, 1), new Among("nk", -1, 1), new Among("isk", -1, 2), new Among("ovisk", 11, 1), new Among("tk", -1, 1), new Among("vk", -1, 1), new Among('n\u00EDk', -1, 1), new Among('ovn\u00EDk', 15, 1), new Among('ov\u00EDk', -1, 1), new Among('\u010Dk', -1, 1), new Among('i\u0161k', -1, 2), new Among('u\u0161k', -1, 1), new Among("dl", -1, 1), new Among("itel", -1, 2), new Among("ul", -1, 1), new Among("an", -1, 1), new Among('\u010Dan', 24, 1), new Among("en", -1, 3), new Among("in", -1, 2), new Among('\u0161tin', 27, 1), new Among("ovin", 27, 1), new Among("teln", -1, 1), new Among('\u00E1rn', -1, 1), new Among('\u00EDrn', -1, 6), new Among("oun", -1, 1), new Among("loun", 33, 1), new Among("ovn", -1, 1), new Among("yn", -1, 1), new Among("kyn", 36, 1), new Among('\u00E1n', -1, 1), new Among('i\u00E1n', 38, 2), new Among('\u00EDn', -1, 6), new Among('\u010Dn', -1, 1), new Among('\u011Bn', -1, 5), new Among("as", -1, 1), new Among("it", -1, 2), new Among("ot", -1, 1), new Among("ist", -1, 2), new Among("ost", -1, 1), new Among("nost", 47, 1), new Among("out", -1, 1), new Among('ovi\u0161t', -1, 1), new Among("iv", -1, 2), new Among("ov", -1, 1), new Among("tv", -1, 1), new Among("ctv", 53, 1), new Among("stv", 53, 1), new Among("ovstv", 55, 1), new Among("ovtv", 53, 1), new Among('a\u010D', -1, 1), new Among('\u00E1\u010D', -1, 1), new Among('o\u0148', -1, 1), new Among('\u00E1\u0159', -1, 1), new Among('k\u00E1\u0159', 61, 1), new Among('ion\u00E1\u0159', 61, 2), new Among('\u00E9\u0159', -1, 4), new Among('n\u00E9\u0159', 64, 1), new Among('\u00ED\u0159', -1, 6), new Among('ou\u0161', -1, 1)];
            }
        }, {
            key: 'a_4',
            get: function get() {
                delete czechStemmer.a_4;
                return czechStemmer.a_4 = [new Among("c", -1, 1), new Among("k", -1, 1), new Among("l", -1, 1), new Among("n", -1, 1), new Among("t", -1, 1), new Among('\u010D', -1, 1)];
            }
        }, {
            key: 'a_5',
            get: function get() {
                delete czechStemmer.a_5;
                return czechStemmer.a_5 = [new Among("isk", -1, 2), new Among('\u00E1k', -1, 1), new Among("izn", -1, 2), new Among("ajzn", -1, 1)];
            }
        }, {
            key: 'a_6',
            get: function get() {
                delete czechStemmer.a_6;
                return czechStemmer.a_6 = [new Among("k", -1, 1), new Among("ak", 0, 7), new Among("ek", 0, 2), new Among("anek", 2, 1), new Among("enek", 2, 2), new Among("inek", 2, 4), new Among("onek", 2, 1), new Among("unek", 2, 1), new Among('\u00E1nek', 2, 1), new Among('a\u010Dek', 2, 1), new Among('e\u010Dek', 2, 2), new Among('i\u010Dek', 2, 4), new Among('o\u010Dek', 2, 1), new Among('u\u010Dek', 2, 1), new Among('\u00E1\u010Dek', 2, 1), new Among('\u00E9\u010Dek', 2, 3), new Among('\u00ED\u010Dek', 2, 5), new Among('ou\u0161ek', 2, 1), new Among("ik", 0, 4), new Among("ank", 0, 1), new Among("enk", 0, 1), new Among("ink", 0, 1), new Among("onk", 0, 1), new Among("unk", 0, 1), new Among('\u00E1nk', 0, 1), new Among('\u00E9nk', 0, 1), new Among('\u00EDnk', 0, 1), new Among("ok", 0, 8), new Among('\u00E1tk', 0, 1), new Among("uk", 0, 9), new Among('\u00E1k', 0, 6), new Among('\u00E9k', 0, 3), new Among('\u00EDk', 0, 5), new Among('a\u010Dk', 0, 1), new Among('e\u010Dk', 0, 1), new Among('i\u010Dk', 0, 1), new Among('o\u010Dk', 0, 1), new Among('u\u010Dk', 0, 1), new Among('\u00E1\u010Dk', 0, 1), new Among('\u00E9\u010Dk', 0, 1), new Among('\u00ED\u010Dk', 0, 1), new Among('u\u0161k', 0, 1)];
            }
        }, {
            key: 'a_7',
            get: function get() {
                delete czechStemmer.a_7;
                return czechStemmer.a_7 = [new Among('ej\u0161', -1, 2), new Among('\u011Bj\u0161', -1, 1)];
            }
        }, {
            key: 'g_v',
            get: function get() {
                delete czechStemmer.g_v;
                return czechStemmer.g_v = [17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 17, 4, 18, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64];
            }
        }]);

        return czechStemmer;
    }(SnowballStemmer);

    var danishStemmer = function (_SnowballStemmer6) {
        _inherits(danishStemmer, _SnowballStemmer6);

        function danishStemmer() {
            _classCallCheck(this, danishStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(danishStemmer).apply(this, arguments));
        }

        _createClass(danishStemmer, [{
            key: 'r_mark_regions$esjava$0',
            value: function r_mark_regions$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                this.I_p1 = this.limit;
                v_1 = this.cursor;
                {
                    var c = this.cursor + 3;
                    if (0 > c || c > this.limit) {
                        return false;
                    }
                    this.cursor = c;
                }
                this.I_x = this.cursor;
                this.cursor = v_1;
                golab0: while (true) {
                    v_2 = this.cursor;
                    lab1: do {
                        if (!this.in_grouping$esjava$3(danishStemmer.g_v, 97, 248)) {
                            break lab1;
                        }
                        this.cursor = v_2;
                        break golab0;
                    } while (false);
                    this.cursor = v_2;
                    if (this.cursor >= this.limit) {
                        return false;
                    }
                    this.cursor++;
                }
                golab2: while (true) {
                    lab3: do {
                        if (!this.out_grouping$esjava$3(danishStemmer.g_v, 97, 248)) {
                            break lab3;
                        }
                        break golab2;
                    } while (false);
                    if (this.cursor >= this.limit) {
                        return false;
                    }
                    this.cursor++;
                }
                this.I_p1 = this.cursor;
                lab4: do {
                    if (!(this.I_p1 < this.I_x)) {
                        break lab4;
                    }
                    this.I_p1 = this.I_x;
                } while (false);
                return true;
            }
        }, {
            key: 'r_main_suffix$esjava$0',
            value: function r_main_suffix$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                v_1 = this.limit - this.cursor;
                if (this.cursor < this.I_p1) {
                    return false;
                }
                this.cursor = this.I_p1;
                v_2 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_1;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(danishStemmer.a_0);
                if (among_var === 0) {
                    this.limit_backward = v_2;
                    return false;
                }
                this.bra = this.cursor;
                this.limit_backward = v_2;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!this.in_grouping_b$esjava$3(danishStemmer.g_s_ending, 97, 229)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_consonant_pair$esjava$0',
            value: function r_consonant_pair$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                v_1 = this.limit - this.cursor;
                v_2 = this.limit - this.cursor;
                if (this.cursor < this.I_p1) {
                    return false;
                }
                this.cursor = this.I_p1;
                v_3 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_2;
                this.ket = this.cursor;
                if (this.find_among_b$esjava$1(danishStemmer.a_1) === 0) {
                    this.limit_backward = v_3;
                    return false;
                }
                this.bra = this.cursor;
                this.limit_backward = v_3;
                this.cursor = this.limit - v_1;
                if (this.cursor <= this.limit_backward) {
                    return false;
                }
                this.cursor--;
                this.bra = this.cursor;
                this.slice_del$esjava$0();
                return true;
            }
        }, {
            key: 'r_other_suffix$esjava$0',
            value: function r_other_suffix$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                v_1 = this.limit - this.cursor;
                lab0: do {
                    this.ket = this.cursor;
                    if (!this.eq_s_b$esjava$1("st")) {
                        break lab0;
                    }
                    this.bra = this.cursor;
                    if (!this.eq_s_b$esjava$1("ig")) {
                        break lab0;
                    }
                    this.slice_del$esjava$0();
                } while (false);
                this.cursor = this.limit - v_1;
                v_2 = this.limit - this.cursor;
                if (this.cursor < this.I_p1) {
                    return false;
                }
                this.cursor = this.I_p1;
                v_3 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_2;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(danishStemmer.a_2);
                if (among_var === 0) {
                    this.limit_backward = v_3;
                    return false;
                }
                this.bra = this.cursor;
                this.limit_backward = v_3;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        v_4 = this.limit - this.cursor;
                        lab1: do {
                            if (!this.r_consonant_pair$esjava$0()) {
                                break lab1;
                            }
                        } while (false);
                        this.cursor = this.limit - v_4;
                        break;
                    case 2:
                        this.slice_from$esjava$1('l\u00F8s');
                        break;
                }
                return true;
            }
        }, {
            key: 'r_undouble$esjava$0',
            value: function r_undouble$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                v_1 = this.limit - this.cursor;
                if (this.cursor < this.I_p1) {
                    return false;
                }
                this.cursor = this.I_p1;
                v_2 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_1;
                this.ket = this.cursor;
                if (!this.out_grouping_b$esjava$3(danishStemmer.g_v, 97, 248)) {
                    this.limit_backward = v_2;
                    return false;
                }
                this.bra = this.cursor;
                this.S_ch = this.slice_to$esjava$1(this.S_ch);
                this.limit_backward = v_2;
                if (!this.eq_s_b$esjava$1(this.S_ch.toString())) {
                    return false;
                }
                this.slice_del$esjava$0();
                return true;
            }
        }, {
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                v_1 = this.cursor;
                lab0: do {
                    if (!this.r_mark_regions$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = v_1;
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                v_2 = this.limit - this.cursor;
                lab1: do {
                    if (!this.r_main_suffix$esjava$0()) {
                        break lab1;
                    }
                } while (false);
                this.cursor = this.limit - v_2;
                v_3 = this.limit - this.cursor;
                lab2: do {
                    if (!this.r_consonant_pair$esjava$0()) {
                        break lab2;
                    }
                } while (false);
                this.cursor = this.limit - v_3;
                v_4 = this.limit - this.cursor;
                lab3: do {
                    if (!this.r_other_suffix$esjava$0()) {
                        break lab3;
                    }
                } while (false);
                this.cursor = this.limit - v_4;
                v_5 = this.limit - this.cursor;
                lab4: do {
                    if (!this.r_undouble$esjava$0()) {
                        break lab4;
                    }
                } while (false);
                this.cursor = this.limit - v_5;
                this.cursor = this.limit_backward;
                return true;
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get30;

                for (var _len29 = arguments.length, args = Array(_len29), _key29 = 0; _key29 < _len29; _key29++) {
                    args[_key29] = arguments[_key29];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get30 = _get(Object.getPrototypeOf(danishStemmer.prototype), 'stem', this)).call.apply(_get30, [this].concat(args));
            }
        }, {
            key: 'I_x',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_x') ? this._$esjava$I_x : this._$esjava$I_x = 0;
            },
            set: function set(v) {
                this._$esjava$I_x = v;
            }
        }, {
            key: 'I_p1',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p1') ? this._$esjava$I_p1 : this._$esjava$I_p1 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p1 = v;
            }
        }, {
            key: 'S_ch',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$S_ch') ? this._$esjava$S_ch : this._$esjava$S_ch = new StringBuilder();
            },
            set: function set(v) {
                this._$esjava$S_ch = v;
            }
        }], [{
            key: 'a_0',
            get: function get() {
                delete danishStemmer.a_0;
                return danishStemmer.a_0 = [new Among("hed", -1, 1), new Among("ethed", 0, 1), new Among("ered", -1, 1), new Among("e", -1, 1), new Among("erede", 3, 1), new Among("ende", 3, 1), new Among("erende", 5, 1), new Among("ene", 3, 1), new Among("erne", 3, 1), new Among("ere", 3, 1), new Among("en", -1, 1), new Among("heden", 10, 1), new Among("eren", 10, 1), new Among("er", -1, 1), new Among("heder", 13, 1), new Among("erer", 13, 1), new Among("s", -1, 2), new Among("heds", 16, 1), new Among("es", 16, 1), new Among("endes", 18, 1), new Among("erendes", 19, 1), new Among("enes", 18, 1), new Among("ernes", 18, 1), new Among("eres", 18, 1), new Among("ens", 16, 1), new Among("hedens", 24, 1), new Among("erens", 24, 1), new Among("ers", 16, 1), new Among("ets", 16, 1), new Among("erets", 28, 1), new Among("et", -1, 1), new Among("eret", 30, 1)];
            }
        }, {
            key: 'a_1',
            get: function get() {
                delete danishStemmer.a_1;
                return danishStemmer.a_1 = [new Among("gd", -1, -1), new Among("dt", -1, -1), new Among("gt", -1, -1), new Among("kt", -1, -1)];
            }
        }, {
            key: 'a_2',
            get: function get() {
                delete danishStemmer.a_2;
                return danishStemmer.a_2 = [new Among("ig", -1, 1), new Among("lig", 0, 1), new Among("elig", 1, 1), new Among("els", -1, 1), new Among('l\u00F8st', -1, 2)];
            }
        }, {
            key: 'g_v',
            get: function get() {
                delete danishStemmer.g_v;
                return danishStemmer.g_v = [17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 128];
            }
        }, {
            key: 'g_s_ending',
            get: function get() {
                delete danishStemmer.g_s_ending;
                return danishStemmer.g_s_ending = [239, 254, 42, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16];
            }
        }]);

        return danishStemmer;
    }(SnowballStemmer);

    var dutchStemmer = function (_SnowballStemmer7) {
        _inherits(dutchStemmer, _SnowballStemmer7);

        function dutchStemmer() {
            _classCallCheck(this, dutchStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(dutchStemmer).apply(this, arguments));
        }

        _createClass(dutchStemmer, [{
            key: 'r_prelude$esjava$0',
            value: function r_prelude$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                v_1 = this.cursor;
                replab0: while (true) {
                    v_2 = this.cursor;
                    lab1: do {
                        this.bra = this.cursor;
                        among_var = this.find_among$esjava$1(dutchStemmer.a_0);
                        if (among_var === 0) {
                            break lab1;
                        }
                        this.ket = this.cursor;
                        switch (among_var) {
                            case 0:
                                break lab1;
                            case 1:
                                this.slice_from$esjava$1("a");
                                break;
                            case 2:
                                this.slice_from$esjava$1("e");
                                break;
                            case 3:
                                this.slice_from$esjava$1("i");
                                break;
                            case 4:
                                this.slice_from$esjava$1("o");
                                break;
                            case 5:
                                this.slice_from$esjava$1("u");
                                break;
                            case 6:
                                if (this.cursor >= this.limit) {
                                    break lab1;
                                }
                                this.cursor++;
                                break;
                        }
                        continue replab0;
                    } while (false);
                    this.cursor = v_2;
                    break replab0;
                }
                this.cursor = v_1;
                v_3 = this.cursor;
                lab2: do {
                    this.bra = this.cursor;
                    if (!this.eq_s$esjava$1("y")) {
                        this.cursor = v_3;
                        break lab2;
                    }
                    this.ket = this.cursor;
                    this.slice_from$esjava$1("Y");
                } while (false);
                replab3: while (true) {
                    v_4 = this.cursor;
                    lab4: do {
                        golab5: while (true) {
                            v_5 = this.cursor;
                            lab6: do {
                                if (!this.in_grouping$esjava$3(dutchStemmer.g_v, 97, 232)) {
                                    break lab6;
                                }
                                this.bra = this.cursor;
                                lab7: do {
                                    v_6 = this.cursor;
                                    lab8: do {
                                        if (!this.eq_s$esjava$1("i")) {
                                            break lab8;
                                        }
                                        this.ket = this.cursor;
                                        if (!this.in_grouping$esjava$3(dutchStemmer.g_v, 97, 232)) {
                                            break lab8;
                                        }
                                        this.slice_from$esjava$1("I");
                                        break lab7;
                                    } while (false);
                                    this.cursor = v_6;
                                    if (!this.eq_s$esjava$1("y")) {
                                        break lab6;
                                    }
                                    this.ket = this.cursor;
                                    this.slice_from$esjava$1("Y");
                                } while (false);
                                this.cursor = v_5;
                                break golab5;
                            } while (false);
                            this.cursor = v_5;
                            if (this.cursor >= this.limit) {
                                break lab4;
                            }
                            this.cursor++;
                        }
                        continue replab3;
                    } while (false);
                    this.cursor = v_4;
                    break replab3;
                }
                return true;
            }
        }, {
            key: 'r_mark_regions$esjava$0',
            value: function r_mark_regions$esjava$0() {
                this.I_p1 = this.limit;
                this.I_p2 = this.limit;
                golab0: while (true) {
                    lab1: do {
                        if (!this.in_grouping$esjava$3(dutchStemmer.g_v, 97, 232)) {
                            break lab1;
                        }
                        break golab0;
                    } while (false);
                    if (this.cursor >= this.limit) {
                        return false;
                    }
                    this.cursor++;
                }
                golab2: while (true) {
                    lab3: do {
                        if (!this.out_grouping$esjava$3(dutchStemmer.g_v, 97, 232)) {
                            break lab3;
                        }
                        break golab2;
                    } while (false);
                    if (this.cursor >= this.limit) {
                        return false;
                    }
                    this.cursor++;
                }
                this.I_p1 = this.cursor;
                lab4: do {
                    if (!(this.I_p1 < 3)) {
                        break lab4;
                    }
                    this.I_p1 = 3;
                } while (false);
                golab5: while (true) {
                    lab6: do {
                        if (!this.in_grouping$esjava$3(dutchStemmer.g_v, 97, 232)) {
                            break lab6;
                        }
                        break golab5;
                    } while (false);
                    if (this.cursor >= this.limit) {
                        return false;
                    }
                    this.cursor++;
                }
                golab7: while (true) {
                    lab8: do {
                        if (!this.out_grouping$esjava$3(dutchStemmer.g_v, 97, 232)) {
                            break lab8;
                        }
                        break golab7;
                    } while (false);
                    if (this.cursor >= this.limit) {
                        return false;
                    }
                    this.cursor++;
                }
                this.I_p2 = this.cursor;
                return true;
            }
        }, {
            key: 'r_postlude$esjava$0',
            value: function r_postlude$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                replab0: while (true) {
                    v_1 = this.cursor;
                    lab1: do {
                        this.bra = this.cursor;
                        among_var = this.find_among$esjava$1(dutchStemmer.a_1);
                        if (among_var === 0) {
                            break lab1;
                        }
                        this.ket = this.cursor;
                        switch (among_var) {
                            case 0:
                                break lab1;
                            case 1:
                                this.slice_from$esjava$1("y");
                                break;
                            case 2:
                                this.slice_from$esjava$1("i");
                                break;
                            case 3:
                                if (this.cursor >= this.limit) {
                                    break lab1;
                                }
                                this.cursor++;
                                break;
                        }
                        continue replab0;
                    } while (false);
                    this.cursor = v_1;
                    break replab0;
                }
                return true;
            }
        }, {
            key: 'r_R1$esjava$0',
            value: function r_R1$esjava$0() {
                if (!(this.I_p1 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_R2$esjava$0',
            value: function r_R2$esjava$0() {
                if (!(this.I_p2 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_undouble$esjava$0',
            value: function r_undouble$esjava$0() {
                var v_1 = void 0;
                v_1 = this.limit - this.cursor;
                if (this.find_among_b$esjava$1(dutchStemmer.a_2) === 0) {
                    return false;
                }
                this.cursor = this.limit - v_1;
                this.ket = this.cursor;
                if (this.cursor <= this.limit_backward) {
                    return false;
                }
                this.cursor--;
                this.bra = this.cursor;
                this.slice_del$esjava$0();
                return true;
            }
        }, {
            key: 'r_e_ending$esjava$0',
            value: function r_e_ending$esjava$0() {
                var v_1 = void 0;
                this.B_e_found = false;
                this.ket = this.cursor;
                if (!this.eq_s_b$esjava$1("e")) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_R1$esjava$0()) {
                    return false;
                }
                v_1 = this.limit - this.cursor;
                if (!this.out_grouping_b$esjava$3(dutchStemmer.g_v, 97, 232)) {
                    return false;
                }
                this.cursor = this.limit - v_1;
                this.slice_del$esjava$0();
                this.B_e_found = true;
                if (!this.r_undouble$esjava$0()) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_en_ending$esjava$0',
            value: function r_en_ending$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                if (!this.r_R1$esjava$0()) {
                    return false;
                }
                v_1 = this.limit - this.cursor;
                if (!this.out_grouping_b$esjava$3(dutchStemmer.g_v, 97, 232)) {
                    return false;
                }
                this.cursor = this.limit - v_1;
                {
                    v_2 = this.limit - this.cursor;
                    lab0: do {
                        if (!this.eq_s_b$esjava$1("gem")) {
                            break lab0;
                        }
                        return false;
                    } while (false);
                    this.cursor = this.limit - v_2;
                }
                this.slice_del$esjava$0();
                if (!this.r_undouble$esjava$0()) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_standard_suffix$esjava$0',
            value: function r_standard_suffix$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                var v_8 = void 0;
                var v_9 = void 0;
                var v_10 = void 0;
                v_1 = this.limit - this.cursor;
                lab0: do {
                    this.ket = this.cursor;
                    among_var = this.find_among_b$esjava$1(dutchStemmer.a_3);
                    if (among_var === 0) {
                        break lab0;
                    }
                    this.bra = this.cursor;
                    switch (among_var) {
                        case 0:
                            break lab0;
                        case 1:
                            if (!this.r_R1$esjava$0()) {
                                break lab0;
                            }
                            this.slice_from$esjava$1("heid");
                            break;
                        case 2:
                            if (!this.r_en_ending$esjava$0()) {
                                break lab0;
                            }
                            break;
                        case 3:
                            if (!this.r_R1$esjava$0()) {
                                break lab0;
                            }
                            if (!this.out_grouping_b$esjava$3(dutchStemmer.g_v_j, 97, 232)) {
                                break lab0;
                            }
                            this.slice_del$esjava$0();
                            break;
                    }
                } while (false);
                this.cursor = this.limit - v_1;
                v_2 = this.limit - this.cursor;
                lab1: do {
                    if (!this.r_e_ending$esjava$0()) {
                        break lab1;
                    }
                } while (false);
                this.cursor = this.limit - v_2;
                v_3 = this.limit - this.cursor;
                lab2: do {
                    this.ket = this.cursor;
                    if (!this.eq_s_b$esjava$1("heid")) {
                        break lab2;
                    }
                    this.bra = this.cursor;
                    if (!this.r_R2$esjava$0()) {
                        break lab2;
                    }
                    {
                        v_4 = this.limit - this.cursor;
                        lab3: do {
                            if (!this.eq_s_b$esjava$1("c")) {
                                break lab3;
                            }
                            break lab2;
                        } while (false);
                        this.cursor = this.limit - v_4;
                    }
                    this.slice_del$esjava$0();
                    this.ket = this.cursor;
                    if (!this.eq_s_b$esjava$1("en")) {
                        break lab2;
                    }
                    this.bra = this.cursor;
                    if (!this.r_en_ending$esjava$0()) {
                        break lab2;
                    }
                } while (false);
                this.cursor = this.limit - v_3;
                v_5 = this.limit - this.cursor;
                lab4: do {
                    this.ket = this.cursor;
                    among_var = this.find_among_b$esjava$1(dutchStemmer.a_4);
                    if (among_var === 0) {
                        break lab4;
                    }
                    this.bra = this.cursor;
                    switch (among_var) {
                        case 0:
                            break lab4;
                        case 1:
                            if (!this.r_R2$esjava$0()) {
                                break lab4;
                            }
                            this.slice_del$esjava$0();
                            lab5: do {
                                v_6 = this.limit - this.cursor;
                                lab6: do {
                                    this.ket = this.cursor;
                                    if (!this.eq_s_b$esjava$1("ig")) {
                                        break lab6;
                                    }
                                    this.bra = this.cursor;
                                    if (!this.r_R2$esjava$0()) {
                                        break lab6;
                                    }
                                    {
                                        v_7 = this.limit - this.cursor;
                                        lab7: do {
                                            if (!this.eq_s_b$esjava$1("e")) {
                                                break lab7;
                                            }
                                            break lab6;
                                        } while (false);
                                        this.cursor = this.limit - v_7;
                                    }
                                    this.slice_del$esjava$0();
                                    break lab5;
                                } while (false);
                                this.cursor = this.limit - v_6;
                                if (!this.r_undouble$esjava$0()) {
                                    break lab4;
                                }
                            } while (false);
                            break;
                        case 2:
                            if (!this.r_R2$esjava$0()) {
                                break lab4;
                            }
                            {
                                v_8 = this.limit - this.cursor;
                                lab8: do {
                                    if (!this.eq_s_b$esjava$1("e")) {
                                        break lab8;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_8;
                            }
                            this.slice_del$esjava$0();
                            break;
                        case 3:
                            if (!this.r_R2$esjava$0()) {
                                break lab4;
                            }
                            this.slice_del$esjava$0();
                            if (!this.r_e_ending$esjava$0()) {
                                break lab4;
                            }
                            break;
                        case 4:
                            if (!this.r_R2$esjava$0()) {
                                break lab4;
                            }
                            this.slice_del$esjava$0();
                            break;
                        case 5:
                            if (!this.r_R2$esjava$0()) {
                                break lab4;
                            }
                            if (!this.B_e_found) {
                                break lab4;
                            }
                            this.slice_del$esjava$0();
                            break;
                    }
                } while (false);
                this.cursor = this.limit - v_5;
                v_9 = this.limit - this.cursor;
                lab9: do {
                    if (!this.out_grouping_b$esjava$3(dutchStemmer.g_v_I, 73, 232)) {
                        break lab9;
                    }
                    v_10 = this.limit - this.cursor;
                    if (this.find_among_b$esjava$1(dutchStemmer.a_5) === 0) {
                        break lab9;
                    }
                    if (!this.out_grouping_b$esjava$3(dutchStemmer.g_v, 97, 232)) {
                        break lab9;
                    }
                    this.cursor = this.limit - v_10;
                    this.ket = this.cursor;
                    if (this.cursor <= this.limit_backward) {
                        break lab9;
                    }
                    this.cursor--;
                    this.bra = this.cursor;
                    this.slice_del$esjava$0();
                } while (false);
                this.cursor = this.limit - v_9;
                return true;
            }
        }, {
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                v_1 = this.cursor;
                lab0: do {
                    if (!this.r_prelude$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = v_1;
                v_2 = this.cursor;
                lab1: do {
                    if (!this.r_mark_regions$esjava$0()) {
                        break lab1;
                    }
                } while (false);
                this.cursor = v_2;
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                v_3 = this.limit - this.cursor;
                lab2: do {
                    if (!this.r_standard_suffix$esjava$0()) {
                        break lab2;
                    }
                } while (false);
                this.cursor = this.limit - v_3;
                this.cursor = this.limit_backward;
                v_4 = this.cursor;
                lab3: do {
                    if (!this.r_postlude$esjava$0()) {
                        break lab3;
                    }
                } while (false);
                this.cursor = v_4;
                return true;
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get31;

                for (var _len30 = arguments.length, args = Array(_len30), _key30 = 0; _key30 < _len30; _key30++) {
                    args[_key30] = arguments[_key30];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get31 = _get(Object.getPrototypeOf(dutchStemmer.prototype), 'stem', this)).call.apply(_get31, [this].concat(args));
            }
        }, {
            key: 'I_p2',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p2') ? this._$esjava$I_p2 : this._$esjava$I_p2 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p2 = v;
            }
        }, {
            key: 'I_p1',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p1') ? this._$esjava$I_p1 : this._$esjava$I_p1 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p1 = v;
            }
        }, {
            key: 'B_e_found',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$B_e_found') ? this._$esjava$B_e_found : this._$esjava$B_e_found = false;
            },
            set: function set(v) {
                this._$esjava$B_e_found = v;
            }
        }], [{
            key: 'a_0',
            get: function get() {
                delete dutchStemmer.a_0;
                return dutchStemmer.a_0 = [new Among("", -1, 6), new Among('\u00E1', 0, 1), new Among('\u00E4', 0, 1), new Among('\u00E9', 0, 2), new Among('\u00EB', 0, 2), new Among('\u00ED', 0, 3), new Among('\u00EF', 0, 3), new Among('\u00F3', 0, 4), new Among('\u00F6', 0, 4), new Among('\u00FA', 0, 5), new Among('\u00FC', 0, 5)];
            }
        }, {
            key: 'a_1',
            get: function get() {
                delete dutchStemmer.a_1;
                return dutchStemmer.a_1 = [new Among("", -1, 3), new Among("I", 0, 2), new Among("Y", 0, 1)];
            }
        }, {
            key: 'a_2',
            get: function get() {
                delete dutchStemmer.a_2;
                return dutchStemmer.a_2 = [new Among("dd", -1, -1), new Among("kk", -1, -1), new Among("tt", -1, -1)];
            }
        }, {
            key: 'a_3',
            get: function get() {
                delete dutchStemmer.a_3;
                return dutchStemmer.a_3 = [new Among("ene", -1, 2), new Among("se", -1, 3), new Among("en", -1, 2), new Among("heden", 2, 1), new Among("s", -1, 3)];
            }
        }, {
            key: 'a_4',
            get: function get() {
                delete dutchStemmer.a_4;
                return dutchStemmer.a_4 = [new Among("end", -1, 1), new Among("ig", -1, 2), new Among("ing", -1, 1), new Among("lijk", -1, 3), new Among("baar", -1, 4), new Among("bar", -1, 5)];
            }
        }, {
            key: 'a_5',
            get: function get() {
                delete dutchStemmer.a_5;
                return dutchStemmer.a_5 = [new Among("aa", -1, -1), new Among("ee", -1, -1), new Among("oo", -1, -1), new Among("uu", -1, -1)];
            }
        }, {
            key: 'g_v',
            get: function get() {
                delete dutchStemmer.g_v;
                return dutchStemmer.g_v = [17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128];
            }
        }, {
            key: 'g_v_I',
            get: function get() {
                delete dutchStemmer.g_v_I;
                return dutchStemmer.g_v_I = [1, 0, 0, 17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128];
            }
        }, {
            key: 'g_v_j',
            get: function get() {
                delete dutchStemmer.g_v_j;
                return dutchStemmer.g_v_j = [17, 67, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128];
            }
        }]);

        return dutchStemmer;
    }(SnowballStemmer);

    var englishStemmer = function (_SnowballStemmer8) {
        _inherits(englishStemmer, _SnowballStemmer8);

        function englishStemmer() {
            _classCallCheck(this, englishStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(englishStemmer).apply(this, arguments));
        }

        _createClass(englishStemmer, [{
            key: 'r_prelude$esjava$0',
            value: function r_prelude$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                this.B_Y_found = false;
                v_1 = this.cursor;
                lab0: do {
                    this.bra = this.cursor;
                    if (!this.eq_s$esjava$1("'")) {
                        break lab0;
                    }
                    this.ket = this.cursor;
                    this.slice_del$esjava$0();
                } while (false);
                this.cursor = v_1;
                v_2 = this.cursor;
                lab1: do {
                    this.bra = this.cursor;
                    if (!this.eq_s$esjava$1("y")) {
                        break lab1;
                    }
                    this.ket = this.cursor;
                    this.slice_from$esjava$1("Y");
                    this.B_Y_found = true;
                } while (false);
                this.cursor = v_2;
                v_3 = this.cursor;
                lab2: do {
                    replab3: while (true) {
                        v_4 = this.cursor;
                        lab4: do {
                            golab5: while (true) {
                                v_5 = this.cursor;
                                lab6: do {
                                    if (!this.in_grouping$esjava$3(englishStemmer.g_v, 97, 121)) {
                                        break lab6;
                                    }
                                    this.bra = this.cursor;
                                    if (!this.eq_s$esjava$1("y")) {
                                        break lab6;
                                    }
                                    this.ket = this.cursor;
                                    this.cursor = v_5;
                                    break golab5;
                                } while (false);
                                this.cursor = v_5;
                                if (this.cursor >= this.limit) {
                                    break lab4;
                                }
                                this.cursor++;
                            }
                            this.slice_from$esjava$1("Y");
                            this.B_Y_found = true;
                            continue replab3;
                        } while (false);
                        this.cursor = v_4;
                        break replab3;
                    }
                } while (false);
                this.cursor = v_3;
                return true;
            }
        }, {
            key: 'r_mark_regions$esjava$0',
            value: function r_mark_regions$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                this.I_p1 = this.limit;
                this.I_p2 = this.limit;
                v_1 = this.cursor;
                lab0: do {
                    lab1: do {
                        v_2 = this.cursor;
                        lab2: do {
                            if (this.find_among$esjava$1(englishStemmer.a_0) === 0) {
                                break lab2;
                            }
                            break lab1;
                        } while (false);
                        this.cursor = v_2;
                        golab3: while (true) {
                            lab4: do {
                                if (!this.in_grouping$esjava$3(englishStemmer.g_v, 97, 121)) {
                                    break lab4;
                                }
                                break golab3;
                            } while (false);
                            if (this.cursor >= this.limit) {
                                break lab0;
                            }
                            this.cursor++;
                        }
                        golab5: while (true) {
                            lab6: do {
                                if (!this.out_grouping$esjava$3(englishStemmer.g_v, 97, 121)) {
                                    break lab6;
                                }
                                break golab5;
                            } while (false);
                            if (this.cursor >= this.limit) {
                                break lab0;
                            }
                            this.cursor++;
                        }
                    } while (false);
                    this.I_p1 = this.cursor;
                    golab7: while (true) {
                        lab8: do {
                            if (!this.in_grouping$esjava$3(englishStemmer.g_v, 97, 121)) {
                                break lab8;
                            }
                            break golab7;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab0;
                        }
                        this.cursor++;
                    }
                    golab9: while (true) {
                        lab10: do {
                            if (!this.out_grouping$esjava$3(englishStemmer.g_v, 97, 121)) {
                                break lab10;
                            }
                            break golab9;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab0;
                        }
                        this.cursor++;
                    }
                    this.I_p2 = this.cursor;
                } while (false);
                this.cursor = v_1;
                return true;
            }
        }, {
            key: 'r_shortv$esjava$0',
            value: function r_shortv$esjava$0() {
                var v_1 = void 0;
                lab0: do {
                    v_1 = this.limit - this.cursor;
                    lab1: do {
                        if (!this.out_grouping_b$esjava$3(englishStemmer.g_v_WXY, 89, 121)) {
                            break lab1;
                        }
                        if (!this.in_grouping_b$esjava$3(englishStemmer.g_v, 97, 121)) {
                            break lab1;
                        }
                        if (!this.out_grouping_b$esjava$3(englishStemmer.g_v, 97, 121)) {
                            break lab1;
                        }
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    if (!this.out_grouping_b$esjava$3(englishStemmer.g_v, 97, 121)) {
                        return false;
                    }
                    if (!this.in_grouping_b$esjava$3(englishStemmer.g_v, 97, 121)) {
                        return false;
                    }
                    if (this.cursor > this.limit_backward) {
                        return false;
                    }
                } while (false);
                return true;
            }
        }, {
            key: 'r_R1$esjava$0',
            value: function r_R1$esjava$0() {
                if (!(this.I_p1 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_R2$esjava$0',
            value: function r_R2$esjava$0() {
                if (!(this.I_p2 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_Step_1a$esjava$0',
            value: function r_Step_1a$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                v_1 = this.limit - this.cursor;
                lab0: do {
                    this.ket = this.cursor;
                    among_var = this.find_among_b$esjava$1(englishStemmer.a_1);
                    if (among_var === 0) {
                        this.cursor = this.limit - v_1;
                        break lab0;
                    }
                    this.bra = this.cursor;
                    switch (among_var) {
                        case 0:
                            this.cursor = this.limit - v_1;
                            break lab0;
                        case 1:
                            this.slice_del$esjava$0();
                            break;
                    }
                } while (false);
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(englishStemmer.a_2);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_from$esjava$1("ss");
                        break;
                    case 2:
                        lab1: do {
                            v_2 = this.limit - this.cursor;
                            lab2: do {
                                {
                                    var c = this.cursor - 2;
                                    if (this.limit_backward > c || c > this.limit) {
                                        break lab2;
                                    }
                                    this.cursor = c;
                                }
                                this.slice_from$esjava$1("i");
                                break lab1;
                            } while (false);
                            this.cursor = this.limit - v_2;
                            this.slice_from$esjava$1("ie");
                        } while (false);
                        break;
                    case 3:
                        if (this.cursor <= this.limit_backward) {
                            return false;
                        }
                        this.cursor--;
                        golab3: while (true) {
                            lab4: do {
                                if (!this.in_grouping_b$esjava$3(englishStemmer.g_v, 97, 121)) {
                                    break lab4;
                                }
                                break golab3;
                            } while (false);
                            if (this.cursor <= this.limit_backward) {
                                return false;
                            }
                            this.cursor--;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Step_1b$esjava$0',
            value: function r_Step_1b$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(englishStemmer.a_4);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!this.r_R1$esjava$0()) {
                            return false;
                        }
                        this.slice_from$esjava$1("ee");
                        break;
                    case 2:
                        v_1 = this.limit - this.cursor;
                        golab0: while (true) {
                            lab1: do {
                                if (!this.in_grouping_b$esjava$3(englishStemmer.g_v, 97, 121)) {
                                    break lab1;
                                }
                                break golab0;
                            } while (false);
                            if (this.cursor <= this.limit_backward) {
                                return false;
                            }
                            this.cursor--;
                        }
                        this.cursor = this.limit - v_1;
                        this.slice_del$esjava$0();
                        v_3 = this.limit - this.cursor;
                        among_var = this.find_among_b$esjava$1(englishStemmer.a_3);
                        if (among_var === 0) {
                            return false;
                        }
                        this.cursor = this.limit - v_3;
                        switch (among_var) {
                            case 0:
                                return false;
                            case 1:
                                {
                                    var c = this.cursor;
                                    this.insert$esjava$3(this.cursor, this.cursor, "e");
                                    this.cursor = c;
                                }
                                break;
                            case 2:
                                this.ket = this.cursor;
                                if (this.cursor <= this.limit_backward) {
                                    return false;
                                }
                                this.cursor--;
                                this.bra = this.cursor;
                                this.slice_del$esjava$0();
                                break;
                            case 3:
                                if (this.cursor !== this.I_p1) {
                                    return false;
                                }
                                v_4 = this.limit - this.cursor;
                                if (!this.r_shortv$esjava$0()) {
                                    return false;
                                }
                                this.cursor = this.limit - v_4;
                                {
                                    var _c = this.cursor;
                                    this.insert$esjava$3(this.cursor, this.cursor, "e");
                                    this.cursor = _c;
                                }
                                break;
                        }
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Step_1c$esjava$0',
            value: function r_Step_1c$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                this.ket = this.cursor;
                lab0: do {
                    v_1 = this.limit - this.cursor;
                    lab1: do {
                        if (!this.eq_s_b$esjava$1("y")) {
                            break lab1;
                        }
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    if (!this.eq_s_b$esjava$1("Y")) {
                        return false;
                    }
                } while (false);
                this.bra = this.cursor;
                if (!this.out_grouping_b$esjava$3(englishStemmer.g_v, 97, 121)) {
                    return false;
                }
                {
                    v_2 = this.limit - this.cursor;
                    lab2: do {
                        if (this.cursor > this.limit_backward) {
                            break lab2;
                        }
                        return false;
                    } while (false);
                    this.cursor = this.limit - v_2;
                }
                this.slice_from$esjava$1("i");
                return true;
            }
        }, {
            key: 'r_Step_2$esjava$0',
            value: function r_Step_2$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(englishStemmer.a_5);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_R1$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_from$esjava$1("tion");
                        break;
                    case 2:
                        this.slice_from$esjava$1("ence");
                        break;
                    case 3:
                        this.slice_from$esjava$1("ance");
                        break;
                    case 4:
                        this.slice_from$esjava$1("able");
                        break;
                    case 5:
                        this.slice_from$esjava$1("ent");
                        break;
                    case 6:
                        this.slice_from$esjava$1("ize");
                        break;
                    case 7:
                        this.slice_from$esjava$1("ate");
                        break;
                    case 8:
                        this.slice_from$esjava$1("al");
                        break;
                    case 9:
                        this.slice_from$esjava$1("ful");
                        break;
                    case 10:
                        this.slice_from$esjava$1("ous");
                        break;
                    case 11:
                        this.slice_from$esjava$1("ive");
                        break;
                    case 12:
                        this.slice_from$esjava$1("ble");
                        break;
                    case 13:
                        if (!this.eq_s_b$esjava$1("l")) {
                            return false;
                        }
                        this.slice_from$esjava$1("og");
                        break;
                    case 14:
                        this.slice_from$esjava$1("ful");
                        break;
                    case 15:
                        this.slice_from$esjava$1("less");
                        break;
                    case 16:
                        if (!this.in_grouping_b$esjava$3(englishStemmer.g_valid_LI, 99, 116)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Step_3$esjava$0',
            value: function r_Step_3$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(englishStemmer.a_6);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_R1$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_from$esjava$1("tion");
                        break;
                    case 2:
                        this.slice_from$esjava$1("ate");
                        break;
                    case 3:
                        this.slice_from$esjava$1("al");
                        break;
                    case 4:
                        this.slice_from$esjava$1("ic");
                        break;
                    case 5:
                        this.slice_del$esjava$0();
                        break;
                    case 6:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Step_4$esjava$0',
            value: function r_Step_4$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(englishStemmer.a_7);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_R2$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        lab0: do {
                            v_1 = this.limit - this.cursor;
                            lab1: do {
                                if (!this.eq_s_b$esjava$1("s")) {
                                    break lab1;
                                }
                                break lab0;
                            } while (false);
                            this.cursor = this.limit - v_1;
                            if (!this.eq_s_b$esjava$1("t")) {
                                return false;
                            }
                        } while (false);
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Step_5$esjava$0',
            value: function r_Step_5$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(englishStemmer.a_8);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        lab0: do {
                            v_1 = this.limit - this.cursor;
                            lab1: do {
                                if (!this.r_R2$esjava$0()) {
                                    break lab1;
                                }
                                break lab0;
                            } while (false);
                            this.cursor = this.limit - v_1;
                            if (!this.r_R1$esjava$0()) {
                                return false;
                            }
                            {
                                v_2 = this.limit - this.cursor;
                                lab2: do {
                                    if (!this.r_shortv$esjava$0()) {
                                        break lab2;
                                    }
                                    return false;
                                } while (false);
                                this.cursor = this.limit - v_2;
                            }
                        } while (false);
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        if (!this.eq_s_b$esjava$1("l")) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_exception2$esjava$0',
            value: function r_exception2$esjava$0() {
                this.ket = this.cursor;
                if (this.find_among_b$esjava$1(englishStemmer.a_9) === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (this.cursor > this.limit_backward) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_exception1$esjava$0',
            value: function r_exception1$esjava$0() {
                var among_var = void 0;
                this.bra = this.cursor;
                among_var = this.find_among$esjava$1(englishStemmer.a_10);
                if (among_var === 0) {
                    return false;
                }
                this.ket = this.cursor;
                if (this.cursor < this.limit) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_from$esjava$1("ski");
                        break;
                    case 2:
                        this.slice_from$esjava$1("sky");
                        break;
                    case 3:
                        this.slice_from$esjava$1("die");
                        break;
                    case 4:
                        this.slice_from$esjava$1("lie");
                        break;
                    case 5:
                        this.slice_from$esjava$1("tie");
                        break;
                    case 6:
                        this.slice_from$esjava$1("idl");
                        break;
                    case 7:
                        this.slice_from$esjava$1("gentl");
                        break;
                    case 8:
                        this.slice_from$esjava$1("ugli");
                        break;
                    case 9:
                        this.slice_from$esjava$1("earli");
                        break;
                    case 10:
                        this.slice_from$esjava$1("onli");
                        break;
                    case 11:
                        this.slice_from$esjava$1("singl");
                        break;
                }
                return true;
            }
        }, {
            key: 'r_postlude$esjava$0',
            value: function r_postlude$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                if (!this.B_Y_found) {
                    return false;
                }
                replab0: while (true) {
                    v_1 = this.cursor;
                    lab1: do {
                        golab2: while (true) {
                            v_2 = this.cursor;
                            lab3: do {
                                this.bra = this.cursor;
                                if (!this.eq_s$esjava$1("Y")) {
                                    break lab3;
                                }
                                this.ket = this.cursor;
                                this.cursor = v_2;
                                break golab2;
                            } while (false);
                            this.cursor = v_2;
                            if (this.cursor >= this.limit) {
                                break lab1;
                            }
                            this.cursor++;
                        }
                        this.slice_from$esjava$1("y");
                        continue replab0;
                    } while (false);
                    this.cursor = v_1;
                    break replab0;
                }
                return true;
            }
        }, {
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                var v_8 = void 0;
                var v_9 = void 0;
                var v_10 = void 0;
                var v_11 = void 0;
                var v_12 = void 0;
                var v_13 = void 0;
                lab0: do {
                    v_1 = this.cursor;
                    lab1: do {
                        if (!this.r_exception1$esjava$0()) {
                            break lab1;
                        }
                        break lab0;
                    } while (false);
                    this.cursor = v_1;
                    lab2: do {
                        {
                            v_2 = this.cursor;
                            lab3: do {
                                {
                                    var c = this.cursor + 3;
                                    if (0 > c || c > this.limit) {
                                        break lab3;
                                    }
                                    this.cursor = c;
                                }
                                break lab2;
                            } while (false);
                            this.cursor = v_2;
                        }
                        break lab0;
                    } while (false);
                    this.cursor = v_1;
                    v_3 = this.cursor;
                    lab4: do {
                        if (!this.r_prelude$esjava$0()) {
                            break lab4;
                        }
                    } while (false);
                    this.cursor = v_3;
                    v_4 = this.cursor;
                    lab5: do {
                        if (!this.r_mark_regions$esjava$0()) {
                            break lab5;
                        }
                    } while (false);
                    this.cursor = v_4;
                    this.limit_backward = this.cursor;
                    this.cursor = this.limit;
                    v_5 = this.limit - this.cursor;
                    lab6: do {
                        if (!this.r_Step_1a$esjava$0()) {
                            break lab6;
                        }
                    } while (false);
                    this.cursor = this.limit - v_5;
                    lab7: do {
                        v_6 = this.limit - this.cursor;
                        lab8: do {
                            if (!this.r_exception2$esjava$0()) {
                                break lab8;
                            }
                            break lab7;
                        } while (false);
                        this.cursor = this.limit - v_6;
                        v_7 = this.limit - this.cursor;
                        lab9: do {
                            if (!this.r_Step_1b$esjava$0()) {
                                break lab9;
                            }
                        } while (false);
                        this.cursor = this.limit - v_7;
                        v_8 = this.limit - this.cursor;
                        lab10: do {
                            if (!this.r_Step_1c$esjava$0()) {
                                break lab10;
                            }
                        } while (false);
                        this.cursor = this.limit - v_8;
                        v_9 = this.limit - this.cursor;
                        lab11: do {
                            if (!this.r_Step_2$esjava$0()) {
                                break lab11;
                            }
                        } while (false);
                        this.cursor = this.limit - v_9;
                        v_10 = this.limit - this.cursor;
                        lab12: do {
                            if (!this.r_Step_3$esjava$0()) {
                                break lab12;
                            }
                        } while (false);
                        this.cursor = this.limit - v_10;
                        v_11 = this.limit - this.cursor;
                        lab13: do {
                            if (!this.r_Step_4$esjava$0()) {
                                break lab13;
                            }
                        } while (false);
                        this.cursor = this.limit - v_11;
                        v_12 = this.limit - this.cursor;
                        lab14: do {
                            if (!this.r_Step_5$esjava$0()) {
                                break lab14;
                            }
                        } while (false);
                        this.cursor = this.limit - v_12;
                    } while (false);
                    this.cursor = this.limit_backward;
                    v_13 = this.cursor;
                    lab15: do {
                        if (!this.r_postlude$esjava$0()) {
                            break lab15;
                        }
                    } while (false);
                    this.cursor = v_13;
                } while (false);
                return true;
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get32;

                for (var _len31 = arguments.length, args = Array(_len31), _key31 = 0; _key31 < _len31; _key31++) {
                    args[_key31] = arguments[_key31];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get32 = _get(Object.getPrototypeOf(englishStemmer.prototype), 'stem', this)).call.apply(_get32, [this].concat(args));
            }
        }, {
            key: 'B_Y_found',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$B_Y_found') ? this._$esjava$B_Y_found : this._$esjava$B_Y_found = false;
            },
            set: function set(v) {
                this._$esjava$B_Y_found = v;
            }
        }, {
            key: 'I_p2',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p2') ? this._$esjava$I_p2 : this._$esjava$I_p2 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p2 = v;
            }
        }, {
            key: 'I_p1',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p1') ? this._$esjava$I_p1 : this._$esjava$I_p1 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p1 = v;
            }
        }], [{
            key: 'a_0',
            get: function get() {
                delete englishStemmer.a_0;
                return englishStemmer.a_0 = [new Among("arsen", -1, -1), new Among("commun", -1, -1), new Among("gener", -1, -1)];
            }
        }, {
            key: 'a_1',
            get: function get() {
                delete englishStemmer.a_1;
                return englishStemmer.a_1 = [new Among("'", -1, 1), new Among("'s'", 0, 1), new Among("'s", -1, 1)];
            }
        }, {
            key: 'a_2',
            get: function get() {
                delete englishStemmer.a_2;
                return englishStemmer.a_2 = [new Among("ied", -1, 2), new Among("s", -1, 3), new Among("ies", 1, 2), new Among("sses", 1, 1), new Among("ss", 1, -1), new Among("us", 1, -1)];
            }
        }, {
            key: 'a_3',
            get: function get() {
                delete englishStemmer.a_3;
                return englishStemmer.a_3 = [new Among("", -1, 3), new Among("bb", 0, 2), new Among("dd", 0, 2), new Among("ff", 0, 2), new Among("gg", 0, 2), new Among("bl", 0, 1), new Among("mm", 0, 2), new Among("nn", 0, 2), new Among("pp", 0, 2), new Among("rr", 0, 2), new Among("at", 0, 1), new Among("tt", 0, 2), new Among("iz", 0, 1)];
            }
        }, {
            key: 'a_4',
            get: function get() {
                delete englishStemmer.a_4;
                return englishStemmer.a_4 = [new Among("ed", -1, 2), new Among("eed", 0, 1), new Among("ing", -1, 2), new Among("edly", -1, 2), new Among("eedly", 3, 1), new Among("ingly", -1, 2)];
            }
        }, {
            key: 'a_5',
            get: function get() {
                delete englishStemmer.a_5;
                return englishStemmer.a_5 = [new Among("anci", -1, 3), new Among("enci", -1, 2), new Among("ogi", -1, 13), new Among("li", -1, 16), new Among("bli", 3, 12), new Among("abli", 4, 4), new Among("alli", 3, 8), new Among("fulli", 3, 14), new Among("lessli", 3, 15), new Among("ousli", 3, 10), new Among("entli", 3, 5), new Among("aliti", -1, 8), new Among("biliti", -1, 12), new Among("iviti", -1, 11), new Among("tional", -1, 1), new Among("ational", 14, 7), new Among("alism", -1, 8), new Among("ation", -1, 7), new Among("ization", 17, 6), new Among("izer", -1, 6), new Among("ator", -1, 7), new Among("iveness", -1, 11), new Among("fulness", -1, 9), new Among("ousness", -1, 10)];
            }
        }, {
            key: 'a_6',
            get: function get() {
                delete englishStemmer.a_6;
                return englishStemmer.a_6 = [new Among("icate", -1, 4), new Among("ative", -1, 6), new Among("alize", -1, 3), new Among("iciti", -1, 4), new Among("ical", -1, 4), new Among("tional", -1, 1), new Among("ational", 5, 2), new Among("ful", -1, 5), new Among("ness", -1, 5)];
            }
        }, {
            key: 'a_7',
            get: function get() {
                delete englishStemmer.a_7;
                return englishStemmer.a_7 = [new Among("ic", -1, 1), new Among("ance", -1, 1), new Among("ence", -1, 1), new Among("able", -1, 1), new Among("ible", -1, 1), new Among("ate", -1, 1), new Among("ive", -1, 1), new Among("ize", -1, 1), new Among("iti", -1, 1), new Among("al", -1, 1), new Among("ism", -1, 1), new Among("ion", -1, 2), new Among("er", -1, 1), new Among("ous", -1, 1), new Among("ant", -1, 1), new Among("ent", -1, 1), new Among("ment", 15, 1), new Among("ement", 16, 1)];
            }
        }, {
            key: 'a_8',
            get: function get() {
                delete englishStemmer.a_8;
                return englishStemmer.a_8 = [new Among("e", -1, 1), new Among("l", -1, 2)];
            }
        }, {
            key: 'a_9',
            get: function get() {
                delete englishStemmer.a_9;
                return englishStemmer.a_9 = [new Among("succeed", -1, -1), new Among("proceed", -1, -1), new Among("exceed", -1, -1), new Among("canning", -1, -1), new Among("inning", -1, -1), new Among("earring", -1, -1), new Among("herring", -1, -1), new Among("outing", -1, -1)];
            }
        }, {
            key: 'a_10',
            get: function get() {
                delete englishStemmer.a_10;
                return englishStemmer.a_10 = [new Among("andes", -1, -1), new Among("atlas", -1, -1), new Among("bias", -1, -1), new Among("cosmos", -1, -1), new Among("dying", -1, 3), new Among("early", -1, 9), new Among("gently", -1, 7), new Among("howe", -1, -1), new Among("idly", -1, 6), new Among("lying", -1, 4), new Among("news", -1, -1), new Among("only", -1, 10), new Among("singly", -1, 11), new Among("skies", -1, 2), new Among("skis", -1, 1), new Among("sky", -1, -1), new Among("tying", -1, 5), new Among("ugly", -1, 8)];
            }
        }, {
            key: 'g_v',
            get: function get() {
                delete englishStemmer.g_v;
                return englishStemmer.g_v = [17, 65, 16, 1];
            }
        }, {
            key: 'g_v_WXY',
            get: function get() {
                delete englishStemmer.g_v_WXY;
                return englishStemmer.g_v_WXY = [1, 17, 65, 208, 1];
            }
        }, {
            key: 'g_valid_LI',
            get: function get() {
                delete englishStemmer.g_valid_LI;
                return englishStemmer.g_valid_LI = [55, 141, 2];
            }
        }]);

        return englishStemmer;
    }(SnowballStemmer);

    var finnishStemmer = function (_SnowballStemmer9) {
        _inherits(finnishStemmer, _SnowballStemmer9);

        function finnishStemmer() {
            _classCallCheck(this, finnishStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(finnishStemmer).apply(this, arguments));
        }

        _createClass(finnishStemmer, [{
            key: 'r_mark_regions$esjava$0',
            value: function r_mark_regions$esjava$0() {
                var v_1 = void 0;
                var v_3 = void 0;
                this.I_p1 = this.limit;
                this.I_p2 = this.limit;
                golab0: while (true) {
                    v_1 = this.cursor;
                    lab1: do {
                        if (!this.in_grouping$esjava$3(finnishStemmer.g_V1, 97, 246)) {
                            break lab1;
                        }
                        this.cursor = v_1;
                        break golab0;
                    } while (false);
                    this.cursor = v_1;
                    if (this.cursor >= this.limit) {
                        return false;
                    }
                    this.cursor++;
                }
                golab2: while (true) {
                    lab3: do {
                        if (!this.out_grouping$esjava$3(finnishStemmer.g_V1, 97, 246)) {
                            break lab3;
                        }
                        break golab2;
                    } while (false);
                    if (this.cursor >= this.limit) {
                        return false;
                    }
                    this.cursor++;
                }
                this.I_p1 = this.cursor;
                golab4: while (true) {
                    v_3 = this.cursor;
                    lab5: do {
                        if (!this.in_grouping$esjava$3(finnishStemmer.g_V1, 97, 246)) {
                            break lab5;
                        }
                        this.cursor = v_3;
                        break golab4;
                    } while (false);
                    this.cursor = v_3;
                    if (this.cursor >= this.limit) {
                        return false;
                    }
                    this.cursor++;
                }
                golab6: while (true) {
                    lab7: do {
                        if (!this.out_grouping$esjava$3(finnishStemmer.g_V1, 97, 246)) {
                            break lab7;
                        }
                        break golab6;
                    } while (false);
                    if (this.cursor >= this.limit) {
                        return false;
                    }
                    this.cursor++;
                }
                this.I_p2 = this.cursor;
                return true;
            }
        }, {
            key: 'r_R2$esjava$0',
            value: function r_R2$esjava$0() {
                if (!(this.I_p2 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_particle_etc$esjava$0',
            value: function r_particle_etc$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                v_1 = this.limit - this.cursor;
                if (this.cursor < this.I_p1) {
                    return false;
                }
                this.cursor = this.I_p1;
                v_2 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_1;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(finnishStemmer.a_0);
                if (among_var === 0) {
                    this.limit_backward = v_2;
                    return false;
                }
                this.bra = this.cursor;
                this.limit_backward = v_2;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!this.in_grouping_b$esjava$3(finnishStemmer.g_particle_end, 97, 246)) {
                            return false;
                        }
                        break;
                    case 2:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        break;
                }
                this.slice_del$esjava$0();
                return true;
            }
        }, {
            key: 'r_possessive$esjava$0',
            value: function r_possessive$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                v_1 = this.limit - this.cursor;
                if (this.cursor < this.I_p1) {
                    return false;
                }
                this.cursor = this.I_p1;
                v_2 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_1;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(finnishStemmer.a_4);
                if (among_var === 0) {
                    this.limit_backward = v_2;
                    return false;
                }
                this.bra = this.cursor;
                this.limit_backward = v_2;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        {
                            v_3 = this.limit - this.cursor;
                            lab0: do {
                                if (!this.eq_s_b$esjava$1("k")) {
                                    break lab0;
                                }
                                return false;
                            } while (false);
                            this.cursor = this.limit - v_3;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        this.slice_del$esjava$0();
                        this.ket = this.cursor;
                        if (!this.eq_s_b$esjava$1("kse")) {
                            return false;
                        }
                        this.bra = this.cursor;
                        this.slice_from$esjava$1("ksi");
                        break;
                    case 3:
                        this.slice_del$esjava$0();
                        break;
                    case 4:
                        if (this.find_among_b$esjava$1(finnishStemmer.a_1) === 0) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 5:
                        if (this.find_among_b$esjava$1(finnishStemmer.a_2) === 0) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 6:
                        if (this.find_among_b$esjava$1(finnishStemmer.a_3) === 0) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_LONG$esjava$0',
            value: function r_LONG$esjava$0() {
                if (this.find_among_b$esjava$1(finnishStemmer.a_5) === 0) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_VI$esjava$0',
            value: function r_VI$esjava$0() {
                if (!this.eq_s_b$esjava$1("i")) {
                    return false;
                }
                if (!this.in_grouping_b$esjava$3(finnishStemmer.g_V2, 97, 246)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_case_ending$esjava$0',
            value: function r_case_ending$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                v_1 = this.limit - this.cursor;
                if (this.cursor < this.I_p1) {
                    return false;
                }
                this.cursor = this.I_p1;
                v_2 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_1;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(this.a_6);
                if (among_var === 0) {
                    this.limit_backward = v_2;
                    return false;
                }
                this.bra = this.cursor;
                this.limit_backward = v_2;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!this.eq_s_b$esjava$1("a")) {
                            return false;
                        }
                        break;
                    case 2:
                        if (!this.eq_s_b$esjava$1("e")) {
                            return false;
                        }
                        break;
                    case 3:
                        if (!this.eq_s_b$esjava$1("i")) {
                            return false;
                        }
                        break;
                    case 4:
                        if (!this.eq_s_b$esjava$1("o")) {
                            return false;
                        }
                        break;
                    case 5:
                        if (!this.eq_s_b$esjava$1('\u00E4')) {
                            return false;
                        }
                        break;
                    case 6:
                        if (!this.eq_s_b$esjava$1('\u00F6')) {
                            return false;
                        }
                        break;
                    case 7:
                        v_3 = this.limit - this.cursor;
                        lab0: do {
                            v_4 = this.limit - this.cursor;
                            lab1: do {
                                v_5 = this.limit - this.cursor;
                                lab2: do {
                                    if (!this.r_LONG$esjava$0()) {
                                        break lab2;
                                    }
                                    break lab1;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                if (!this.eq_s_b$esjava$1("ie")) {
                                    this.cursor = this.limit - v_3;
                                    break lab0;
                                }
                            } while (false);
                            this.cursor = this.limit - v_4;
                            if (this.cursor <= this.limit_backward) {
                                this.cursor = this.limit - v_3;
                                break lab0;
                            }
                            this.cursor--;
                            this.bra = this.cursor;
                        } while (false);
                        break;
                    case 8:
                        if (!this.in_grouping_b$esjava$3(finnishStemmer.g_V1, 97, 246)) {
                            return false;
                        }
                        if (!this.out_grouping_b$esjava$3(finnishStemmer.g_V1, 97, 246)) {
                            return false;
                        }
                        break;
                    case 9:
                        if (!this.eq_s_b$esjava$1("e")) {
                            return false;
                        }
                        break;
                }
                this.slice_del$esjava$0();
                this.B_ending_removed = true;
                return true;
            }
        }, {
            key: 'r_other_endings$esjava$0',
            value: function r_other_endings$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                v_1 = this.limit - this.cursor;
                if (this.cursor < this.I_p2) {
                    return false;
                }
                this.cursor = this.I_p2;
                v_2 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_1;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(finnishStemmer.a_7);
                if (among_var === 0) {
                    this.limit_backward = v_2;
                    return false;
                }
                this.bra = this.cursor;
                this.limit_backward = v_2;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        {
                            v_3 = this.limit - this.cursor;
                            lab0: do {
                                if (!this.eq_s_b$esjava$1("po")) {
                                    break lab0;
                                }
                                return false;
                            } while (false);
                            this.cursor = this.limit - v_3;
                        }
                        break;
                }
                this.slice_del$esjava$0();
                return true;
            }
        }, {
            key: 'r_i_plural$esjava$0',
            value: function r_i_plural$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                v_1 = this.limit - this.cursor;
                if (this.cursor < this.I_p1) {
                    return false;
                }
                this.cursor = this.I_p1;
                v_2 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_1;
                this.ket = this.cursor;
                if (this.find_among_b$esjava$1(finnishStemmer.a_8) === 0) {
                    this.limit_backward = v_2;
                    return false;
                }
                this.bra = this.cursor;
                this.limit_backward = v_2;
                this.slice_del$esjava$0();
                return true;
            }
        }, {
            key: 'r_t_plural$esjava$0',
            value: function r_t_plural$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                v_1 = this.limit - this.cursor;
                if (this.cursor < this.I_p1) {
                    return false;
                }
                this.cursor = this.I_p1;
                v_2 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_1;
                this.ket = this.cursor;
                if (!this.eq_s_b$esjava$1("t")) {
                    this.limit_backward = v_2;
                    return false;
                }
                this.bra = this.cursor;
                v_3 = this.limit - this.cursor;
                if (!this.in_grouping_b$esjava$3(finnishStemmer.g_V1, 97, 246)) {
                    this.limit_backward = v_2;
                    return false;
                }
                this.cursor = this.limit - v_3;
                this.slice_del$esjava$0();
                this.limit_backward = v_2;
                v_4 = this.limit - this.cursor;
                if (this.cursor < this.I_p2) {
                    return false;
                }
                this.cursor = this.I_p2;
                v_5 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_4;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(finnishStemmer.a_9);
                if (among_var === 0) {
                    this.limit_backward = v_5;
                    return false;
                }
                this.bra = this.cursor;
                this.limit_backward = v_5;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        {
                            v_6 = this.limit - this.cursor;
                            lab0: do {
                                if (!this.eq_s_b$esjava$1("po")) {
                                    break lab0;
                                }
                                return false;
                            } while (false);
                            this.cursor = this.limit - v_6;
                        }
                        break;
                }
                this.slice_del$esjava$0();
                return true;
            }
        }, {
            key: 'r_tidy$esjava$0',
            value: function r_tidy$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                var v_8 = void 0;
                var v_9 = void 0;
                v_1 = this.limit - this.cursor;
                if (this.cursor < this.I_p1) {
                    return false;
                }
                this.cursor = this.I_p1;
                v_2 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_1;
                v_3 = this.limit - this.cursor;
                lab0: do {
                    v_4 = this.limit - this.cursor;
                    if (!this.r_LONG$esjava$0()) {
                        break lab0;
                    }
                    this.cursor = this.limit - v_4;
                    this.ket = this.cursor;
                    if (this.cursor <= this.limit_backward) {
                        break lab0;
                    }
                    this.cursor--;
                    this.bra = this.cursor;
                    this.slice_del$esjava$0();
                } while (false);
                this.cursor = this.limit - v_3;
                v_5 = this.limit - this.cursor;
                lab1: do {
                    this.ket = this.cursor;
                    if (!this.in_grouping_b$esjava$3(finnishStemmer.g_AEI, 97, 228)) {
                        break lab1;
                    }
                    this.bra = this.cursor;
                    if (!this.out_grouping_b$esjava$3(finnishStemmer.g_V1, 97, 246)) {
                        break lab1;
                    }
                    this.slice_del$esjava$0();
                } while (false);
                this.cursor = this.limit - v_5;
                v_6 = this.limit - this.cursor;
                lab2: do {
                    this.ket = this.cursor;
                    if (!this.eq_s_b$esjava$1("j")) {
                        break lab2;
                    }
                    this.bra = this.cursor;
                    lab3: do {
                        v_7 = this.limit - this.cursor;
                        lab4: do {
                            if (!this.eq_s_b$esjava$1("o")) {
                                break lab4;
                            }
                            break lab3;
                        } while (false);
                        this.cursor = this.limit - v_7;
                        if (!this.eq_s_b$esjava$1("u")) {
                            break lab2;
                        }
                    } while (false);
                    this.slice_del$esjava$0();
                } while (false);
                this.cursor = this.limit - v_6;
                v_8 = this.limit - this.cursor;
                lab5: do {
                    this.ket = this.cursor;
                    if (!this.eq_s_b$esjava$1("o")) {
                        break lab5;
                    }
                    this.bra = this.cursor;
                    if (!this.eq_s_b$esjava$1("j")) {
                        break lab5;
                    }
                    this.slice_del$esjava$0();
                } while (false);
                this.cursor = this.limit - v_8;
                this.limit_backward = v_2;
                golab6: while (true) {
                    v_9 = this.limit - this.cursor;
                    lab7: do {
                        if (!this.out_grouping_b$esjava$3(finnishStemmer.g_V1, 97, 246)) {
                            break lab7;
                        }
                        this.cursor = this.limit - v_9;
                        break golab6;
                    } while (false);
                    this.cursor = this.limit - v_9;
                    if (this.cursor <= this.limit_backward) {
                        return false;
                    }
                    this.cursor--;
                }
                this.ket = this.cursor;
                if (this.cursor <= this.limit_backward) {
                    return false;
                }
                this.cursor--;
                this.bra = this.cursor;
                this.S_x = this.slice_to$esjava$1(this.S_x);
                if (!this.eq_s_b$esjava$1(this.S_x.toString())) {
                    return false;
                }
                this.slice_del$esjava$0();
                return true;
            }
        }, {
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                var v_8 = void 0;
                var v_9 = void 0;
                v_1 = this.cursor;
                lab0: do {
                    if (!this.r_mark_regions$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = v_1;
                this.B_ending_removed = false;
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                v_2 = this.limit - this.cursor;
                lab1: do {
                    if (!this.r_particle_etc$esjava$0()) {
                        break lab1;
                    }
                } while (false);
                this.cursor = this.limit - v_2;
                v_3 = this.limit - this.cursor;
                lab2: do {
                    if (!this.r_possessive$esjava$0()) {
                        break lab2;
                    }
                } while (false);
                this.cursor = this.limit - v_3;
                v_4 = this.limit - this.cursor;
                lab3: do {
                    if (!this.r_case_ending$esjava$0()) {
                        break lab3;
                    }
                } while (false);
                this.cursor = this.limit - v_4;
                v_5 = this.limit - this.cursor;
                lab4: do {
                    if (!this.r_other_endings$esjava$0()) {
                        break lab4;
                    }
                } while (false);
                this.cursor = this.limit - v_5;
                lab5: do {
                    v_6 = this.limit - this.cursor;
                    lab6: do {
                        if (!this.B_ending_removed) {
                            break lab6;
                        }
                        v_7 = this.limit - this.cursor;
                        lab7: do {
                            if (!this.r_i_plural$esjava$0()) {
                                break lab7;
                            }
                        } while (false);
                        this.cursor = this.limit - v_7;
                        break lab5;
                    } while (false);
                    this.cursor = this.limit - v_6;
                    v_8 = this.limit - this.cursor;
                    lab8: do {
                        if (!this.r_t_plural$esjava$0()) {
                            break lab8;
                        }
                    } while (false);
                    this.cursor = this.limit - v_8;
                } while (false);
                v_9 = this.limit - this.cursor;
                lab9: do {
                    if (!this.r_tidy$esjava$0()) {
                        break lab9;
                    }
                } while (false);
                this.cursor = this.limit - v_9;
                this.cursor = this.limit_backward;
                return true;
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get33;

                for (var _len32 = arguments.length, args = Array(_len32), _key32 = 0; _key32 < _len32; _key32++) {
                    args[_key32] = arguments[_key32];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get33 = _get(Object.getPrototypeOf(finnishStemmer.prototype), 'stem', this)).call.apply(_get33, [this].concat(args));
            }
        }, {
            key: 'r_LONG',
            value: function r_LONG() {
                var _get34;

                for (var _len33 = arguments.length, args = Array(_len33), _key33 = 0; _key33 < _len33; _key33++) {
                    args[_key33] = arguments[_key33];
                }

                switch (args.length) {
                    case 0:
                        return this.r_LONG$esjava$0.apply(this, args);
                }
                return (_get34 = _get(Object.getPrototypeOf(finnishStemmer.prototype), 'r_LONG', this)).call.apply(_get34, [this].concat(args));
            }
        }, {
            key: 'r_VI',
            value: function r_VI() {
                var _get35;

                for (var _len34 = arguments.length, args = Array(_len34), _key34 = 0; _key34 < _len34; _key34++) {
                    args[_key34] = arguments[_key34];
                }

                switch (args.length) {
                    case 0:
                        return this.r_VI$esjava$0.apply(this, args);
                }
                return (_get35 = _get(Object.getPrototypeOf(finnishStemmer.prototype), 'r_VI', this)).call.apply(_get35, [this].concat(args));
            }
        }, {
            key: 'es6bridge',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$es6bridge') ? this._$esjava$es6bridge : this._$esjava$es6bridge = this;
            },
            set: function set(v) {
                this._$esjava$es6bridge = v;
            }
        }, {
            key: 'a_6',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$a_6') ? this._$esjava$a_6 : this._$esjava$a_6 = [new Among("a", -1, 8), new Among("lla", 0, -1), new Among("na", 0, -1), new Among("ssa", 0, -1), new Among("ta", 0, -1), new Among("lta", 4, -1), new Among("sta", 4, -1), new Among("tta", 4, 9), new Among("lle", -1, -1), new Among("ine", -1, -1), new Among("ksi", -1, -1), new Among("n", -1, 7), new Among("han", 11, 1), new Among("den", 11, -1, "r_VI", this.es6bridge), new Among("seen", 11, -1, "r_LONG", this.es6bridge), new Among("hen", 11, 2), new Among("tten", 11, -1, "r_VI", this.es6bridge), new Among("hin", 11, 3), new Among("siin", 11, -1, "r_VI", this.es6bridge), new Among("hon", 11, 4), new Among('h\u00E4n', 11, 5), new Among('h\u00F6n', 11, 6), new Among('\u00E4', -1, 8), new Among('ll\u00E4', 22, -1), new Among('n\u00E4', 22, -1), new Among('ss\u00E4', 22, -1), new Among('t\u00E4', 22, -1), new Among('lt\u00E4', 26, -1), new Among('st\u00E4', 26, -1), new Among('tt\u00E4', 26, 9)];
            },
            set: function set(v) {
                this._$esjava$a_6 = v;
            }
        }, {
            key: 'B_ending_removed',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$B_ending_removed') ? this._$esjava$B_ending_removed : this._$esjava$B_ending_removed = false;
            },
            set: function set(v) {
                this._$esjava$B_ending_removed = v;
            }
        }, {
            key: 'S_x',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$S_x') ? this._$esjava$S_x : this._$esjava$S_x = new StringBuilder();
            },
            set: function set(v) {
                this._$esjava$S_x = v;
            }
        }, {
            key: 'I_p2',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p2') ? this._$esjava$I_p2 : this._$esjava$I_p2 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p2 = v;
            }
        }, {
            key: 'I_p1',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p1') ? this._$esjava$I_p1 : this._$esjava$I_p1 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p1 = v;
            }
        }], [{
            key: 'a_0',
            get: function get() {
                delete finnishStemmer.a_0;
                return finnishStemmer.a_0 = [new Among("pa", -1, 1), new Among("sti", -1, 2), new Among("kaan", -1, 1), new Among("han", -1, 1), new Among("kin", -1, 1), new Among('h\u00E4n', -1, 1), new Among('k\u00E4\u00E4n', -1, 1), new Among("ko", -1, 1), new Among('p\u00E4', -1, 1), new Among('k\u00F6', -1, 1)];
            }
        }, {
            key: 'a_1',
            get: function get() {
                delete finnishStemmer.a_1;
                return finnishStemmer.a_1 = [new Among("lla", -1, -1), new Among("na", -1, -1), new Among("ssa", -1, -1), new Among("ta", -1, -1), new Among("lta", 3, -1), new Among("sta", 3, -1)];
            }
        }, {
            key: 'a_2',
            get: function get() {
                delete finnishStemmer.a_2;
                return finnishStemmer.a_2 = [new Among('ll\u00E4', -1, -1), new Among('n\u00E4', -1, -1), new Among('ss\u00E4', -1, -1), new Among('t\u00E4', -1, -1), new Among('lt\u00E4', 3, -1), new Among('st\u00E4', 3, -1)];
            }
        }, {
            key: 'a_3',
            get: function get() {
                delete finnishStemmer.a_3;
                return finnishStemmer.a_3 = [new Among("lle", -1, -1), new Among("ine", -1, -1)];
            }
        }, {
            key: 'a_4',
            get: function get() {
                delete finnishStemmer.a_4;
                return finnishStemmer.a_4 = [new Among("nsa", -1, 3), new Among("mme", -1, 3), new Among("nne", -1, 3), new Among("ni", -1, 2), new Among("si", -1, 1), new Among("an", -1, 4), new Among("en", -1, 6), new Among('\u00E4n', -1, 5), new Among('ns\u00E4', -1, 3)];
            }
        }, {
            key: 'a_5',
            get: function get() {
                delete finnishStemmer.a_5;
                return finnishStemmer.a_5 = [new Among("aa", -1, -1), new Among("ee", -1, -1), new Among("ii", -1, -1), new Among("oo", -1, -1), new Among("uu", -1, -1), new Among('\u00E4\u00E4', -1, -1), new Among('\u00F6\u00F6', -1, -1)];
            }
        }, {
            key: 'a_7',
            get: function get() {
                delete finnishStemmer.a_7;
                return finnishStemmer.a_7 = [new Among("eja", -1, -1), new Among("mma", -1, 1), new Among("imma", 1, -1), new Among("mpa", -1, 1), new Among("impa", 3, -1), new Among("mmi", -1, 1), new Among("immi", 5, -1), new Among("mpi", -1, 1), new Among("impi", 7, -1), new Among('ej\u00E4', -1, -1), new Among('mm\u00E4', -1, 1), new Among('imm\u00E4', 10, -1), new Among('mp\u00E4', -1, 1), new Among('imp\u00E4', 12, -1)];
            }
        }, {
            key: 'a_8',
            get: function get() {
                delete finnishStemmer.a_8;
                return finnishStemmer.a_8 = [new Among("i", -1, -1), new Among("j", -1, -1)];
            }
        }, {
            key: 'a_9',
            get: function get() {
                delete finnishStemmer.a_9;
                return finnishStemmer.a_9 = [new Among("mma", -1, 1), new Among("imma", 0, -1)];
            }
        }, {
            key: 'g_AEI',
            get: function get() {
                delete finnishStemmer.g_AEI;
                return finnishStemmer.g_AEI = [17, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8];
            }
        }, {
            key: 'g_V1',
            get: function get() {
                delete finnishStemmer.g_V1;
                return finnishStemmer.g_V1 = [17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 32];
            }
        }, {
            key: 'g_V2',
            get: function get() {
                delete finnishStemmer.g_V2;
                return finnishStemmer.g_V2 = [17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 32];
            }
        }, {
            key: 'g_particle_end',
            get: function get() {
                delete finnishStemmer.g_particle_end;
                return finnishStemmer.g_particle_end = [17, 97, 24, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 32];
            }
        }]);

        return finnishStemmer;
    }(SnowballStemmer);

    var frenchStemmer = function (_SnowballStemmer10) {
        _inherits(frenchStemmer, _SnowballStemmer10);

        function frenchStemmer() {
            _classCallCheck(this, frenchStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(frenchStemmer).apply(this, arguments));
        }

        _createClass(frenchStemmer, [{
            key: 'r_prelude$esjava$0',
            value: function r_prelude$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                replab0: while (true) {
                    v_1 = this.cursor;
                    lab1: do {
                        golab2: while (true) {
                            v_2 = this.cursor;
                            lab3: do {
                                lab4: do {
                                    v_3 = this.cursor;
                                    lab5: do {
                                        if (!this.in_grouping$esjava$3(frenchStemmer.g_v, 97, 251)) {
                                            break lab5;
                                        }
                                        this.bra = this.cursor;
                                        lab6: do {
                                            v_4 = this.cursor;
                                            lab7: do {
                                                if (!this.eq_s$esjava$1("u")) {
                                                    break lab7;
                                                }
                                                this.ket = this.cursor;
                                                if (!this.in_grouping$esjava$3(frenchStemmer.g_v, 97, 251)) {
                                                    break lab7;
                                                }
                                                this.slice_from$esjava$1("U");
                                                break lab6;
                                            } while (false);
                                            this.cursor = v_4;
                                            lab8: do {
                                                if (!this.eq_s$esjava$1("i")) {
                                                    break lab8;
                                                }
                                                this.ket = this.cursor;
                                                if (!this.in_grouping$esjava$3(frenchStemmer.g_v, 97, 251)) {
                                                    break lab8;
                                                }
                                                this.slice_from$esjava$1("I");
                                                break lab6;
                                            } while (false);
                                            this.cursor = v_4;
                                            if (!this.eq_s$esjava$1("y")) {
                                                break lab5;
                                            }
                                            this.ket = this.cursor;
                                            this.slice_from$esjava$1("Y");
                                        } while (false);
                                        break lab4;
                                    } while (false);
                                    this.cursor = v_3;
                                    lab9: do {
                                        this.bra = this.cursor;
                                        if (!this.eq_s$esjava$1("y")) {
                                            break lab9;
                                        }
                                        this.ket = this.cursor;
                                        if (!this.in_grouping$esjava$3(frenchStemmer.g_v, 97, 251)) {
                                            break lab9;
                                        }
                                        this.slice_from$esjava$1("Y");
                                        break lab4;
                                    } while (false);
                                    this.cursor = v_3;
                                    if (!this.eq_s$esjava$1("q")) {
                                        break lab3;
                                    }
                                    this.bra = this.cursor;
                                    if (!this.eq_s$esjava$1("u")) {
                                        break lab3;
                                    }
                                    this.ket = this.cursor;
                                    this.slice_from$esjava$1("U");
                                } while (false);
                                this.cursor = v_2;
                                break golab2;
                            } while (false);
                            this.cursor = v_2;
                            if (this.cursor >= this.limit) {
                                break lab1;
                            }
                            this.cursor++;
                        }
                        continue replab0;
                    } while (false);
                    this.cursor = v_1;
                    break replab0;
                }
                return true;
            }
        }, {
            key: 'r_mark_regions$esjava$0',
            value: function r_mark_regions$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_4 = void 0;
                this.I_pV = this.limit;
                this.I_p1 = this.limit;
                this.I_p2 = this.limit;
                v_1 = this.cursor;
                lab0: do {
                    lab1: do {
                        v_2 = this.cursor;
                        lab2: do {
                            if (!this.in_grouping$esjava$3(frenchStemmer.g_v, 97, 251)) {
                                break lab2;
                            }
                            if (!this.in_grouping$esjava$3(frenchStemmer.g_v, 97, 251)) {
                                break lab2;
                            }
                            if (this.cursor >= this.limit) {
                                break lab2;
                            }
                            this.cursor++;
                            break lab1;
                        } while (false);
                        this.cursor = v_2;
                        lab3: do {
                            if (this.find_among$esjava$1(frenchStemmer.a_0) === 0) {
                                break lab3;
                            }
                            break lab1;
                        } while (false);
                        this.cursor = v_2;
                        if (this.cursor >= this.limit) {
                            break lab0;
                        }
                        this.cursor++;
                        golab4: while (true) {
                            lab5: do {
                                if (!this.in_grouping$esjava$3(frenchStemmer.g_v, 97, 251)) {
                                    break lab5;
                                }
                                break golab4;
                            } while (false);
                            if (this.cursor >= this.limit) {
                                break lab0;
                            }
                            this.cursor++;
                        }
                    } while (false);
                    this.I_pV = this.cursor;
                } while (false);
                this.cursor = v_1;
                v_4 = this.cursor;
                lab6: do {
                    golab7: while (true) {
                        lab8: do {
                            if (!this.in_grouping$esjava$3(frenchStemmer.g_v, 97, 251)) {
                                break lab8;
                            }
                            break golab7;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab6;
                        }
                        this.cursor++;
                    }
                    golab9: while (true) {
                        lab10: do {
                            if (!this.out_grouping$esjava$3(frenchStemmer.g_v, 97, 251)) {
                                break lab10;
                            }
                            break golab9;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab6;
                        }
                        this.cursor++;
                    }
                    this.I_p1 = this.cursor;
                    golab11: while (true) {
                        lab12: do {
                            if (!this.in_grouping$esjava$3(frenchStemmer.g_v, 97, 251)) {
                                break lab12;
                            }
                            break golab11;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab6;
                        }
                        this.cursor++;
                    }
                    golab13: while (true) {
                        lab14: do {
                            if (!this.out_grouping$esjava$3(frenchStemmer.g_v, 97, 251)) {
                                break lab14;
                            }
                            break golab13;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab6;
                        }
                        this.cursor++;
                    }
                    this.I_p2 = this.cursor;
                } while (false);
                this.cursor = v_4;
                return true;
            }
        }, {
            key: 'r_postlude$esjava$0',
            value: function r_postlude$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                replab0: while (true) {
                    v_1 = this.cursor;
                    lab1: do {
                        this.bra = this.cursor;
                        among_var = this.find_among$esjava$1(frenchStemmer.a_1);
                        if (among_var === 0) {
                            break lab1;
                        }
                        this.ket = this.cursor;
                        switch (among_var) {
                            case 0:
                                break lab1;
                            case 1:
                                this.slice_from$esjava$1("i");
                                break;
                            case 2:
                                this.slice_from$esjava$1("u");
                                break;
                            case 3:
                                this.slice_from$esjava$1("y");
                                break;
                            case 4:
                                if (this.cursor >= this.limit) {
                                    break lab1;
                                }
                                this.cursor++;
                                break;
                        }
                        continue replab0;
                    } while (false);
                    this.cursor = v_1;
                    break replab0;
                }
                return true;
            }
        }, {
            key: 'r_RV$esjava$0',
            value: function r_RV$esjava$0() {
                if (!(this.I_pV <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_R1$esjava$0',
            value: function r_R1$esjava$0() {
                if (!(this.I_p1 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_R2$esjava$0',
            value: function r_R2$esjava$0() {
                if (!(this.I_p2 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_standard_suffix$esjava$0',
            value: function r_standard_suffix$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                var v_8 = void 0;
                var v_9 = void 0;
                var v_10 = void 0;
                var v_11 = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(frenchStemmer.a_4);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        v_1 = this.limit - this.cursor;
                        lab0: do {
                            this.ket = this.cursor;
                            if (!this.eq_s_b$esjava$1("ic")) {
                                this.cursor = this.limit - v_1;
                                break lab0;
                            }
                            this.bra = this.cursor;
                            lab1: do {
                                v_2 = this.limit - this.cursor;
                                lab2: do {
                                    if (!this.r_R2$esjava$0()) {
                                        break lab2;
                                    }
                                    this.slice_del$esjava$0();
                                    break lab1;
                                } while (false);
                                this.cursor = this.limit - v_2;
                                this.slice_from$esjava$1("iqU");
                            } while (false);
                        } while (false);
                        break;
                    case 3:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_from$esjava$1("log");
                        break;
                    case 4:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_from$esjava$1("u");
                        break;
                    case 5:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_from$esjava$1("ent");
                        break;
                    case 6:
                        if (!this.r_RV$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        v_3 = this.limit - this.cursor;
                        lab3: do {
                            this.ket = this.cursor;
                            among_var = this.find_among_b$esjava$1(frenchStemmer.a_2);
                            if (among_var === 0) {
                                this.cursor = this.limit - v_3;
                                break lab3;
                            }
                            this.bra = this.cursor;
                            switch (among_var) {
                                case 0:
                                    this.cursor = this.limit - v_3;
                                    break lab3;
                                case 1:
                                    if (!this.r_R2$esjava$0()) {
                                        this.cursor = this.limit - v_3;
                                        break lab3;
                                    }
                                    this.slice_del$esjava$0();
                                    this.ket = this.cursor;
                                    if (!this.eq_s_b$esjava$1("at")) {
                                        this.cursor = this.limit - v_3;
                                        break lab3;
                                    }
                                    this.bra = this.cursor;
                                    if (!this.r_R2$esjava$0()) {
                                        this.cursor = this.limit - v_3;
                                        break lab3;
                                    }
                                    this.slice_del$esjava$0();
                                    break;
                                case 2:
                                    lab4: do {
                                        v_4 = this.limit - this.cursor;
                                        lab5: do {
                                            if (!this.r_R2$esjava$0()) {
                                                break lab5;
                                            }
                                            this.slice_del$esjava$0();
                                            break lab4;
                                        } while (false);
                                        this.cursor = this.limit - v_4;
                                        if (!this.r_R1$esjava$0()) {
                                            this.cursor = this.limit - v_3;
                                            break lab3;
                                        }
                                        this.slice_from$esjava$1("eux");
                                    } while (false);
                                    break;
                                case 3:
                                    if (!this.r_R2$esjava$0()) {
                                        this.cursor = this.limit - v_3;
                                        break lab3;
                                    }
                                    this.slice_del$esjava$0();
                                    break;
                                case 4:
                                    if (!this.r_RV$esjava$0()) {
                                        this.cursor = this.limit - v_3;
                                        break lab3;
                                    }
                                    this.slice_from$esjava$1("i");
                                    break;
                            }
                        } while (false);
                        break;
                    case 7:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        v_5 = this.limit - this.cursor;
                        lab6: do {
                            this.ket = this.cursor;
                            among_var = this.find_among_b$esjava$1(frenchStemmer.a_3);
                            if (among_var === 0) {
                                this.cursor = this.limit - v_5;
                                break lab6;
                            }
                            this.bra = this.cursor;
                            switch (among_var) {
                                case 0:
                                    this.cursor = this.limit - v_5;
                                    break lab6;
                                case 1:
                                    lab7: do {
                                        v_6 = this.limit - this.cursor;
                                        lab8: do {
                                            if (!this.r_R2$esjava$0()) {
                                                break lab8;
                                            }
                                            this.slice_del$esjava$0();
                                            break lab7;
                                        } while (false);
                                        this.cursor = this.limit - v_6;
                                        this.slice_from$esjava$1("abl");
                                    } while (false);
                                    break;
                                case 2:
                                    lab9: do {
                                        v_7 = this.limit - this.cursor;
                                        lab10: do {
                                            if (!this.r_R2$esjava$0()) {
                                                break lab10;
                                            }
                                            this.slice_del$esjava$0();
                                            break lab9;
                                        } while (false);
                                        this.cursor = this.limit - v_7;
                                        this.slice_from$esjava$1("iqU");
                                    } while (false);
                                    break;
                                case 3:
                                    if (!this.r_R2$esjava$0()) {
                                        this.cursor = this.limit - v_5;
                                        break lab6;
                                    }
                                    this.slice_del$esjava$0();
                                    break;
                            }
                        } while (false);
                        break;
                    case 8:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        v_8 = this.limit - this.cursor;
                        lab11: do {
                            this.ket = this.cursor;
                            if (!this.eq_s_b$esjava$1("at")) {
                                this.cursor = this.limit - v_8;
                                break lab11;
                            }
                            this.bra = this.cursor;
                            if (!this.r_R2$esjava$0()) {
                                this.cursor = this.limit - v_8;
                                break lab11;
                            }
                            this.slice_del$esjava$0();
                            this.ket = this.cursor;
                            if (!this.eq_s_b$esjava$1("ic")) {
                                this.cursor = this.limit - v_8;
                                break lab11;
                            }
                            this.bra = this.cursor;
                            lab12: do {
                                v_9 = this.limit - this.cursor;
                                lab13: do {
                                    if (!this.r_R2$esjava$0()) {
                                        break lab13;
                                    }
                                    this.slice_del$esjava$0();
                                    break lab12;
                                } while (false);
                                this.cursor = this.limit - v_9;
                                this.slice_from$esjava$1("iqU");
                            } while (false);
                        } while (false);
                        break;
                    case 9:
                        this.slice_from$esjava$1("eau");
                        break;
                    case 10:
                        if (!this.r_R1$esjava$0()) {
                            return false;
                        }
                        this.slice_from$esjava$1("al");
                        break;
                    case 11:
                        lab14: do {
                            v_10 = this.limit - this.cursor;
                            lab15: do {
                                if (!this.r_R2$esjava$0()) {
                                    break lab15;
                                }
                                this.slice_del$esjava$0();
                                break lab14;
                            } while (false);
                            this.cursor = this.limit - v_10;
                            if (!this.r_R1$esjava$0()) {
                                return false;
                            }
                            this.slice_from$esjava$1("eux");
                        } while (false);
                        break;
                    case 12:
                        if (!this.r_R1$esjava$0()) {
                            return false;
                        }
                        if (!this.out_grouping_b$esjava$3(frenchStemmer.g_v, 97, 251)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 13:
                        if (!this.r_RV$esjava$0()) {
                            return false;
                        }
                        this.slice_from$esjava$1("ant");
                        return false;
                    case 14:
                        if (!this.r_RV$esjava$0()) {
                            return false;
                        }
                        this.slice_from$esjava$1("ent");
                        return false;
                    case 15:
                        v_11 = this.limit - this.cursor;
                        if (!this.in_grouping_b$esjava$3(frenchStemmer.g_v, 97, 251)) {
                            return false;
                        }
                        if (!this.r_RV$esjava$0()) {
                            return false;
                        }
                        this.cursor = this.limit - v_11;
                        this.slice_del$esjava$0();
                        return false;
                }
                return true;
            }
        }, {
            key: 'r_i_verb_suffix$esjava$0',
            value: function r_i_verb_suffix$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                v_1 = this.limit - this.cursor;
                if (this.cursor < this.I_pV) {
                    return false;
                }
                this.cursor = this.I_pV;
                v_2 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_1;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(frenchStemmer.a_5);
                if (among_var === 0) {
                    this.limit_backward = v_2;
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        this.limit_backward = v_2;
                        return false;
                    case 1:
                        if (!this.out_grouping_b$esjava$3(frenchStemmer.g_v, 97, 251)) {
                            this.limit_backward = v_2;
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                this.limit_backward = v_2;
                return true;
            }
        }, {
            key: 'r_verb_suffix$esjava$0',
            value: function r_verb_suffix$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                v_1 = this.limit - this.cursor;
                if (this.cursor < this.I_pV) {
                    return false;
                }
                this.cursor = this.I_pV;
                v_2 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_1;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(frenchStemmer.a_6);
                if (among_var === 0) {
                    this.limit_backward = v_2;
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        this.limit_backward = v_2;
                        return false;
                    case 1:
                        if (!this.r_R2$esjava$0()) {
                            this.limit_backward = v_2;
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        this.slice_del$esjava$0();
                        break;
                    case 3:
                        this.slice_del$esjava$0();
                        v_3 = this.limit - this.cursor;
                        lab0: do {
                            this.ket = this.cursor;
                            if (!this.eq_s_b$esjava$1("e")) {
                                this.cursor = this.limit - v_3;
                                break lab0;
                            }
                            this.bra = this.cursor;
                            this.slice_del$esjava$0();
                        } while (false);
                        break;
                }
                this.limit_backward = v_2;
                return true;
            }
        }, {
            key: 'r_residual_suffix$esjava$0',
            value: function r_residual_suffix$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                v_1 = this.limit - this.cursor;
                lab0: do {
                    this.ket = this.cursor;
                    if (!this.eq_s_b$esjava$1("s")) {
                        this.cursor = this.limit - v_1;
                        break lab0;
                    }
                    this.bra = this.cursor;
                    v_2 = this.limit - this.cursor;
                    if (!this.out_grouping_b$esjava$3(frenchStemmer.g_keep_with_s, 97, 232)) {
                        this.cursor = this.limit - v_1;
                        break lab0;
                    }
                    this.cursor = this.limit - v_2;
                    this.slice_del$esjava$0();
                } while (false);
                v_3 = this.limit - this.cursor;
                if (this.cursor < this.I_pV) {
                    return false;
                }
                this.cursor = this.I_pV;
                v_4 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_3;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(frenchStemmer.a_7);
                if (among_var === 0) {
                    this.limit_backward = v_4;
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        this.limit_backward = v_4;
                        return false;
                    case 1:
                        if (!this.r_R2$esjava$0()) {
                            this.limit_backward = v_4;
                            return false;
                        }
                        lab1: do {
                            v_5 = this.limit - this.cursor;
                            lab2: do {
                                if (!this.eq_s_b$esjava$1("s")) {
                                    break lab2;
                                }
                                break lab1;
                            } while (false);
                            this.cursor = this.limit - v_5;
                            if (!this.eq_s_b$esjava$1("t")) {
                                this.limit_backward = v_4;
                                return false;
                            }
                        } while (false);
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        this.slice_from$esjava$1("i");
                        break;
                    case 3:
                        this.slice_del$esjava$0();
                        break;
                    case 4:
                        if (!this.eq_s_b$esjava$1("gu")) {
                            this.limit_backward = v_4;
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                this.limit_backward = v_4;
                return true;
            }
        }, {
            key: 'r_un_double$esjava$0',
            value: function r_un_double$esjava$0() {
                var v_1 = void 0;
                v_1 = this.limit - this.cursor;
                if (this.find_among_b$esjava$1(frenchStemmer.a_8) === 0) {
                    return false;
                }
                this.cursor = this.limit - v_1;
                this.ket = this.cursor;
                if (this.cursor <= this.limit_backward) {
                    return false;
                }
                this.cursor--;
                this.bra = this.cursor;
                this.slice_del$esjava$0();
                return true;
            }
        }, {
            key: 'r_un_accent$esjava$0',
            value: function r_un_accent$esjava$0() {
                var v_3 = void 0;
                {
                    var v_1 = 1;
                    replab0: while (true) {
                        lab1: do {
                            if (!this.out_grouping_b$esjava$3(frenchStemmer.g_v, 97, 251)) {
                                break lab1;
                            }
                            v_1--;
                            continue replab0;
                        } while (false);
                        break replab0;
                    }
                    if (v_1 > 0) {
                        return false;
                    }
                }
                this.ket = this.cursor;
                lab2: do {
                    v_3 = this.limit - this.cursor;
                    lab3: do {
                        if (!this.eq_s_b$esjava$1('\u00E9')) {
                            break lab3;
                        }
                        break lab2;
                    } while (false);
                    this.cursor = this.limit - v_3;
                    if (!this.eq_s_b$esjava$1('\u00E8')) {
                        return false;
                    }
                } while (false);
                this.bra = this.cursor;
                this.slice_from$esjava$1("e");
                return true;
            }
        }, {
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                var v_8 = void 0;
                var v_9 = void 0;
                var v_10 = void 0;
                var v_11 = void 0;
                v_1 = this.cursor;
                lab0: do {
                    if (!this.r_prelude$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = v_1;
                v_2 = this.cursor;
                lab1: do {
                    if (!this.r_mark_regions$esjava$0()) {
                        break lab1;
                    }
                } while (false);
                this.cursor = v_2;
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                v_3 = this.limit - this.cursor;
                lab2: do {
                    lab3: do {
                        v_4 = this.limit - this.cursor;
                        lab4: do {
                            v_5 = this.limit - this.cursor;
                            lab5: do {
                                v_6 = this.limit - this.cursor;
                                lab6: do {
                                    if (!this.r_standard_suffix$esjava$0()) {
                                        break lab6;
                                    }
                                    break lab5;
                                } while (false);
                                this.cursor = this.limit - v_6;
                                lab7: do {
                                    if (!this.r_i_verb_suffix$esjava$0()) {
                                        break lab7;
                                    }
                                    break lab5;
                                } while (false);
                                this.cursor = this.limit - v_6;
                                if (!this.r_verb_suffix$esjava$0()) {
                                    break lab4;
                                }
                            } while (false);
                            this.cursor = this.limit - v_5;
                            v_7 = this.limit - this.cursor;
                            lab8: do {
                                this.ket = this.cursor;
                                lab9: do {
                                    v_8 = this.limit - this.cursor;
                                    lab10: do {
                                        if (!this.eq_s_b$esjava$1("Y")) {
                                            break lab10;
                                        }
                                        this.bra = this.cursor;
                                        this.slice_from$esjava$1("i");
                                        break lab9;
                                    } while (false);
                                    this.cursor = this.limit - v_8;
                                    if (!this.eq_s_b$esjava$1('\u00E7')) {
                                        this.cursor = this.limit - v_7;
                                        break lab8;
                                    }
                                    this.bra = this.cursor;
                                    this.slice_from$esjava$1("c");
                                } while (false);
                            } while (false);
                            break lab3;
                        } while (false);
                        this.cursor = this.limit - v_4;
                        if (!this.r_residual_suffix$esjava$0()) {
                            break lab2;
                        }
                    } while (false);
                } while (false);
                this.cursor = this.limit - v_3;
                v_9 = this.limit - this.cursor;
                lab11: do {
                    if (!this.r_un_double$esjava$0()) {
                        break lab11;
                    }
                } while (false);
                this.cursor = this.limit - v_9;
                v_10 = this.limit - this.cursor;
                lab12: do {
                    if (!this.r_un_accent$esjava$0()) {
                        break lab12;
                    }
                } while (false);
                this.cursor = this.limit - v_10;
                this.cursor = this.limit_backward;
                v_11 = this.cursor;
                lab13: do {
                    if (!this.r_postlude$esjava$0()) {
                        break lab13;
                    }
                } while (false);
                this.cursor = v_11;
                return true;
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get36;

                for (var _len35 = arguments.length, args = Array(_len35), _key35 = 0; _key35 < _len35; _key35++) {
                    args[_key35] = arguments[_key35];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get36 = _get(Object.getPrototypeOf(frenchStemmer.prototype), 'stem', this)).call.apply(_get36, [this].concat(args));
            }
        }, {
            key: 'I_p2',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p2') ? this._$esjava$I_p2 : this._$esjava$I_p2 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p2 = v;
            }
        }, {
            key: 'I_p1',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p1') ? this._$esjava$I_p1 : this._$esjava$I_p1 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p1 = v;
            }
        }, {
            key: 'I_pV',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_pV') ? this._$esjava$I_pV : this._$esjava$I_pV = 0;
            },
            set: function set(v) {
                this._$esjava$I_pV = v;
            }
        }], [{
            key: 'a_0',
            get: function get() {
                delete frenchStemmer.a_0;
                return frenchStemmer.a_0 = [new Among("col", -1, -1), new Among("par", -1, -1), new Among("tap", -1, -1)];
            }
        }, {
            key: 'a_1',
            get: function get() {
                delete frenchStemmer.a_1;
                return frenchStemmer.a_1 = [new Among("", -1, 4), new Among("I", 0, 1), new Among("U", 0, 2), new Among("Y", 0, 3)];
            }
        }, {
            key: 'a_2',
            get: function get() {
                delete frenchStemmer.a_2;
                return frenchStemmer.a_2 = [new Among("iqU", -1, 3), new Among("abl", -1, 3), new Among('I\u00E8r', -1, 4), new Among('i\u00E8r', -1, 4), new Among("eus", -1, 2), new Among("iv", -1, 1)];
            }
        }, {
            key: 'a_3',
            get: function get() {
                delete frenchStemmer.a_3;
                return frenchStemmer.a_3 = [new Among("ic", -1, 2), new Among("abil", -1, 1), new Among("iv", -1, 3)];
            }
        }, {
            key: 'a_4',
            get: function get() {
                delete frenchStemmer.a_4;
                return frenchStemmer.a_4 = [new Among("iqUe", -1, 1), new Among("atrice", -1, 2), new Among("ance", -1, 1), new Among("ence", -1, 5), new Among("logie", -1, 3), new Among("able", -1, 1), new Among("isme", -1, 1), new Among("euse", -1, 11), new Among("iste", -1, 1), new Among("ive", -1, 8), new Among("if", -1, 8), new Among("usion", -1, 4), new Among("ation", -1, 2), new Among("ution", -1, 4), new Among("ateur", -1, 2), new Among("iqUes", -1, 1), new Among("atrices", -1, 2), new Among("ances", -1, 1), new Among("ences", -1, 5), new Among("logies", -1, 3), new Among("ables", -1, 1), new Among("ismes", -1, 1), new Among("euses", -1, 11), new Among("istes", -1, 1), new Among("ives", -1, 8), new Among("ifs", -1, 8), new Among("usions", -1, 4), new Among("ations", -1, 2), new Among("utions", -1, 4), new Among("ateurs", -1, 2), new Among("ments", -1, 15), new Among("ements", 30, 6), new Among("issements", 31, 12), new Among('it\u00E9s', -1, 7), new Among("ment", -1, 15), new Among("ement", 34, 6), new Among("issement", 35, 12), new Among("amment", 34, 13), new Among("emment", 34, 14), new Among("aux", -1, 10), new Among("eaux", 39, 9), new Among("eux", -1, 1), new Among('it\u00E9', -1, 7)];
            }
        }, {
            key: 'a_5',
            get: function get() {
                delete frenchStemmer.a_5;
                return frenchStemmer.a_5 = [new Among("ira", -1, 1), new Among("ie", -1, 1), new Among("isse", -1, 1), new Among("issante", -1, 1), new Among("i", -1, 1), new Among("irai", 4, 1), new Among("ir", -1, 1), new Among("iras", -1, 1), new Among("ies", -1, 1), new Among('\u00EEmes', -1, 1), new Among("isses", -1, 1), new Among("issantes", -1, 1), new Among('\u00EEtes', -1, 1), new Among("is", -1, 1), new Among("irais", 13, 1), new Among("issais", 13, 1), new Among("irions", -1, 1), new Among("issions", -1, 1), new Among("irons", -1, 1), new Among("issons", -1, 1), new Among("issants", -1, 1), new Among("it", -1, 1), new Among("irait", 21, 1), new Among("issait", 21, 1), new Among("issant", -1, 1), new Among("iraIent", -1, 1), new Among("issaIent", -1, 1), new Among("irent", -1, 1), new Among("issent", -1, 1), new Among("iront", -1, 1), new Among('\u00EEt', -1, 1), new Among("iriez", -1, 1), new Among("issiez", -1, 1), new Among("irez", -1, 1), new Among("issez", -1, 1)];
            }
        }, {
            key: 'a_6',
            get: function get() {
                delete frenchStemmer.a_6;
                return frenchStemmer.a_6 = [new Among("a", -1, 3), new Among("era", 0, 2), new Among("asse", -1, 3), new Among("ante", -1, 3), new Among('\u00E9e', -1, 2), new Among("ai", -1, 3), new Among("erai", 5, 2), new Among("er", -1, 2), new Among("as", -1, 3), new Among("eras", 8, 2), new Among('\u00E2mes', -1, 3), new Among("asses", -1, 3), new Among("antes", -1, 3), new Among('\u00E2tes', -1, 3), new Among('\u00E9es', -1, 2), new Among("ais", -1, 3), new Among("erais", 15, 2), new Among("ions", -1, 1), new Among("erions", 17, 2), new Among("assions", 17, 3), new Among("erons", -1, 2), new Among("ants", -1, 3), new Among('\u00E9s', -1, 2), new Among("ait", -1, 3), new Among("erait", 23, 2), new Among("ant", -1, 3), new Among("aIent", -1, 3), new Among("eraIent", 26, 2), new Among('\u00E8rent', -1, 2), new Among("assent", -1, 3), new Among("eront", -1, 2), new Among('\u00E2t', -1, 3), new Among("ez", -1, 2), new Among("iez", 32, 2), new Among("eriez", 33, 2), new Among("assiez", 33, 3), new Among("erez", 32, 2), new Among('\u00E9', -1, 2)];
            }
        }, {
            key: 'a_7',
            get: function get() {
                delete frenchStemmer.a_7;
                return frenchStemmer.a_7 = [new Among("e", -1, 3), new Among('I\u00E8re', 0, 2), new Among('i\u00E8re', 0, 2), new Among("ion", -1, 1), new Among("Ier", -1, 2), new Among("ier", -1, 2), new Among('\u00EB', -1, 4)];
            }
        }, {
            key: 'a_8',
            get: function get() {
                delete frenchStemmer.a_8;
                return frenchStemmer.a_8 = [new Among("ell", -1, -1), new Among("eill", -1, -1), new Among("enn", -1, -1), new Among("onn", -1, -1), new Among("ett", -1, -1)];
            }
        }, {
            key: 'g_v',
            get: function get() {
                delete frenchStemmer.g_v;
                return frenchStemmer.g_v = [17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128, 130, 103, 8, 5];
            }
        }, {
            key: 'g_keep_with_s',
            get: function get() {
                delete frenchStemmer.g_keep_with_s;
                return frenchStemmer.g_keep_with_s = [1, 65, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128];
            }
        }]);

        return frenchStemmer;
    }(SnowballStemmer);

    var germanStemmer = function (_SnowballStemmer11) {
        _inherits(germanStemmer, _SnowballStemmer11);

        function germanStemmer() {
            _classCallCheck(this, germanStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(germanStemmer).apply(this, arguments));
        }

        _createClass(germanStemmer, [{
            key: 'r_prelude$esjava$0',
            value: function r_prelude$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                v_1 = this.cursor;
                replab0: while (true) {
                    v_2 = this.cursor;
                    lab1: do {
                        lab2: do {
                            v_3 = this.cursor;
                            lab3: do {
                                this.bra = this.cursor;
                                if (!this.eq_s$esjava$1('\u00DF')) {
                                    break lab3;
                                }
                                this.ket = this.cursor;
                                this.slice_from$esjava$1("ss");
                                break lab2;
                            } while (false);
                            this.cursor = v_3;
                            if (this.cursor >= this.limit) {
                                break lab1;
                            }
                            this.cursor++;
                        } while (false);
                        continue replab0;
                    } while (false);
                    this.cursor = v_2;
                    break replab0;
                }
                this.cursor = v_1;
                replab4: while (true) {
                    v_4 = this.cursor;
                    lab5: do {
                        golab6: while (true) {
                            v_5 = this.cursor;
                            lab7: do {
                                if (!this.in_grouping$esjava$3(germanStemmer.g_v, 97, 252)) {
                                    break lab7;
                                }
                                this.bra = this.cursor;
                                lab8: do {
                                    v_6 = this.cursor;
                                    lab9: do {
                                        if (!this.eq_s$esjava$1("u")) {
                                            break lab9;
                                        }
                                        this.ket = this.cursor;
                                        if (!this.in_grouping$esjava$3(germanStemmer.g_v, 97, 252)) {
                                            break lab9;
                                        }
                                        this.slice_from$esjava$1("U");
                                        break lab8;
                                    } while (false);
                                    this.cursor = v_6;
                                    if (!this.eq_s$esjava$1("y")) {
                                        break lab7;
                                    }
                                    this.ket = this.cursor;
                                    if (!this.in_grouping$esjava$3(germanStemmer.g_v, 97, 252)) {
                                        break lab7;
                                    }
                                    this.slice_from$esjava$1("Y");
                                } while (false);
                                this.cursor = v_5;
                                break golab6;
                            } while (false);
                            this.cursor = v_5;
                            if (this.cursor >= this.limit) {
                                break lab5;
                            }
                            this.cursor++;
                        }
                        continue replab4;
                    } while (false);
                    this.cursor = v_4;
                    break replab4;
                }
                return true;
            }
        }, {
            key: 'r_mark_regions$esjava$0',
            value: function r_mark_regions$esjava$0() {
                var v_1 = void 0;
                this.I_p1 = this.limit;
                this.I_p2 = this.limit;
                v_1 = this.cursor;
                {
                    var c = this.cursor + 3;
                    if (0 > c || c > this.limit) {
                        return false;
                    }
                    this.cursor = c;
                }
                this.I_x = this.cursor;
                this.cursor = v_1;
                golab0: while (true) {
                    lab1: do {
                        if (!this.in_grouping$esjava$3(germanStemmer.g_v, 97, 252)) {
                            break lab1;
                        }
                        break golab0;
                    } while (false);
                    if (this.cursor >= this.limit) {
                        return false;
                    }
                    this.cursor++;
                }
                golab2: while (true) {
                    lab3: do {
                        if (!this.out_grouping$esjava$3(germanStemmer.g_v, 97, 252)) {
                            break lab3;
                        }
                        break golab2;
                    } while (false);
                    if (this.cursor >= this.limit) {
                        return false;
                    }
                    this.cursor++;
                }
                this.I_p1 = this.cursor;
                lab4: do {
                    if (!(this.I_p1 < this.I_x)) {
                        break lab4;
                    }
                    this.I_p1 = this.I_x;
                } while (false);
                golab5: while (true) {
                    lab6: do {
                        if (!this.in_grouping$esjava$3(germanStemmer.g_v, 97, 252)) {
                            break lab6;
                        }
                        break golab5;
                    } while (false);
                    if (this.cursor >= this.limit) {
                        return false;
                    }
                    this.cursor++;
                }
                golab7: while (true) {
                    lab8: do {
                        if (!this.out_grouping$esjava$3(germanStemmer.g_v, 97, 252)) {
                            break lab8;
                        }
                        break golab7;
                    } while (false);
                    if (this.cursor >= this.limit) {
                        return false;
                    }
                    this.cursor++;
                }
                this.I_p2 = this.cursor;
                return true;
            }
        }, {
            key: 'r_postlude$esjava$0',
            value: function r_postlude$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                replab0: while (true) {
                    v_1 = this.cursor;
                    lab1: do {
                        this.bra = this.cursor;
                        among_var = this.find_among$esjava$1(germanStemmer.a_0);
                        if (among_var === 0) {
                            break lab1;
                        }
                        this.ket = this.cursor;
                        switch (among_var) {
                            case 0:
                                break lab1;
                            case 1:
                                this.slice_from$esjava$1("y");
                                break;
                            case 2:
                                this.slice_from$esjava$1("u");
                                break;
                            case 3:
                                this.slice_from$esjava$1("a");
                                break;
                            case 4:
                                this.slice_from$esjava$1("o");
                                break;
                            case 5:
                                this.slice_from$esjava$1("u");
                                break;
                            case 6:
                                if (this.cursor >= this.limit) {
                                    break lab1;
                                }
                                this.cursor++;
                                break;
                        }
                        continue replab0;
                    } while (false);
                    this.cursor = v_1;
                    break replab0;
                }
                return true;
            }
        }, {
            key: 'r_R1$esjava$0',
            value: function r_R1$esjava$0() {
                if (!(this.I_p1 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_R2$esjava$0',
            value: function r_R2$esjava$0() {
                if (!(this.I_p2 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_standard_suffix$esjava$0',
            value: function r_standard_suffix$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                var v_8 = void 0;
                var v_9 = void 0;
                var v_10 = void 0;
                v_1 = this.limit - this.cursor;
                lab0: do {
                    this.ket = this.cursor;
                    among_var = this.find_among_b$esjava$1(germanStemmer.a_1);
                    if (among_var === 0) {
                        break lab0;
                    }
                    this.bra = this.cursor;
                    if (!this.r_R1$esjava$0()) {
                        break lab0;
                    }
                    switch (among_var) {
                        case 0:
                            break lab0;
                        case 1:
                            this.slice_del$esjava$0();
                            break;
                        case 2:
                            this.slice_del$esjava$0();
                            v_2 = this.limit - this.cursor;
                            lab1: do {
                                this.ket = this.cursor;
                                if (!this.eq_s_b$esjava$1("s")) {
                                    this.cursor = this.limit - v_2;
                                    break lab1;
                                }
                                this.bra = this.cursor;
                                if (!this.eq_s_b$esjava$1("nis")) {
                                    this.cursor = this.limit - v_2;
                                    break lab1;
                                }
                                this.slice_del$esjava$0();
                            } while (false);
                            break;
                        case 3:
                            if (!this.in_grouping_b$esjava$3(germanStemmer.g_s_ending, 98, 116)) {
                                break lab0;
                            }
                            this.slice_del$esjava$0();
                            break;
                    }
                } while (false);
                this.cursor = this.limit - v_1;
                v_3 = this.limit - this.cursor;
                lab2: do {
                    this.ket = this.cursor;
                    among_var = this.find_among_b$esjava$1(germanStemmer.a_2);
                    if (among_var === 0) {
                        break lab2;
                    }
                    this.bra = this.cursor;
                    if (!this.r_R1$esjava$0()) {
                        break lab2;
                    }
                    switch (among_var) {
                        case 0:
                            break lab2;
                        case 1:
                            this.slice_del$esjava$0();
                            break;
                        case 2:
                            if (!this.in_grouping_b$esjava$3(germanStemmer.g_st_ending, 98, 116)) {
                                break lab2;
                            }
                            {
                                var c = this.cursor - 3;
                                if (this.limit_backward > c || c > this.limit) {
                                    break lab2;
                                }
                                this.cursor = c;
                            }
                            this.slice_del$esjava$0();
                            break;
                    }
                } while (false);
                this.cursor = this.limit - v_3;
                v_4 = this.limit - this.cursor;
                lab3: do {
                    this.ket = this.cursor;
                    among_var = this.find_among_b$esjava$1(germanStemmer.a_4);
                    if (among_var === 0) {
                        break lab3;
                    }
                    this.bra = this.cursor;
                    if (!this.r_R2$esjava$0()) {
                        break lab3;
                    }
                    switch (among_var) {
                        case 0:
                            break lab3;
                        case 1:
                            this.slice_del$esjava$0();
                            v_5 = this.limit - this.cursor;
                            lab4: do {
                                this.ket = this.cursor;
                                if (!this.eq_s_b$esjava$1("ig")) {
                                    this.cursor = this.limit - v_5;
                                    break lab4;
                                }
                                this.bra = this.cursor;
                                {
                                    v_6 = this.limit - this.cursor;
                                    lab5: do {
                                        if (!this.eq_s_b$esjava$1("e")) {
                                            break lab5;
                                        }
                                        this.cursor = this.limit - v_5;
                                        break lab4;
                                    } while (false);
                                    this.cursor = this.limit - v_6;
                                }
                                if (!this.r_R2$esjava$0()) {
                                    this.cursor = this.limit - v_5;
                                    break lab4;
                                }
                                this.slice_del$esjava$0();
                            } while (false);
                            break;
                        case 2:
                            {
                                v_7 = this.limit - this.cursor;
                                lab6: do {
                                    if (!this.eq_s_b$esjava$1("e")) {
                                        break lab6;
                                    }
                                    break lab3;
                                } while (false);
                                this.cursor = this.limit - v_7;
                            }
                            this.slice_del$esjava$0();
                            break;
                        case 3:
                            this.slice_del$esjava$0();
                            v_8 = this.limit - this.cursor;
                            lab7: do {
                                this.ket = this.cursor;
                                lab8: do {
                                    v_9 = this.limit - this.cursor;
                                    lab9: do {
                                        if (!this.eq_s_b$esjava$1("er")) {
                                            break lab9;
                                        }
                                        break lab8;
                                    } while (false);
                                    this.cursor = this.limit - v_9;
                                    if (!this.eq_s_b$esjava$1("en")) {
                                        this.cursor = this.limit - v_8;
                                        break lab7;
                                    }
                                } while (false);
                                this.bra = this.cursor;
                                if (!this.r_R1$esjava$0()) {
                                    this.cursor = this.limit - v_8;
                                    break lab7;
                                }
                                this.slice_del$esjava$0();
                            } while (false);
                            break;
                        case 4:
                            this.slice_del$esjava$0();
                            v_10 = this.limit - this.cursor;
                            lab10: do {
                                this.ket = this.cursor;
                                among_var = this.find_among_b$esjava$1(germanStemmer.a_3);
                                if (among_var === 0) {
                                    this.cursor = this.limit - v_10;
                                    break lab10;
                                }
                                this.bra = this.cursor;
                                if (!this.r_R2$esjava$0()) {
                                    this.cursor = this.limit - v_10;
                                    break lab10;
                                }
                                switch (among_var) {
                                    case 0:
                                        this.cursor = this.limit - v_10;
                                        break lab10;
                                    case 1:
                                        this.slice_del$esjava$0();
                                        break;
                                }
                            } while (false);
                            break;
                    }
                } while (false);
                this.cursor = this.limit - v_4;
                return true;
            }
        }, {
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                v_1 = this.cursor;
                lab0: do {
                    if (!this.r_prelude$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = v_1;
                v_2 = this.cursor;
                lab1: do {
                    if (!this.r_mark_regions$esjava$0()) {
                        break lab1;
                    }
                } while (false);
                this.cursor = v_2;
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                v_3 = this.limit - this.cursor;
                lab2: do {
                    if (!this.r_standard_suffix$esjava$0()) {
                        break lab2;
                    }
                } while (false);
                this.cursor = this.limit - v_3;
                this.cursor = this.limit_backward;
                v_4 = this.cursor;
                lab3: do {
                    if (!this.r_postlude$esjava$0()) {
                        break lab3;
                    }
                } while (false);
                this.cursor = v_4;
                return true;
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get37;

                for (var _len36 = arguments.length, args = Array(_len36), _key36 = 0; _key36 < _len36; _key36++) {
                    args[_key36] = arguments[_key36];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get37 = _get(Object.getPrototypeOf(germanStemmer.prototype), 'stem', this)).call.apply(_get37, [this].concat(args));
            }
        }, {
            key: 'I_x',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_x') ? this._$esjava$I_x : this._$esjava$I_x = 0;
            },
            set: function set(v) {
                this._$esjava$I_x = v;
            }
        }, {
            key: 'I_p2',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p2') ? this._$esjava$I_p2 : this._$esjava$I_p2 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p2 = v;
            }
        }, {
            key: 'I_p1',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p1') ? this._$esjava$I_p1 : this._$esjava$I_p1 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p1 = v;
            }
        }], [{
            key: 'a_0',
            get: function get() {
                delete germanStemmer.a_0;
                return germanStemmer.a_0 = [new Among("", -1, 6), new Among("U", 0, 2), new Among("Y", 0, 1), new Among('\u00E4', 0, 3), new Among('\u00F6', 0, 4), new Among('\u00FC', 0, 5)];
            }
        }, {
            key: 'a_1',
            get: function get() {
                delete germanStemmer.a_1;
                return germanStemmer.a_1 = [new Among("e", -1, 2), new Among("em", -1, 1), new Among("en", -1, 2), new Among("ern", -1, 1), new Among("er", -1, 1), new Among("s", -1, 3), new Among("es", 5, 2)];
            }
        }, {
            key: 'a_2',
            get: function get() {
                delete germanStemmer.a_2;
                return germanStemmer.a_2 = [new Among("en", -1, 1), new Among("er", -1, 1), new Among("st", -1, 2), new Among("est", 2, 1)];
            }
        }, {
            key: 'a_3',
            get: function get() {
                delete germanStemmer.a_3;
                return germanStemmer.a_3 = [new Among("ig", -1, 1), new Among("lich", -1, 1)];
            }
        }, {
            key: 'a_4',
            get: function get() {
                delete germanStemmer.a_4;
                return germanStemmer.a_4 = [new Among("end", -1, 1), new Among("ig", -1, 2), new Among("ung", -1, 1), new Among("lich", -1, 3), new Among("isch", -1, 2), new Among("ik", -1, 2), new Among("heit", -1, 3), new Among("keit", -1, 4)];
            }
        }, {
            key: 'g_v',
            get: function get() {
                delete germanStemmer.g_v;
                return germanStemmer.g_v = [17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 32, 8];
            }
        }, {
            key: 'g_s_ending',
            get: function get() {
                delete germanStemmer.g_s_ending;
                return germanStemmer.g_s_ending = [117, 30, 5];
            }
        }, {
            key: 'g_st_ending',
            get: function get() {
                delete germanStemmer.g_st_ending;
                return germanStemmer.g_st_ending = [117, 30, 4];
            }
        }]);

        return germanStemmer;
    }(SnowballStemmer);

    var hungarianStemmer = function (_SnowballStemmer12) {
        _inherits(hungarianStemmer, _SnowballStemmer12);

        function hungarianStemmer() {
            _classCallCheck(this, hungarianStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(hungarianStemmer).apply(this, arguments));
        }

        _createClass(hungarianStemmer, [{
            key: 'r_mark_regions$esjava$0',
            value: function r_mark_regions$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                this.I_p1 = this.limit;
                lab0: do {
                    v_1 = this.cursor;
                    lab1: do {
                        if (!this.in_grouping$esjava$3(hungarianStemmer.g_v, 97, 369)) {
                            break lab1;
                        }
                        golab2: while (true) {
                            v_2 = this.cursor;
                            lab3: do {
                                if (!this.out_grouping$esjava$3(hungarianStemmer.g_v, 97, 369)) {
                                    break lab3;
                                }
                                this.cursor = v_2;
                                break golab2;
                            } while (false);
                            this.cursor = v_2;
                            if (this.cursor >= this.limit) {
                                break lab1;
                            }
                            this.cursor++;
                        }
                        lab4: do {
                            v_3 = this.cursor;
                            lab5: do {
                                if (this.find_among$esjava$1(hungarianStemmer.a_0) === 0) {
                                    break lab5;
                                }
                                break lab4;
                            } while (false);
                            this.cursor = v_3;
                            if (this.cursor >= this.limit) {
                                break lab1;
                            }
                            this.cursor++;
                        } while (false);
                        this.I_p1 = this.cursor;
                        break lab0;
                    } while (false);
                    this.cursor = v_1;
                    if (!this.out_grouping$esjava$3(hungarianStemmer.g_v, 97, 369)) {
                        return false;
                    }
                    golab6: while (true) {
                        lab7: do {
                            if (!this.in_grouping$esjava$3(hungarianStemmer.g_v, 97, 369)) {
                                break lab7;
                            }
                            break golab6;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            return false;
                        }
                        this.cursor++;
                    }
                    this.I_p1 = this.cursor;
                } while (false);
                return true;
            }
        }, {
            key: 'r_R1$esjava$0',
            value: function r_R1$esjava$0() {
                if (!(this.I_p1 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_v_ending$esjava$0',
            value: function r_v_ending$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(hungarianStemmer.a_1);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_R1$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_from$esjava$1("a");
                        break;
                    case 2:
                        this.slice_from$esjava$1("e");
                        break;
                }
                return true;
            }
        }, {
            key: 'r_double$esjava$0',
            value: function r_double$esjava$0() {
                var v_1 = void 0;
                v_1 = this.limit - this.cursor;
                if (this.find_among_b$esjava$1(hungarianStemmer.a_2) === 0) {
                    return false;
                }
                this.cursor = this.limit - v_1;
                return true;
            }
        }, {
            key: 'r_undouble$esjava$0',
            value: function r_undouble$esjava$0() {
                if (this.cursor <= this.limit_backward) {
                    return false;
                }
                this.cursor--;
                this.ket = this.cursor;
                {
                    var c = this.cursor - 1;
                    if (this.limit_backward > c || c > this.limit) {
                        return false;
                    }
                    this.cursor = c;
                }
                this.bra = this.cursor;
                this.slice_del$esjava$0();
                return true;
            }
        }, {
            key: 'r_instrum$esjava$0',
            value: function r_instrum$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(hungarianStemmer.a_3);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_R1$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!this.r_double$esjava$0()) {
                            return false;
                        }
                        break;
                    case 2:
                        if (!this.r_double$esjava$0()) {
                            return false;
                        }
                        break;
                }
                this.slice_del$esjava$0();
                if (!this.r_undouble$esjava$0()) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_case$esjava$0',
            value: function r_case$esjava$0() {
                this.ket = this.cursor;
                if (this.find_among_b$esjava$1(hungarianStemmer.a_4) === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_R1$esjava$0()) {
                    return false;
                }
                this.slice_del$esjava$0();
                if (!this.r_v_ending$esjava$0()) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_case_special$esjava$0',
            value: function r_case_special$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(hungarianStemmer.a_5);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_R1$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_from$esjava$1("e");
                        break;
                    case 2:
                        this.slice_from$esjava$1("a");
                        break;
                    case 3:
                        this.slice_from$esjava$1("a");
                        break;
                }
                return true;
            }
        }, {
            key: 'r_case_other$esjava$0',
            value: function r_case_other$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(hungarianStemmer.a_6);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_R1$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        this.slice_del$esjava$0();
                        break;
                    case 3:
                        this.slice_from$esjava$1("a");
                        break;
                    case 4:
                        this.slice_from$esjava$1("e");
                        break;
                }
                return true;
            }
        }, {
            key: 'r_factive$esjava$0',
            value: function r_factive$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(hungarianStemmer.a_7);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_R1$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!this.r_double$esjava$0()) {
                            return false;
                        }
                        break;
                    case 2:
                        if (!this.r_double$esjava$0()) {
                            return false;
                        }
                        break;
                }
                this.slice_del$esjava$0();
                if (!this.r_undouble$esjava$0()) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_plural$esjava$0',
            value: function r_plural$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(hungarianStemmer.a_8);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_R1$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_from$esjava$1("a");
                        break;
                    case 2:
                        this.slice_from$esjava$1("e");
                        break;
                    case 3:
                        this.slice_del$esjava$0();
                        break;
                    case 4:
                        this.slice_del$esjava$0();
                        break;
                    case 5:
                        this.slice_del$esjava$0();
                        break;
                    case 6:
                        this.slice_del$esjava$0();
                        break;
                    case 7:
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_owned$esjava$0',
            value: function r_owned$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(hungarianStemmer.a_9);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_R1$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        this.slice_from$esjava$1("e");
                        break;
                    case 3:
                        this.slice_from$esjava$1("a");
                        break;
                    case 4:
                        this.slice_del$esjava$0();
                        break;
                    case 5:
                        this.slice_from$esjava$1("e");
                        break;
                    case 6:
                        this.slice_from$esjava$1("a");
                        break;
                    case 7:
                        this.slice_del$esjava$0();
                        break;
                    case 8:
                        this.slice_from$esjava$1("e");
                        break;
                    case 9:
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_sing_owner$esjava$0',
            value: function r_sing_owner$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(hungarianStemmer.a_10);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_R1$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        this.slice_from$esjava$1("a");
                        break;
                    case 3:
                        this.slice_from$esjava$1("e");
                        break;
                    case 4:
                        this.slice_del$esjava$0();
                        break;
                    case 5:
                        this.slice_from$esjava$1("a");
                        break;
                    case 6:
                        this.slice_from$esjava$1("e");
                        break;
                    case 7:
                        this.slice_del$esjava$0();
                        break;
                    case 8:
                        this.slice_del$esjava$0();
                        break;
                    case 9:
                        this.slice_del$esjava$0();
                        break;
                    case 10:
                        this.slice_from$esjava$1("a");
                        break;
                    case 11:
                        this.slice_from$esjava$1("e");
                        break;
                    case 12:
                        this.slice_del$esjava$0();
                        break;
                    case 13:
                        this.slice_del$esjava$0();
                        break;
                    case 14:
                        this.slice_from$esjava$1("a");
                        break;
                    case 15:
                        this.slice_from$esjava$1("e");
                        break;
                    case 16:
                        this.slice_del$esjava$0();
                        break;
                    case 17:
                        this.slice_del$esjava$0();
                        break;
                    case 18:
                        this.slice_del$esjava$0();
                        break;
                    case 19:
                        this.slice_from$esjava$1("a");
                        break;
                    case 20:
                        this.slice_from$esjava$1("e");
                        break;
                }
                return true;
            }
        }, {
            key: 'r_plur_owner$esjava$0',
            value: function r_plur_owner$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(hungarianStemmer.a_11);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_R1$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        this.slice_from$esjava$1("a");
                        break;
                    case 3:
                        this.slice_from$esjava$1("e");
                        break;
                    case 4:
                        this.slice_del$esjava$0();
                        break;
                    case 5:
                        this.slice_del$esjava$0();
                        break;
                    case 6:
                        this.slice_del$esjava$0();
                        break;
                    case 7:
                        this.slice_from$esjava$1("a");
                        break;
                    case 8:
                        this.slice_from$esjava$1("e");
                        break;
                    case 9:
                        this.slice_del$esjava$0();
                        break;
                    case 10:
                        this.slice_del$esjava$0();
                        break;
                    case 11:
                        this.slice_del$esjava$0();
                        break;
                    case 12:
                        this.slice_from$esjava$1("a");
                        break;
                    case 13:
                        this.slice_from$esjava$1("e");
                        break;
                    case 14:
                        this.slice_del$esjava$0();
                        break;
                    case 15:
                        this.slice_del$esjava$0();
                        break;
                    case 16:
                        this.slice_del$esjava$0();
                        break;
                    case 17:
                        this.slice_del$esjava$0();
                        break;
                    case 18:
                        this.slice_from$esjava$1("a");
                        break;
                    case 19:
                        this.slice_from$esjava$1("e");
                        break;
                    case 20:
                        this.slice_del$esjava$0();
                        break;
                    case 21:
                        this.slice_del$esjava$0();
                        break;
                    case 22:
                        this.slice_from$esjava$1("a");
                        break;
                    case 23:
                        this.slice_from$esjava$1("e");
                        break;
                    case 24:
                        this.slice_del$esjava$0();
                        break;
                    case 25:
                        this.slice_del$esjava$0();
                        break;
                    case 26:
                        this.slice_del$esjava$0();
                        break;
                    case 27:
                        this.slice_from$esjava$1("a");
                        break;
                    case 28:
                        this.slice_from$esjava$1("e");
                        break;
                    case 29:
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                var v_8 = void 0;
                var v_9 = void 0;
                var v_10 = void 0;
                v_1 = this.cursor;
                lab0: do {
                    if (!this.r_mark_regions$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = v_1;
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                v_2 = this.limit - this.cursor;
                lab1: do {
                    if (!this.r_instrum$esjava$0()) {
                        break lab1;
                    }
                } while (false);
                this.cursor = this.limit - v_2;
                v_3 = this.limit - this.cursor;
                lab2: do {
                    if (!this.r_case$esjava$0()) {
                        break lab2;
                    }
                } while (false);
                this.cursor = this.limit - v_3;
                v_4 = this.limit - this.cursor;
                lab3: do {
                    if (!this.r_case_special$esjava$0()) {
                        break lab3;
                    }
                } while (false);
                this.cursor = this.limit - v_4;
                v_5 = this.limit - this.cursor;
                lab4: do {
                    if (!this.r_case_other$esjava$0()) {
                        break lab4;
                    }
                } while (false);
                this.cursor = this.limit - v_5;
                v_6 = this.limit - this.cursor;
                lab5: do {
                    if (!this.r_factive$esjava$0()) {
                        break lab5;
                    }
                } while (false);
                this.cursor = this.limit - v_6;
                v_7 = this.limit - this.cursor;
                lab6: do {
                    if (!this.r_owned$esjava$0()) {
                        break lab6;
                    }
                } while (false);
                this.cursor = this.limit - v_7;
                v_8 = this.limit - this.cursor;
                lab7: do {
                    if (!this.r_sing_owner$esjava$0()) {
                        break lab7;
                    }
                } while (false);
                this.cursor = this.limit - v_8;
                v_9 = this.limit - this.cursor;
                lab8: do {
                    if (!this.r_plur_owner$esjava$0()) {
                        break lab8;
                    }
                } while (false);
                this.cursor = this.limit - v_9;
                v_10 = this.limit - this.cursor;
                lab9: do {
                    if (!this.r_plural$esjava$0()) {
                        break lab9;
                    }
                } while (false);
                this.cursor = this.limit - v_10;
                this.cursor = this.limit_backward;
                return true;
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get38;

                for (var _len37 = arguments.length, args = Array(_len37), _key37 = 0; _key37 < _len37; _key37++) {
                    args[_key37] = arguments[_key37];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get38 = _get(Object.getPrototypeOf(hungarianStemmer.prototype), 'stem', this)).call.apply(_get38, [this].concat(args));
            }
        }, {
            key: 'I_p1',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p1') ? this._$esjava$I_p1 : this._$esjava$I_p1 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p1 = v;
            }
        }], [{
            key: 'a_0',
            get: function get() {
                delete hungarianStemmer.a_0;
                return hungarianStemmer.a_0 = [new Among("cs", -1, -1), new Among("dzs", -1, -1), new Among("gy", -1, -1), new Among("ly", -1, -1), new Among("ny", -1, -1), new Among("sz", -1, -1), new Among("ty", -1, -1), new Among("zs", -1, -1)];
            }
        }, {
            key: 'a_1',
            get: function get() {
                delete hungarianStemmer.a_1;
                return hungarianStemmer.a_1 = [new Among('\u00E1', -1, 1), new Among('\u00E9', -1, 2)];
            }
        }, {
            key: 'a_2',
            get: function get() {
                delete hungarianStemmer.a_2;
                return hungarianStemmer.a_2 = [new Among("bb", -1, -1), new Among("cc", -1, -1), new Among("dd", -1, -1), new Among("ff", -1, -1), new Among("gg", -1, -1), new Among("jj", -1, -1), new Among("kk", -1, -1), new Among("ll", -1, -1), new Among("mm", -1, -1), new Among("nn", -1, -1), new Among("pp", -1, -1), new Among("rr", -1, -1), new Among("ccs", -1, -1), new Among("ss", -1, -1), new Among("zzs", -1, -1), new Among("tt", -1, -1), new Among("vv", -1, -1), new Among("ggy", -1, -1), new Among("lly", -1, -1), new Among("nny", -1, -1), new Among("tty", -1, -1), new Among("ssz", -1, -1), new Among("zz", -1, -1)];
            }
        }, {
            key: 'a_3',
            get: function get() {
                delete hungarianStemmer.a_3;
                return hungarianStemmer.a_3 = [new Among("al", -1, 1), new Among("el", -1, 2)];
            }
        }, {
            key: 'a_4',
            get: function get() {
                delete hungarianStemmer.a_4;
                return hungarianStemmer.a_4 = [new Among("ba", -1, -1), new Among("ra", -1, -1), new Among("be", -1, -1), new Among("re", -1, -1), new Among("ig", -1, -1), new Among("nak", -1, -1), new Among("nek", -1, -1), new Among("val", -1, -1), new Among("vel", -1, -1), new Among("ul", -1, -1), new Among('n\u00E1l', -1, -1), new Among('n\u00E9l', -1, -1), new Among('b\u00F3l', -1, -1), new Among('r\u00F3l', -1, -1), new Among('t\u00F3l', -1, -1), new Among('\u00FCl', -1, -1), new Among('b\u0151l', -1, -1), new Among('r\u0151l', -1, -1), new Among('t\u0151l', -1, -1), new Among("n", -1, -1), new Among("an", 19, -1), new Among("ban", 20, -1), new Among("en", 19, -1), new Among("ben", 22, -1), new Among('k\u00E9ppen', 22, -1), new Among("on", 19, -1), new Among('\u00F6n', 19, -1), new Among('k\u00E9pp', -1, -1), new Among("kor", -1, -1), new Among("t", -1, -1), new Among("at", 29, -1), new Among("et", 29, -1), new Among('k\u00E9nt', 29, -1), new Among('ank\u00E9nt', 32, -1), new Among('enk\u00E9nt', 32, -1), new Among('onk\u00E9nt', 32, -1), new Among("ot", 29, -1), new Among('\u00E9rt', 29, -1), new Among('\u00F6t', 29, -1), new Among("hez", -1, -1), new Among("hoz", -1, -1), new Among('h\u00F6z', -1, -1), new Among('v\u00E1', -1, -1), new Among('v\u00E9', -1, -1)];
            }
        }, {
            key: 'a_5',
            get: function get() {
                delete hungarianStemmer.a_5;
                return hungarianStemmer.a_5 = [new Among('\u00E1n', -1, 2), new Among('\u00E9n', -1, 1), new Among('\u00E1nk\u00E9nt', -1, 3)];
            }
        }, {
            key: 'a_6',
            get: function get() {
                delete hungarianStemmer.a_6;
                return hungarianStemmer.a_6 = [new Among("stul", -1, 2), new Among("astul", 0, 1), new Among('\u00E1stul', 0, 3), new Among('st\u00FCl', -1, 2), new Among('est\u00FCl', 3, 1), new Among('\u00E9st\u00FCl', 3, 4)];
            }
        }, {
            key: 'a_7',
            get: function get() {
                delete hungarianStemmer.a_7;
                return hungarianStemmer.a_7 = [new Among('\u00E1', -1, 1), new Among('\u00E9', -1, 2)];
            }
        }, {
            key: 'a_8',
            get: function get() {
                delete hungarianStemmer.a_8;
                return hungarianStemmer.a_8 = [new Among("k", -1, 7), new Among("ak", 0, 4), new Among("ek", 0, 6), new Among("ok", 0, 5), new Among('\u00E1k', 0, 1), new Among('\u00E9k', 0, 2), new Among('\u00F6k', 0, 3)];
            }
        }, {
            key: 'a_9',
            get: function get() {
                delete hungarianStemmer.a_9;
                return hungarianStemmer.a_9 = [new Among('\u00E9i', -1, 7), new Among('\u00E1\u00E9i', 0, 6), new Among('\u00E9\u00E9i', 0, 5), new Among('\u00E9', -1, 9), new Among('k\u00E9', 3, 4), new Among('ak\u00E9', 4, 1), new Among('ek\u00E9', 4, 1), new Among('ok\u00E9', 4, 1), new Among('\u00E1k\u00E9', 4, 3), new Among('\u00E9k\u00E9', 4, 2), new Among('\u00F6k\u00E9', 4, 1), new Among('\u00E9\u00E9', 3, 8)];
            }
        }, {
            key: 'a_10',
            get: function get() {
                delete hungarianStemmer.a_10;
                return hungarianStemmer.a_10 = [new Among("a", -1, 18), new Among("ja", 0, 17), new Among("d", -1, 16), new Among("ad", 2, 13), new Among("ed", 2, 13), new Among("od", 2, 13), new Among('\u00E1d', 2, 14), new Among('\u00E9d', 2, 15), new Among('\u00F6d', 2, 13), new Among("e", -1, 18), new Among("je", 9, 17), new Among("nk", -1, 4), new Among("unk", 11, 1), new Among('\u00E1nk', 11, 2), new Among('\u00E9nk', 11, 3), new Among('\u00FCnk', 11, 1), new Among("uk", -1, 8), new Among("juk", 16, 7), new Among('\u00E1juk', 17, 5), new Among('\u00FCk', -1, 8), new Among('j\u00FCk', 19, 7), new Among('\u00E9j\u00FCk', 20, 6), new Among("m", -1, 12), new Among("am", 22, 9), new Among("em", 22, 9), new Among("om", 22, 9), new Among('\u00E1m', 22, 10), new Among('\u00E9m', 22, 11), new Among("o", -1, 18), new Among('\u00E1', -1, 19), new Among('\u00E9', -1, 20)];
            }
        }, {
            key: 'a_11',
            get: function get() {
                delete hungarianStemmer.a_11;
                return hungarianStemmer.a_11 = [new Among("id", -1, 10), new Among("aid", 0, 9), new Among("jaid", 1, 6), new Among("eid", 0, 9), new Among("jeid", 3, 6), new Among('\u00E1id', 0, 7), new Among('\u00E9id', 0, 8), new Among("i", -1, 15), new Among("ai", 7, 14), new Among("jai", 8, 11), new Among("ei", 7, 14), new Among("jei", 10, 11), new Among('\u00E1i', 7, 12), new Among('\u00E9i', 7, 13), new Among("itek", -1, 24), new Among("eitek", 14, 21), new Among("jeitek", 15, 20), new Among('\u00E9itek', 14, 23), new Among("ik", -1, 29), new Among("aik", 18, 26), new Among("jaik", 19, 25), new Among("eik", 18, 26), new Among("jeik", 21, 25), new Among('\u00E1ik', 18, 27), new Among('\u00E9ik', 18, 28), new Among("ink", -1, 20), new Among("aink", 25, 17), new Among("jaink", 26, 16), new Among("eink", 25, 17), new Among("jeink", 28, 16), new Among('\u00E1ink', 25, 18), new Among('\u00E9ink', 25, 19), new Among("aitok", -1, 21), new Among("jaitok", 32, 20), new Among('\u00E1itok', -1, 22), new Among("im", -1, 5), new Among("aim", 35, 4), new Among("jaim", 36, 1), new Among("eim", 35, 4), new Among("jeim", 38, 1), new Among('\u00E1im', 35, 2), new Among('\u00E9im', 35, 3)];
            }
        }, {
            key: 'g_v',
            get: function get() {
                delete hungarianStemmer.g_v;
                return hungarianStemmer.g_v = [17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 17, 36, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1];
            }
        }]);

        return hungarianStemmer;
    }(SnowballStemmer);

    var irishStemmer = function (_SnowballStemmer13) {
        _inherits(irishStemmer, _SnowballStemmer13);

        function irishStemmer() {
            _classCallCheck(this, irishStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(irishStemmer).apply(this, arguments));
        }

        _createClass(irishStemmer, [{
            key: 'r_mark_regions$esjava$0',
            value: function r_mark_regions$esjava$0() {
                var v_1 = void 0;
                var v_3 = void 0;
                this.I_pV = this.limit;
                this.I_p1 = this.limit;
                this.I_p2 = this.limit;
                v_1 = this.cursor;
                lab0: do {
                    golab1: while (true) {
                        lab2: do {
                            if (!this.in_grouping$esjava$3(irishStemmer.g_v, 97, 250)) {
                                break lab2;
                            }
                            break golab1;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab0;
                        }
                        this.cursor++;
                    }
                    this.I_pV = this.cursor;
                } while (false);
                this.cursor = v_1;
                v_3 = this.cursor;
                lab3: do {
                    golab4: while (true) {
                        lab5: do {
                            if (!this.in_grouping$esjava$3(irishStemmer.g_v, 97, 250)) {
                                break lab5;
                            }
                            break golab4;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab3;
                        }
                        this.cursor++;
                    }
                    golab6: while (true) {
                        lab7: do {
                            if (!this.out_grouping$esjava$3(irishStemmer.g_v, 97, 250)) {
                                break lab7;
                            }
                            break golab6;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab3;
                        }
                        this.cursor++;
                    }
                    this.I_p1 = this.cursor;
                    golab8: while (true) {
                        lab9: do {
                            if (!this.in_grouping$esjava$3(irishStemmer.g_v, 97, 250)) {
                                break lab9;
                            }
                            break golab8;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab3;
                        }
                        this.cursor++;
                    }
                    golab10: while (true) {
                        lab11: do {
                            if (!this.out_grouping$esjava$3(irishStemmer.g_v, 97, 250)) {
                                break lab11;
                            }
                            break golab10;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab3;
                        }
                        this.cursor++;
                    }
                    this.I_p2 = this.cursor;
                } while (false);
                this.cursor = v_3;
                return true;
            }
        }, {
            key: 'r_initial_morph$esjava$0',
            value: function r_initial_morph$esjava$0() {
                var among_var = void 0;
                this.bra = this.cursor;
                among_var = this.find_among$esjava$1(irishStemmer.a_0);
                if (among_var === 0) {
                    return false;
                }
                this.ket = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        this.slice_del$esjava$0();
                        break;
                    case 3:
                        this.slice_from$esjava$1("f");
                        break;
                    case 4:
                        this.slice_del$esjava$0();
                        break;
                    case 5:
                        this.slice_from$esjava$1("s");
                        break;
                    case 6:
                        this.slice_from$esjava$1("b");
                        break;
                    case 7:
                        this.slice_from$esjava$1("c");
                        break;
                    case 8:
                        this.slice_from$esjava$1("d");
                        break;
                    case 9:
                        this.slice_from$esjava$1("f");
                        break;
                    case 10:
                        this.slice_from$esjava$1("g");
                        break;
                    case 11:
                        this.slice_from$esjava$1("p");
                        break;
                    case 12:
                        this.slice_from$esjava$1("s");
                        break;
                    case 13:
                        this.slice_from$esjava$1("t");
                        break;
                    case 14:
                        this.slice_from$esjava$1("b");
                        break;
                    case 15:
                        this.slice_from$esjava$1("c");
                        break;
                    case 16:
                        this.slice_from$esjava$1("d");
                        break;
                    case 17:
                        this.slice_from$esjava$1("f");
                        break;
                    case 18:
                        this.slice_from$esjava$1("g");
                        break;
                    case 19:
                        this.slice_from$esjava$1("m");
                        break;
                    case 20:
                        this.slice_from$esjava$1("p");
                        break;
                    case 21:
                        this.slice_from$esjava$1("t");
                        break;
                }
                return true;
            }
        }, {
            key: 'r_RV$esjava$0',
            value: function r_RV$esjava$0() {
                if (!(this.I_pV <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_R1$esjava$0',
            value: function r_R1$esjava$0() {
                if (!(this.I_p1 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_R2$esjava$0',
            value: function r_R2$esjava$0() {
                if (!(this.I_p2 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_noun_sfx$esjava$0',
            value: function r_noun_sfx$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(irishStemmer.a_1);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!this.r_R1$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_deriv$esjava$0',
            value: function r_deriv$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(irishStemmer.a_2);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        this.slice_from$esjava$1("arc");
                        break;
                    case 3:
                        this.slice_from$esjava$1("gin");
                        break;
                    case 4:
                        this.slice_from$esjava$1("graf");
                        break;
                    case 5:
                        this.slice_from$esjava$1("paite");
                        break;
                    case 6:
                        this.slice_from$esjava$1('\u00F3id');
                        break;
                }
                return true;
            }
        }, {
            key: 'r_verb_sfx$esjava$0',
            value: function r_verb_sfx$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(irishStemmer.a_3);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!this.r_RV$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!this.r_R1$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                v_1 = this.cursor;
                lab0: do {
                    if (!this.r_initial_morph$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = v_1;
                v_2 = this.cursor;
                lab1: do {
                    if (!this.r_mark_regions$esjava$0()) {
                        break lab1;
                    }
                } while (false);
                this.cursor = v_2;
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                v_3 = this.limit - this.cursor;
                lab2: do {
                    if (!this.r_noun_sfx$esjava$0()) {
                        break lab2;
                    }
                } while (false);
                this.cursor = this.limit - v_3;
                v_4 = this.limit - this.cursor;
                lab3: do {
                    if (!this.r_deriv$esjava$0()) {
                        break lab3;
                    }
                } while (false);
                this.cursor = this.limit - v_4;
                v_5 = this.limit - this.cursor;
                lab4: do {
                    if (!this.r_verb_sfx$esjava$0()) {
                        break lab4;
                    }
                } while (false);
                this.cursor = this.limit - v_5;
                this.cursor = this.limit_backward;
                return true;
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get39;

                for (var _len38 = arguments.length, args = Array(_len38), _key38 = 0; _key38 < _len38; _key38++) {
                    args[_key38] = arguments[_key38];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get39 = _get(Object.getPrototypeOf(irishStemmer.prototype), 'stem', this)).call.apply(_get39, [this].concat(args));
            }
        }, {
            key: 'I_p2',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p2') ? this._$esjava$I_p2 : this._$esjava$I_p2 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p2 = v;
            }
        }, {
            key: 'I_p1',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p1') ? this._$esjava$I_p1 : this._$esjava$I_p1 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p1 = v;
            }
        }, {
            key: 'I_pV',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_pV') ? this._$esjava$I_pV : this._$esjava$I_pV = 0;
            },
            set: function set(v) {
                this._$esjava$I_pV = v;
            }
        }], [{
            key: 'a_0',
            get: function get() {
                delete irishStemmer.a_0;
                return irishStemmer.a_0 = [new Among("b'", -1, 4), new Among("bh", -1, 14), new Among("bhf", 1, 9), new Among("bp", -1, 11), new Among("ch", -1, 15), new Among("d'", -1, 2), new Among("d'fh", 5, 3), new Among("dh", -1, 16), new Among("dt", -1, 13), new Among("fh", -1, 17), new Among("gc", -1, 7), new Among("gh", -1, 18), new Among("h-", -1, 1), new Among("m'", -1, 4), new Among("mb", -1, 6), new Among("mh", -1, 19), new Among("n-", -1, 1), new Among("nd", -1, 8), new Among("ng", -1, 10), new Among("ph", -1, 20), new Among("sh", -1, 5), new Among("t-", -1, 1), new Among("th", -1, 21), new Among("ts", -1, 12)];
            }
        }, {
            key: 'a_1',
            get: function get() {
                delete irishStemmer.a_1;
                return irishStemmer.a_1 = [new Among('\u00EDochta', -1, 1), new Among('a\u00EDochta', 0, 1), new Among("ire", -1, 2), new Among("aire", 2, 2), new Among("abh", -1, 1), new Among("eabh", 4, 1), new Among("ibh", -1, 1), new Among("aibh", 6, 1), new Among("amh", -1, 1), new Among("eamh", 8, 1), new Among("imh", -1, 1), new Among("aimh", 10, 1), new Among('\u00EDocht', -1, 1), new Among('a\u00EDocht', 12, 1), new Among('ir\u00ED', -1, 2), new Among('air\u00ED', 14, 2)];
            }
        }, {
            key: 'a_2',
            get: function get() {
                delete irishStemmer.a_2;
                return irishStemmer.a_2 = [new Among('\u00F3ideacha', -1, 6), new Among("patacha", -1, 5), new Among("achta", -1, 1), new Among("arcachta", 2, 2), new Among("eachta", 2, 1), new Among('grafa\u00EDochta', -1, 4), new Among("paite", -1, 5), new Among("ach", -1, 1), new Among("each", 7, 1), new Among('\u00F3ideach', 8, 6), new Among("gineach", 8, 3), new Among("patach", 7, 5), new Among('grafa\u00EDoch', -1, 4), new Among("pataigh", -1, 5), new Among('\u00F3idigh', -1, 6), new Among('acht\u00FAil', -1, 1), new Among('eacht\u00FAil', 15, 1), new Among("gineas", -1, 3), new Among("ginis", -1, 3), new Among("acht", -1, 1), new Among("arcacht", 19, 2), new Among("eacht", 19, 1), new Among('grafa\u00EDocht', -1, 4), new Among('arcachta\u00ED', -1, 2), new Among('grafa\u00EDochta\u00ED', -1, 4)];
            }
        }, {
            key: 'a_3',
            get: function get() {
                delete irishStemmer.a_3;
                return irishStemmer.a_3 = [new Among("imid", -1, 1), new Among("aimid", 0, 1), new Among('\u00EDmid', -1, 1), new Among('a\u00EDmid', 2, 1), new Among("adh", -1, 2), new Among("eadh", 4, 2), new Among("faidh", -1, 1), new Among("fidh", -1, 1), new Among('\u00E1il', -1, 2), new Among("ain", -1, 2), new Among("tear", -1, 2), new Among("tar", -1, 2)];
            }
        }, {
            key: 'g_v',
            get: function get() {
                delete irishStemmer.g_v;
                return irishStemmer.g_v = [17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 17, 4, 2];
            }
        }]);

        return irishStemmer;
    }(SnowballStemmer);

    var italianStemmer = function (_SnowballStemmer14) {
        _inherits(italianStemmer, _SnowballStemmer14);

        function italianStemmer() {
            _classCallCheck(this, italianStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(italianStemmer).apply(this, arguments));
        }

        _createClass(italianStemmer, [{
            key: 'r_prelude$esjava$0',
            value: function r_prelude$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                v_1 = this.cursor;
                replab0: while (true) {
                    v_2 = this.cursor;
                    lab1: do {
                        this.bra = this.cursor;
                        among_var = this.find_among$esjava$1(italianStemmer.a_0);
                        if (among_var === 0) {
                            break lab1;
                        }
                        this.ket = this.cursor;
                        switch (among_var) {
                            case 0:
                                break lab1;
                            case 1:
                                this.slice_from$esjava$1('\u00E0');
                                break;
                            case 2:
                                this.slice_from$esjava$1('\u00E8');
                                break;
                            case 3:
                                this.slice_from$esjava$1('\u00EC');
                                break;
                            case 4:
                                this.slice_from$esjava$1('\u00F2');
                                break;
                            case 5:
                                this.slice_from$esjava$1('\u00F9');
                                break;
                            case 6:
                                this.slice_from$esjava$1("qU");
                                break;
                            case 7:
                                if (this.cursor >= this.limit) {
                                    break lab1;
                                }
                                this.cursor++;
                                break;
                        }
                        continue replab0;
                    } while (false);
                    this.cursor = v_2;
                    break replab0;
                }
                this.cursor = v_1;
                replab2: while (true) {
                    v_3 = this.cursor;
                    lab3: do {
                        golab4: while (true) {
                            v_4 = this.cursor;
                            lab5: do {
                                if (!this.in_grouping$esjava$3(italianStemmer.g_v, 97, 249)) {
                                    break lab5;
                                }
                                this.bra = this.cursor;
                                lab6: do {
                                    v_5 = this.cursor;
                                    lab7: do {
                                        if (!this.eq_s$esjava$1("u")) {
                                            break lab7;
                                        }
                                        this.ket = this.cursor;
                                        if (!this.in_grouping$esjava$3(italianStemmer.g_v, 97, 249)) {
                                            break lab7;
                                        }
                                        this.slice_from$esjava$1("U");
                                        break lab6;
                                    } while (false);
                                    this.cursor = v_5;
                                    if (!this.eq_s$esjava$1("i")) {
                                        break lab5;
                                    }
                                    this.ket = this.cursor;
                                    if (!this.in_grouping$esjava$3(italianStemmer.g_v, 97, 249)) {
                                        break lab5;
                                    }
                                    this.slice_from$esjava$1("I");
                                } while (false);
                                this.cursor = v_4;
                                break golab4;
                            } while (false);
                            this.cursor = v_4;
                            if (this.cursor >= this.limit) {
                                break lab3;
                            }
                            this.cursor++;
                        }
                        continue replab2;
                    } while (false);
                    this.cursor = v_3;
                    break replab2;
                }
                return true;
            }
        }, {
            key: 'r_mark_regions$esjava$0',
            value: function r_mark_regions$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_6 = void 0;
                var v_8 = void 0;
                this.I_pV = this.limit;
                this.I_p1 = this.limit;
                this.I_p2 = this.limit;
                v_1 = this.cursor;
                lab0: do {
                    lab1: do {
                        v_2 = this.cursor;
                        lab2: do {
                            if (!this.in_grouping$esjava$3(italianStemmer.g_v, 97, 249)) {
                                break lab2;
                            }
                            lab3: do {
                                v_3 = this.cursor;
                                lab4: do {
                                    if (!this.out_grouping$esjava$3(italianStemmer.g_v, 97, 249)) {
                                        break lab4;
                                    }
                                    golab5: while (true) {
                                        lab6: do {
                                            if (!this.in_grouping$esjava$3(italianStemmer.g_v, 97, 249)) {
                                                break lab6;
                                            }
                                            break golab5;
                                        } while (false);
                                        if (this.cursor >= this.limit) {
                                            break lab4;
                                        }
                                        this.cursor++;
                                    }
                                    break lab3;
                                } while (false);
                                this.cursor = v_3;
                                if (!this.in_grouping$esjava$3(italianStemmer.g_v, 97, 249)) {
                                    break lab2;
                                }
                                golab7: while (true) {
                                    lab8: do {
                                        if (!this.out_grouping$esjava$3(italianStemmer.g_v, 97, 249)) {
                                            break lab8;
                                        }
                                        break golab7;
                                    } while (false);
                                    if (this.cursor >= this.limit) {
                                        break lab2;
                                    }
                                    this.cursor++;
                                }
                            } while (false);
                            break lab1;
                        } while (false);
                        this.cursor = v_2;
                        if (!this.out_grouping$esjava$3(italianStemmer.g_v, 97, 249)) {
                            break lab0;
                        }
                        lab9: do {
                            v_6 = this.cursor;
                            lab10: do {
                                if (!this.out_grouping$esjava$3(italianStemmer.g_v, 97, 249)) {
                                    break lab10;
                                }
                                golab11: while (true) {
                                    lab12: do {
                                        if (!this.in_grouping$esjava$3(italianStemmer.g_v, 97, 249)) {
                                            break lab12;
                                        }
                                        break golab11;
                                    } while (false);
                                    if (this.cursor >= this.limit) {
                                        break lab10;
                                    }
                                    this.cursor++;
                                }
                                break lab9;
                            } while (false);
                            this.cursor = v_6;
                            if (!this.in_grouping$esjava$3(italianStemmer.g_v, 97, 249)) {
                                break lab0;
                            }
                            if (this.cursor >= this.limit) {
                                break lab0;
                            }
                            this.cursor++;
                        } while (false);
                    } while (false);
                    this.I_pV = this.cursor;
                } while (false);
                this.cursor = v_1;
                v_8 = this.cursor;
                lab13: do {
                    golab14: while (true) {
                        lab15: do {
                            if (!this.in_grouping$esjava$3(italianStemmer.g_v, 97, 249)) {
                                break lab15;
                            }
                            break golab14;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab13;
                        }
                        this.cursor++;
                    }
                    golab16: while (true) {
                        lab17: do {
                            if (!this.out_grouping$esjava$3(italianStemmer.g_v, 97, 249)) {
                                break lab17;
                            }
                            break golab16;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab13;
                        }
                        this.cursor++;
                    }
                    this.I_p1 = this.cursor;
                    golab18: while (true) {
                        lab19: do {
                            if (!this.in_grouping$esjava$3(italianStemmer.g_v, 97, 249)) {
                                break lab19;
                            }
                            break golab18;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab13;
                        }
                        this.cursor++;
                    }
                    golab20: while (true) {
                        lab21: do {
                            if (!this.out_grouping$esjava$3(italianStemmer.g_v, 97, 249)) {
                                break lab21;
                            }
                            break golab20;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab13;
                        }
                        this.cursor++;
                    }
                    this.I_p2 = this.cursor;
                } while (false);
                this.cursor = v_8;
                return true;
            }
        }, {
            key: 'r_postlude$esjava$0',
            value: function r_postlude$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                replab0: while (true) {
                    v_1 = this.cursor;
                    lab1: do {
                        this.bra = this.cursor;
                        among_var = this.find_among$esjava$1(italianStemmer.a_1);
                        if (among_var === 0) {
                            break lab1;
                        }
                        this.ket = this.cursor;
                        switch (among_var) {
                            case 0:
                                break lab1;
                            case 1:
                                this.slice_from$esjava$1("i");
                                break;
                            case 2:
                                this.slice_from$esjava$1("u");
                                break;
                            case 3:
                                if (this.cursor >= this.limit) {
                                    break lab1;
                                }
                                this.cursor++;
                                break;
                        }
                        continue replab0;
                    } while (false);
                    this.cursor = v_1;
                    break replab0;
                }
                return true;
            }
        }, {
            key: 'r_RV$esjava$0',
            value: function r_RV$esjava$0() {
                if (!(this.I_pV <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_R1$esjava$0',
            value: function r_R1$esjava$0() {
                if (!(this.I_p1 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_R2$esjava$0',
            value: function r_R2$esjava$0() {
                if (!(this.I_p2 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_attached_pronoun$esjava$0',
            value: function r_attached_pronoun$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                if (this.find_among_b$esjava$1(italianStemmer.a_2) === 0) {
                    return false;
                }
                this.bra = this.cursor;
                among_var = this.find_among_b$esjava$1(italianStemmer.a_3);
                if (among_var === 0) {
                    return false;
                }
                if (!this.r_RV$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        this.slice_from$esjava$1("e");
                        break;
                }
                return true;
            }
        }, {
            key: 'r_standard_suffix$esjava$0',
            value: function r_standard_suffix$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(italianStemmer.a_6);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        v_1 = this.limit - this.cursor;
                        lab0: do {
                            this.ket = this.cursor;
                            if (!this.eq_s_b$esjava$1("ic")) {
                                this.cursor = this.limit - v_1;
                                break lab0;
                            }
                            this.bra = this.cursor;
                            if (!this.r_R2$esjava$0()) {
                                this.cursor = this.limit - v_1;
                                break lab0;
                            }
                            this.slice_del$esjava$0();
                        } while (false);
                        break;
                    case 3:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_from$esjava$1("log");
                        break;
                    case 4:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_from$esjava$1("u");
                        break;
                    case 5:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_from$esjava$1("ente");
                        break;
                    case 6:
                        if (!this.r_RV$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 7:
                        if (!this.r_R1$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        v_2 = this.limit - this.cursor;
                        lab1: do {
                            this.ket = this.cursor;
                            among_var = this.find_among_b$esjava$1(italianStemmer.a_4);
                            if (among_var === 0) {
                                this.cursor = this.limit - v_2;
                                break lab1;
                            }
                            this.bra = this.cursor;
                            if (!this.r_R2$esjava$0()) {
                                this.cursor = this.limit - v_2;
                                break lab1;
                            }
                            this.slice_del$esjava$0();
                            switch (among_var) {
                                case 0:
                                    this.cursor = this.limit - v_2;
                                    break lab1;
                                case 1:
                                    this.ket = this.cursor;
                                    if (!this.eq_s_b$esjava$1("at")) {
                                        this.cursor = this.limit - v_2;
                                        break lab1;
                                    }
                                    this.bra = this.cursor;
                                    if (!this.r_R2$esjava$0()) {
                                        this.cursor = this.limit - v_2;
                                        break lab1;
                                    }
                                    this.slice_del$esjava$0();
                                    break;
                            }
                        } while (false);
                        break;
                    case 8:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        v_3 = this.limit - this.cursor;
                        lab2: do {
                            this.ket = this.cursor;
                            among_var = this.find_among_b$esjava$1(italianStemmer.a_5);
                            if (among_var === 0) {
                                this.cursor = this.limit - v_3;
                                break lab2;
                            }
                            this.bra = this.cursor;
                            switch (among_var) {
                                case 0:
                                    this.cursor = this.limit - v_3;
                                    break lab2;
                                case 1:
                                    if (!this.r_R2$esjava$0()) {
                                        this.cursor = this.limit - v_3;
                                        break lab2;
                                    }
                                    this.slice_del$esjava$0();
                                    break;
                            }
                        } while (false);
                        break;
                    case 9:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        v_4 = this.limit - this.cursor;
                        lab3: do {
                            this.ket = this.cursor;
                            if (!this.eq_s_b$esjava$1("at")) {
                                this.cursor = this.limit - v_4;
                                break lab3;
                            }
                            this.bra = this.cursor;
                            if (!this.r_R2$esjava$0()) {
                                this.cursor = this.limit - v_4;
                                break lab3;
                            }
                            this.slice_del$esjava$0();
                            this.ket = this.cursor;
                            if (!this.eq_s_b$esjava$1("ic")) {
                                this.cursor = this.limit - v_4;
                                break lab3;
                            }
                            this.bra = this.cursor;
                            if (!this.r_R2$esjava$0()) {
                                this.cursor = this.limit - v_4;
                                break lab3;
                            }
                            this.slice_del$esjava$0();
                        } while (false);
                        break;
                }
                return true;
            }
        }, {
            key: 'r_verb_suffix$esjava$0',
            value: function r_verb_suffix$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                v_1 = this.limit - this.cursor;
                if (this.cursor < this.I_pV) {
                    return false;
                }
                this.cursor = this.I_pV;
                v_2 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_1;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(italianStemmer.a_7);
                if (among_var === 0) {
                    this.limit_backward = v_2;
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        this.limit_backward = v_2;
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                }
                this.limit_backward = v_2;
                return true;
            }
        }, {
            key: 'r_vowel_suffix$esjava$0',
            value: function r_vowel_suffix$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                v_1 = this.limit - this.cursor;
                lab0: do {
                    this.ket = this.cursor;
                    if (!this.in_grouping_b$esjava$3(italianStemmer.g_AEIO, 97, 242)) {
                        this.cursor = this.limit - v_1;
                        break lab0;
                    }
                    this.bra = this.cursor;
                    if (!this.r_RV$esjava$0()) {
                        this.cursor = this.limit - v_1;
                        break lab0;
                    }
                    this.slice_del$esjava$0();
                    this.ket = this.cursor;
                    if (!this.eq_s_b$esjava$1("i")) {
                        this.cursor = this.limit - v_1;
                        break lab0;
                    }
                    this.bra = this.cursor;
                    if (!this.r_RV$esjava$0()) {
                        this.cursor = this.limit - v_1;
                        break lab0;
                    }
                    this.slice_del$esjava$0();
                } while (false);
                v_2 = this.limit - this.cursor;
                lab1: do {
                    this.ket = this.cursor;
                    if (!this.eq_s_b$esjava$1("h")) {
                        this.cursor = this.limit - v_2;
                        break lab1;
                    }
                    this.bra = this.cursor;
                    if (!this.in_grouping_b$esjava$3(italianStemmer.g_CG, 99, 103)) {
                        this.cursor = this.limit - v_2;
                        break lab1;
                    }
                    if (!this.r_RV$esjava$0()) {
                        this.cursor = this.limit - v_2;
                        break lab1;
                    }
                    this.slice_del$esjava$0();
                } while (false);
                return true;
            }
        }, {
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                v_1 = this.cursor;
                lab0: do {
                    if (!this.r_prelude$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = v_1;
                v_2 = this.cursor;
                lab1: do {
                    if (!this.r_mark_regions$esjava$0()) {
                        break lab1;
                    }
                } while (false);
                this.cursor = v_2;
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                v_3 = this.limit - this.cursor;
                lab2: do {
                    if (!this.r_attached_pronoun$esjava$0()) {
                        break lab2;
                    }
                } while (false);
                this.cursor = this.limit - v_3;
                v_4 = this.limit - this.cursor;
                lab3: do {
                    lab4: do {
                        v_5 = this.limit - this.cursor;
                        lab5: do {
                            if (!this.r_standard_suffix$esjava$0()) {
                                break lab5;
                            }
                            break lab4;
                        } while (false);
                        this.cursor = this.limit - v_5;
                        if (!this.r_verb_suffix$esjava$0()) {
                            break lab3;
                        }
                    } while (false);
                } while (false);
                this.cursor = this.limit - v_4;
                v_6 = this.limit - this.cursor;
                lab6: do {
                    if (!this.r_vowel_suffix$esjava$0()) {
                        break lab6;
                    }
                } while (false);
                this.cursor = this.limit - v_6;
                this.cursor = this.limit_backward;
                v_7 = this.cursor;
                lab7: do {
                    if (!this.r_postlude$esjava$0()) {
                        break lab7;
                    }
                } while (false);
                this.cursor = v_7;
                return true;
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get40;

                for (var _len39 = arguments.length, args = Array(_len39), _key39 = 0; _key39 < _len39; _key39++) {
                    args[_key39] = arguments[_key39];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get40 = _get(Object.getPrototypeOf(italianStemmer.prototype), 'stem', this)).call.apply(_get40, [this].concat(args));
            }
        }, {
            key: 'I_p2',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p2') ? this._$esjava$I_p2 : this._$esjava$I_p2 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p2 = v;
            }
        }, {
            key: 'I_p1',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p1') ? this._$esjava$I_p1 : this._$esjava$I_p1 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p1 = v;
            }
        }, {
            key: 'I_pV',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_pV') ? this._$esjava$I_pV : this._$esjava$I_pV = 0;
            },
            set: function set(v) {
                this._$esjava$I_pV = v;
            }
        }], [{
            key: 'a_0',
            get: function get() {
                delete italianStemmer.a_0;
                return italianStemmer.a_0 = [new Among("", -1, 7), new Among("qu", 0, 6), new Among('\u00E1', 0, 1), new Among('\u00E9', 0, 2), new Among('\u00ED', 0, 3), new Among('\u00F3', 0, 4), new Among('\u00FA', 0, 5)];
            }
        }, {
            key: 'a_1',
            get: function get() {
                delete italianStemmer.a_1;
                return italianStemmer.a_1 = [new Among("", -1, 3), new Among("I", 0, 1), new Among("U", 0, 2)];
            }
        }, {
            key: 'a_2',
            get: function get() {
                delete italianStemmer.a_2;
                return italianStemmer.a_2 = [new Among("la", -1, -1), new Among("cela", 0, -1), new Among("gliela", 0, -1), new Among("mela", 0, -1), new Among("tela", 0, -1), new Among("vela", 0, -1), new Among("le", -1, -1), new Among("cele", 6, -1), new Among("gliele", 6, -1), new Among("mele", 6, -1), new Among("tele", 6, -1), new Among("vele", 6, -1), new Among("ne", -1, -1), new Among("cene", 12, -1), new Among("gliene", 12, -1), new Among("mene", 12, -1), new Among("sene", 12, -1), new Among("tene", 12, -1), new Among("vene", 12, -1), new Among("ci", -1, -1), new Among("li", -1, -1), new Among("celi", 20, -1), new Among("glieli", 20, -1), new Among("meli", 20, -1), new Among("teli", 20, -1), new Among("veli", 20, -1), new Among("gli", 20, -1), new Among("mi", -1, -1), new Among("si", -1, -1), new Among("ti", -1, -1), new Among("vi", -1, -1), new Among("lo", -1, -1), new Among("celo", 31, -1), new Among("glielo", 31, -1), new Among("melo", 31, -1), new Among("telo", 31, -1), new Among("velo", 31, -1)];
            }
        }, {
            key: 'a_3',
            get: function get() {
                delete italianStemmer.a_3;
                return italianStemmer.a_3 = [new Among("ando", -1, 1), new Among("endo", -1, 1), new Among("ar", -1, 2), new Among("er", -1, 2), new Among("ir", -1, 2)];
            }
        }, {
            key: 'a_4',
            get: function get() {
                delete italianStemmer.a_4;
                return italianStemmer.a_4 = [new Among("ic", -1, -1), new Among("abil", -1, -1), new Among("os", -1, -1), new Among("iv", -1, 1)];
            }
        }, {
            key: 'a_5',
            get: function get() {
                delete italianStemmer.a_5;
                return italianStemmer.a_5 = [new Among("ic", -1, 1), new Among("abil", -1, 1), new Among("iv", -1, 1)];
            }
        }, {
            key: 'a_6',
            get: function get() {
                delete italianStemmer.a_6;
                return italianStemmer.a_6 = [new Among("ica", -1, 1), new Among("logia", -1, 3), new Among("osa", -1, 1), new Among("ista", -1, 1), new Among("iva", -1, 9), new Among("anza", -1, 1), new Among("enza", -1, 5), new Among("ice", -1, 1), new Among("atrice", 7, 1), new Among("iche", -1, 1), new Among("logie", -1, 3), new Among("abile", -1, 1), new Among("ibile", -1, 1), new Among("usione", -1, 4), new Among("azione", -1, 2), new Among("uzione", -1, 4), new Among("atore", -1, 2), new Among("ose", -1, 1), new Among("ante", -1, 1), new Among("mente", -1, 1), new Among("amente", 19, 7), new Among("iste", -1, 1), new Among("ive", -1, 9), new Among("anze", -1, 1), new Among("enze", -1, 5), new Among("ici", -1, 1), new Among("atrici", 25, 1), new Among("ichi", -1, 1), new Among("abili", -1, 1), new Among("ibili", -1, 1), new Among("ismi", -1, 1), new Among("usioni", -1, 4), new Among("azioni", -1, 2), new Among("uzioni", -1, 4), new Among("atori", -1, 2), new Among("osi", -1, 1), new Among("anti", -1, 1), new Among("amenti", -1, 6), new Among("imenti", -1, 6), new Among("isti", -1, 1), new Among("ivi", -1, 9), new Among("ico", -1, 1), new Among("ismo", -1, 1), new Among("oso", -1, 1), new Among("amento", -1, 6), new Among("imento", -1, 6), new Among("ivo", -1, 9), new Among('it\u00E0', -1, 8), new Among('ist\u00E0', -1, 1), new Among('ist\u00E8', -1, 1), new Among('ist\u00EC', -1, 1)];
            }
        }, {
            key: 'a_7',
            get: function get() {
                delete italianStemmer.a_7;
                return italianStemmer.a_7 = [new Among("isca", -1, 1), new Among("enda", -1, 1), new Among("ata", -1, 1), new Among("ita", -1, 1), new Among("uta", -1, 1), new Among("ava", -1, 1), new Among("eva", -1, 1), new Among("iva", -1, 1), new Among("erebbe", -1, 1), new Among("irebbe", -1, 1), new Among("isce", -1, 1), new Among("ende", -1, 1), new Among("are", -1, 1), new Among("ere", -1, 1), new Among("ire", -1, 1), new Among("asse", -1, 1), new Among("ate", -1, 1), new Among("avate", 16, 1), new Among("evate", 16, 1), new Among("ivate", 16, 1), new Among("ete", -1, 1), new Among("erete", 20, 1), new Among("irete", 20, 1), new Among("ite", -1, 1), new Among("ereste", -1, 1), new Among("ireste", -1, 1), new Among("ute", -1, 1), new Among("erai", -1, 1), new Among("irai", -1, 1), new Among("isci", -1, 1), new Among("endi", -1, 1), new Among("erei", -1, 1), new Among("irei", -1, 1), new Among("assi", -1, 1), new Among("ati", -1, 1), new Among("iti", -1, 1), new Among("eresti", -1, 1), new Among("iresti", -1, 1), new Among("uti", -1, 1), new Among("avi", -1, 1), new Among("evi", -1, 1), new Among("ivi", -1, 1), new Among("isco", -1, 1), new Among("ando", -1, 1), new Among("endo", -1, 1), new Among("Yamo", -1, 1), new Among("iamo", -1, 1), new Among("avamo", -1, 1), new Among("evamo", -1, 1), new Among("ivamo", -1, 1), new Among("eremo", -1, 1), new Among("iremo", -1, 1), new Among("assimo", -1, 1), new Among("ammo", -1, 1), new Among("emmo", -1, 1), new Among("eremmo", 54, 1), new Among("iremmo", 54, 1), new Among("immo", -1, 1), new Among("ano", -1, 1), new Among("iscano", 58, 1), new Among("avano", 58, 1), new Among("evano", 58, 1), new Among("ivano", 58, 1), new Among("eranno", -1, 1), new Among("iranno", -1, 1), new Among("ono", -1, 1), new Among("iscono", 65, 1), new Among("arono", 65, 1), new Among("erono", 65, 1), new Among("irono", 65, 1), new Among("erebbero", -1, 1), new Among("irebbero", -1, 1), new Among("assero", -1, 1), new Among("essero", -1, 1), new Among("issero", -1, 1), new Among("ato", -1, 1), new Among("ito", -1, 1), new Among("uto", -1, 1), new Among("avo", -1, 1), new Among("evo", -1, 1), new Among("ivo", -1, 1), new Among("ar", -1, 1), new Among("ir", -1, 1), new Among('er\u00E0', -1, 1), new Among('ir\u00E0', -1, 1), new Among('er\u00F2', -1, 1), new Among('ir\u00F2', -1, 1)];
            }
        }, {
            key: 'g_v',
            get: function get() {
                delete italianStemmer.g_v;
                return italianStemmer.g_v = [17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128, 128, 8, 2, 1];
            }
        }, {
            key: 'g_AEIO',
            get: function get() {
                delete italianStemmer.g_AEIO;
                return italianStemmer.g_AEIO = [17, 65, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128, 128, 8, 2];
            }
        }, {
            key: 'g_CG',
            get: function get() {
                delete italianStemmer.g_CG;
                return italianStemmer.g_CG = [17];
            }
        }]);

        return italianStemmer;
    }(SnowballStemmer);

    var norwegianStemmer = function (_SnowballStemmer15) {
        _inherits(norwegianStemmer, _SnowballStemmer15);

        function norwegianStemmer() {
            _classCallCheck(this, norwegianStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(norwegianStemmer).apply(this, arguments));
        }

        _createClass(norwegianStemmer, [{
            key: 'r_mark_regions$esjava$0',
            value: function r_mark_regions$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                this.I_p1 = this.limit;
                v_1 = this.cursor;
                {
                    var c = this.cursor + 3;
                    if (0 > c || c > this.limit) {
                        return false;
                    }
                    this.cursor = c;
                }
                this.I_x = this.cursor;
                this.cursor = v_1;
                golab0: while (true) {
                    v_2 = this.cursor;
                    lab1: do {
                        if (!this.in_grouping$esjava$3(norwegianStemmer.g_v, 97, 248)) {
                            break lab1;
                        }
                        this.cursor = v_2;
                        break golab0;
                    } while (false);
                    this.cursor = v_2;
                    if (this.cursor >= this.limit) {
                        return false;
                    }
                    this.cursor++;
                }
                golab2: while (true) {
                    lab3: do {
                        if (!this.out_grouping$esjava$3(norwegianStemmer.g_v, 97, 248)) {
                            break lab3;
                        }
                        break golab2;
                    } while (false);
                    if (this.cursor >= this.limit) {
                        return false;
                    }
                    this.cursor++;
                }
                this.I_p1 = this.cursor;
                lab4: do {
                    if (!(this.I_p1 < this.I_x)) {
                        break lab4;
                    }
                    this.I_p1 = this.I_x;
                } while (false);
                return true;
            }
        }, {
            key: 'r_main_suffix$esjava$0',
            value: function r_main_suffix$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                v_1 = this.limit - this.cursor;
                if (this.cursor < this.I_p1) {
                    return false;
                }
                this.cursor = this.I_p1;
                v_2 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_1;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(norwegianStemmer.a_0);
                if (among_var === 0) {
                    this.limit_backward = v_2;
                    return false;
                }
                this.bra = this.cursor;
                this.limit_backward = v_2;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        lab0: do {
                            v_3 = this.limit - this.cursor;
                            lab1: do {
                                if (!this.in_grouping_b$esjava$3(norwegianStemmer.g_s_ending, 98, 122)) {
                                    break lab1;
                                }
                                break lab0;
                            } while (false);
                            this.cursor = this.limit - v_3;
                            if (!this.eq_s_b$esjava$1("k")) {
                                return false;
                            }
                            if (!this.out_grouping_b$esjava$3(norwegianStemmer.g_v, 97, 248)) {
                                return false;
                            }
                        } while (false);
                        this.slice_del$esjava$0();
                        break;
                    case 3:
                        this.slice_from$esjava$1("er");
                        break;
                }
                return true;
            }
        }, {
            key: 'r_consonant_pair$esjava$0',
            value: function r_consonant_pair$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                v_1 = this.limit - this.cursor;
                v_2 = this.limit - this.cursor;
                if (this.cursor < this.I_p1) {
                    return false;
                }
                this.cursor = this.I_p1;
                v_3 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_2;
                this.ket = this.cursor;
                if (this.find_among_b$esjava$1(norwegianStemmer.a_1) === 0) {
                    this.limit_backward = v_3;
                    return false;
                }
                this.bra = this.cursor;
                this.limit_backward = v_3;
                this.cursor = this.limit - v_1;
                if (this.cursor <= this.limit_backward) {
                    return false;
                }
                this.cursor--;
                this.bra = this.cursor;
                this.slice_del$esjava$0();
                return true;
            }
        }, {
            key: 'r_other_suffix$esjava$0',
            value: function r_other_suffix$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                v_1 = this.limit - this.cursor;
                if (this.cursor < this.I_p1) {
                    return false;
                }
                this.cursor = this.I_p1;
                v_2 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_1;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(norwegianStemmer.a_2);
                if (among_var === 0) {
                    this.limit_backward = v_2;
                    return false;
                }
                this.bra = this.cursor;
                this.limit_backward = v_2;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                v_1 = this.cursor;
                lab0: do {
                    if (!this.r_mark_regions$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = v_1;
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                v_2 = this.limit - this.cursor;
                lab1: do {
                    if (!this.r_main_suffix$esjava$0()) {
                        break lab1;
                    }
                } while (false);
                this.cursor = this.limit - v_2;
                v_3 = this.limit - this.cursor;
                lab2: do {
                    if (!this.r_consonant_pair$esjava$0()) {
                        break lab2;
                    }
                } while (false);
                this.cursor = this.limit - v_3;
                v_4 = this.limit - this.cursor;
                lab3: do {
                    if (!this.r_other_suffix$esjava$0()) {
                        break lab3;
                    }
                } while (false);
                this.cursor = this.limit - v_4;
                this.cursor = this.limit_backward;
                return true;
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get41;

                for (var _len40 = arguments.length, args = Array(_len40), _key40 = 0; _key40 < _len40; _key40++) {
                    args[_key40] = arguments[_key40];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get41 = _get(Object.getPrototypeOf(norwegianStemmer.prototype), 'stem', this)).call.apply(_get41, [this].concat(args));
            }
        }, {
            key: 'I_x',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_x') ? this._$esjava$I_x : this._$esjava$I_x = 0;
            },
            set: function set(v) {
                this._$esjava$I_x = v;
            }
        }, {
            key: 'I_p1',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p1') ? this._$esjava$I_p1 : this._$esjava$I_p1 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p1 = v;
            }
        }], [{
            key: 'a_0',
            get: function get() {
                delete norwegianStemmer.a_0;
                return norwegianStemmer.a_0 = [new Among("a", -1, 1), new Among("e", -1, 1), new Among("ede", 1, 1), new Among("ande", 1, 1), new Among("ende", 1, 1), new Among("ane", 1, 1), new Among("ene", 1, 1), new Among("hetene", 6, 1), new Among("erte", 1, 3), new Among("en", -1, 1), new Among("heten", 9, 1), new Among("ar", -1, 1), new Among("er", -1, 1), new Among("heter", 12, 1), new Among("s", -1, 2), new Among("as", 14, 1), new Among("es", 14, 1), new Among("edes", 16, 1), new Among("endes", 16, 1), new Among("enes", 16, 1), new Among("hetenes", 19, 1), new Among("ens", 14, 1), new Among("hetens", 21, 1), new Among("ers", 14, 1), new Among("ets", 14, 1), new Among("et", -1, 1), new Among("het", 25, 1), new Among("ert", -1, 3), new Among("ast", -1, 1)];
            }
        }, {
            key: 'a_1',
            get: function get() {
                delete norwegianStemmer.a_1;
                return norwegianStemmer.a_1 = [new Among("dt", -1, -1), new Among("vt", -1, -1)];
            }
        }, {
            key: 'a_2',
            get: function get() {
                delete norwegianStemmer.a_2;
                return norwegianStemmer.a_2 = [new Among("leg", -1, 1), new Among("eleg", 0, 1), new Among("ig", -1, 1), new Among("eig", 2, 1), new Among("lig", 2, 1), new Among("elig", 4, 1), new Among("els", -1, 1), new Among("lov", -1, 1), new Among("elov", 7, 1), new Among("slov", 7, 1), new Among("hetslov", 9, 1)];
            }
        }, {
            key: 'g_v',
            get: function get() {
                delete norwegianStemmer.g_v;
                return norwegianStemmer.g_v = [17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 128];
            }
        }, {
            key: 'g_s_ending',
            get: function get() {
                delete norwegianStemmer.g_s_ending;
                return norwegianStemmer.g_s_ending = [119, 125, 149, 1];
            }
        }]);

        return norwegianStemmer;
    }(SnowballStemmer);

    var porterStemmer = function (_SnowballStemmer16) {
        _inherits(porterStemmer, _SnowballStemmer16);

        function porterStemmer() {
            _classCallCheck(this, porterStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(porterStemmer).apply(this, arguments));
        }

        _createClass(porterStemmer, [{
            key: 'r_shortv$esjava$0',
            value: function r_shortv$esjava$0() {
                if (!this.out_grouping_b$esjava$3(porterStemmer.g_v_WXY, 89, 121)) {
                    return false;
                }
                if (!this.in_grouping_b$esjava$3(porterStemmer.g_v, 97, 121)) {
                    return false;
                }
                if (!this.out_grouping_b$esjava$3(porterStemmer.g_v, 97, 121)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_R1$esjava$0',
            value: function r_R1$esjava$0() {
                if (!(this.I_p1 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_R2$esjava$0',
            value: function r_R2$esjava$0() {
                if (!(this.I_p2 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_Step_1a$esjava$0',
            value: function r_Step_1a$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(porterStemmer.a_0);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_from$esjava$1("ss");
                        break;
                    case 2:
                        this.slice_from$esjava$1("i");
                        break;
                    case 3:
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Step_1b$esjava$0',
            value: function r_Step_1b$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(porterStemmer.a_2);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!this.r_R1$esjava$0()) {
                            return false;
                        }
                        this.slice_from$esjava$1("ee");
                        break;
                    case 2:
                        v_1 = this.limit - this.cursor;
                        golab0: while (true) {
                            lab1: do {
                                if (!this.in_grouping_b$esjava$3(porterStemmer.g_v, 97, 121)) {
                                    break lab1;
                                }
                                break golab0;
                            } while (false);
                            if (this.cursor <= this.limit_backward) {
                                return false;
                            }
                            this.cursor--;
                        }
                        this.cursor = this.limit - v_1;
                        this.slice_del$esjava$0();
                        v_3 = this.limit - this.cursor;
                        among_var = this.find_among_b$esjava$1(porterStemmer.a_1);
                        if (among_var === 0) {
                            return false;
                        }
                        this.cursor = this.limit - v_3;
                        switch (among_var) {
                            case 0:
                                return false;
                            case 1:
                                {
                                    var c = this.cursor;
                                    this.insert$esjava$3(this.cursor, this.cursor, "e");
                                    this.cursor = c;
                                }
                                break;
                            case 2:
                                this.ket = this.cursor;
                                if (this.cursor <= this.limit_backward) {
                                    return false;
                                }
                                this.cursor--;
                                this.bra = this.cursor;
                                this.slice_del$esjava$0();
                                break;
                            case 3:
                                if (this.cursor !== this.I_p1) {
                                    return false;
                                }
                                v_4 = this.limit - this.cursor;
                                if (!this.r_shortv$esjava$0()) {
                                    return false;
                                }
                                this.cursor = this.limit - v_4;
                                {
                                    var _c2 = this.cursor;
                                    this.insert$esjava$3(this.cursor, this.cursor, "e");
                                    this.cursor = _c2;
                                }
                                break;
                        }
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Step_1c$esjava$0',
            value: function r_Step_1c$esjava$0() {
                var v_1 = void 0;
                this.ket = this.cursor;
                lab0: do {
                    v_1 = this.limit - this.cursor;
                    lab1: do {
                        if (!this.eq_s_b$esjava$1("y")) {
                            break lab1;
                        }
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    if (!this.eq_s_b$esjava$1("Y")) {
                        return false;
                    }
                } while (false);
                this.bra = this.cursor;
                golab2: while (true) {
                    lab3: do {
                        if (!this.in_grouping_b$esjava$3(porterStemmer.g_v, 97, 121)) {
                            break lab3;
                        }
                        break golab2;
                    } while (false);
                    if (this.cursor <= this.limit_backward) {
                        return false;
                    }
                    this.cursor--;
                }
                this.slice_from$esjava$1("i");
                return true;
            }
        }, {
            key: 'r_Step_2$esjava$0',
            value: function r_Step_2$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(porterStemmer.a_3);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_R1$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_from$esjava$1("tion");
                        break;
                    case 2:
                        this.slice_from$esjava$1("ence");
                        break;
                    case 3:
                        this.slice_from$esjava$1("ance");
                        break;
                    case 4:
                        this.slice_from$esjava$1("able");
                        break;
                    case 5:
                        this.slice_from$esjava$1("ent");
                        break;
                    case 6:
                        this.slice_from$esjava$1("e");
                        break;
                    case 7:
                        this.slice_from$esjava$1("ize");
                        break;
                    case 8:
                        this.slice_from$esjava$1("ate");
                        break;
                    case 9:
                        this.slice_from$esjava$1("al");
                        break;
                    case 10:
                        this.slice_from$esjava$1("al");
                        break;
                    case 11:
                        this.slice_from$esjava$1("ful");
                        break;
                    case 12:
                        this.slice_from$esjava$1("ous");
                        break;
                    case 13:
                        this.slice_from$esjava$1("ive");
                        break;
                    case 14:
                        this.slice_from$esjava$1("ble");
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Step_3$esjava$0',
            value: function r_Step_3$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(porterStemmer.a_4);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_R1$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_from$esjava$1("al");
                        break;
                    case 2:
                        this.slice_from$esjava$1("ic");
                        break;
                    case 3:
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Step_4$esjava$0',
            value: function r_Step_4$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(porterStemmer.a_5);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_R2$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        lab0: do {
                            v_1 = this.limit - this.cursor;
                            lab1: do {
                                if (!this.eq_s_b$esjava$1("s")) {
                                    break lab1;
                                }
                                break lab0;
                            } while (false);
                            this.cursor = this.limit - v_1;
                            if (!this.eq_s_b$esjava$1("t")) {
                                return false;
                            }
                        } while (false);
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_Step_5a$esjava$0',
            value: function r_Step_5a$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                this.ket = this.cursor;
                if (!this.eq_s_b$esjava$1("e")) {
                    return false;
                }
                this.bra = this.cursor;
                lab0: do {
                    v_1 = this.limit - this.cursor;
                    lab1: do {
                        if (!this.r_R2$esjava$0()) {
                            break lab1;
                        }
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    if (!this.r_R1$esjava$0()) {
                        return false;
                    }
                    {
                        v_2 = this.limit - this.cursor;
                        lab2: do {
                            if (!this.r_shortv$esjava$0()) {
                                break lab2;
                            }
                            return false;
                        } while (false);
                        this.cursor = this.limit - v_2;
                    }
                } while (false);
                this.slice_del$esjava$0();
                return true;
            }
        }, {
            key: 'r_Step_5b$esjava$0',
            value: function r_Step_5b$esjava$0() {
                this.ket = this.cursor;
                if (!this.eq_s_b$esjava$1("l")) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_R2$esjava$0()) {
                    return false;
                }
                if (!this.eq_s_b$esjava$1("l")) {
                    return false;
                }
                this.slice_del$esjava$0();
                return true;
            }
        }, {
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_10 = void 0;
                var v_11 = void 0;
                var v_12 = void 0;
                var v_13 = void 0;
                var v_14 = void 0;
                var v_15 = void 0;
                var v_16 = void 0;
                var v_17 = void 0;
                var v_18 = void 0;
                var v_19 = void 0;
                var v_20 = void 0;
                this.B_Y_found = false;
                v_1 = this.cursor;
                lab0: do {
                    this.bra = this.cursor;
                    if (!this.eq_s$esjava$1("y")) {
                        break lab0;
                    }
                    this.ket = this.cursor;
                    this.slice_from$esjava$1("Y");
                    this.B_Y_found = true;
                } while (false);
                this.cursor = v_1;
                v_2 = this.cursor;
                lab1: do {
                    replab2: while (true) {
                        v_3 = this.cursor;
                        lab3: do {
                            golab4: while (true) {
                                v_4 = this.cursor;
                                lab5: do {
                                    if (!this.in_grouping$esjava$3(porterStemmer.g_v, 97, 121)) {
                                        break lab5;
                                    }
                                    this.bra = this.cursor;
                                    if (!this.eq_s$esjava$1("y")) {
                                        break lab5;
                                    }
                                    this.ket = this.cursor;
                                    this.cursor = v_4;
                                    break golab4;
                                } while (false);
                                this.cursor = v_4;
                                if (this.cursor >= this.limit) {
                                    break lab3;
                                }
                                this.cursor++;
                            }
                            this.slice_from$esjava$1("Y");
                            this.B_Y_found = true;
                            continue replab2;
                        } while (false);
                        this.cursor = v_3;
                        break replab2;
                    }
                } while (false);
                this.cursor = v_2;
                this.I_p1 = this.limit;
                this.I_p2 = this.limit;
                v_5 = this.cursor;
                lab6: do {
                    golab7: while (true) {
                        lab8: do {
                            if (!this.in_grouping$esjava$3(porterStemmer.g_v, 97, 121)) {
                                break lab8;
                            }
                            break golab7;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab6;
                        }
                        this.cursor++;
                    }
                    golab9: while (true) {
                        lab10: do {
                            if (!this.out_grouping$esjava$3(porterStemmer.g_v, 97, 121)) {
                                break lab10;
                            }
                            break golab9;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab6;
                        }
                        this.cursor++;
                    }
                    this.I_p1 = this.cursor;
                    golab11: while (true) {
                        lab12: do {
                            if (!this.in_grouping$esjava$3(porterStemmer.g_v, 97, 121)) {
                                break lab12;
                            }
                            break golab11;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab6;
                        }
                        this.cursor++;
                    }
                    golab13: while (true) {
                        lab14: do {
                            if (!this.out_grouping$esjava$3(porterStemmer.g_v, 97, 121)) {
                                break lab14;
                            }
                            break golab13;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab6;
                        }
                        this.cursor++;
                    }
                    this.I_p2 = this.cursor;
                } while (false);
                this.cursor = v_5;
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                v_10 = this.limit - this.cursor;
                lab15: do {
                    if (!this.r_Step_1a$esjava$0()) {
                        break lab15;
                    }
                } while (false);
                this.cursor = this.limit - v_10;
                v_11 = this.limit - this.cursor;
                lab16: do {
                    if (!this.r_Step_1b$esjava$0()) {
                        break lab16;
                    }
                } while (false);
                this.cursor = this.limit - v_11;
                v_12 = this.limit - this.cursor;
                lab17: do {
                    if (!this.r_Step_1c$esjava$0()) {
                        break lab17;
                    }
                } while (false);
                this.cursor = this.limit - v_12;
                v_13 = this.limit - this.cursor;
                lab18: do {
                    if (!this.r_Step_2$esjava$0()) {
                        break lab18;
                    }
                } while (false);
                this.cursor = this.limit - v_13;
                v_14 = this.limit - this.cursor;
                lab19: do {
                    if (!this.r_Step_3$esjava$0()) {
                        break lab19;
                    }
                } while (false);
                this.cursor = this.limit - v_14;
                v_15 = this.limit - this.cursor;
                lab20: do {
                    if (!this.r_Step_4$esjava$0()) {
                        break lab20;
                    }
                } while (false);
                this.cursor = this.limit - v_15;
                v_16 = this.limit - this.cursor;
                lab21: do {
                    if (!this.r_Step_5a$esjava$0()) {
                        break lab21;
                    }
                } while (false);
                this.cursor = this.limit - v_16;
                v_17 = this.limit - this.cursor;
                lab22: do {
                    if (!this.r_Step_5b$esjava$0()) {
                        break lab22;
                    }
                } while (false);
                this.cursor = this.limit - v_17;
                this.cursor = this.limit_backward;
                v_18 = this.cursor;
                lab23: do {
                    if (!this.B_Y_found) {
                        break lab23;
                    }
                    replab24: while (true) {
                        v_19 = this.cursor;
                        lab25: do {
                            golab26: while (true) {
                                v_20 = this.cursor;
                                lab27: do {
                                    this.bra = this.cursor;
                                    if (!this.eq_s$esjava$1("Y")) {
                                        break lab27;
                                    }
                                    this.ket = this.cursor;
                                    this.cursor = v_20;
                                    break golab26;
                                } while (false);
                                this.cursor = v_20;
                                if (this.cursor >= this.limit) {
                                    break lab25;
                                }
                                this.cursor++;
                            }
                            this.slice_from$esjava$1("y");
                            continue replab24;
                        } while (false);
                        this.cursor = v_19;
                        break replab24;
                    }
                } while (false);
                this.cursor = v_18;
                return true;
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get42;

                for (var _len41 = arguments.length, args = Array(_len41), _key41 = 0; _key41 < _len41; _key41++) {
                    args[_key41] = arguments[_key41];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get42 = _get(Object.getPrototypeOf(porterStemmer.prototype), 'stem', this)).call.apply(_get42, [this].concat(args));
            }
        }, {
            key: 'B_Y_found',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$B_Y_found') ? this._$esjava$B_Y_found : this._$esjava$B_Y_found = false;
            },
            set: function set(v) {
                this._$esjava$B_Y_found = v;
            }
        }, {
            key: 'I_p2',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p2') ? this._$esjava$I_p2 : this._$esjava$I_p2 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p2 = v;
            }
        }, {
            key: 'I_p1',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p1') ? this._$esjava$I_p1 : this._$esjava$I_p1 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p1 = v;
            }
        }], [{
            key: 'a_0',
            get: function get() {
                delete porterStemmer.a_0;
                return porterStemmer.a_0 = [new Among("s", -1, 3), new Among("ies", 0, 2), new Among("sses", 0, 1), new Among("ss", 0, -1)];
            }
        }, {
            key: 'a_1',
            get: function get() {
                delete porterStemmer.a_1;
                return porterStemmer.a_1 = [new Among("", -1, 3), new Among("bb", 0, 2), new Among("dd", 0, 2), new Among("ff", 0, 2), new Among("gg", 0, 2), new Among("bl", 0, 1), new Among("mm", 0, 2), new Among("nn", 0, 2), new Among("pp", 0, 2), new Among("rr", 0, 2), new Among("at", 0, 1), new Among("tt", 0, 2), new Among("iz", 0, 1)];
            }
        }, {
            key: 'a_2',
            get: function get() {
                delete porterStemmer.a_2;
                return porterStemmer.a_2 = [new Among("ed", -1, 2), new Among("eed", 0, 1), new Among("ing", -1, 2)];
            }
        }, {
            key: 'a_3',
            get: function get() {
                delete porterStemmer.a_3;
                return porterStemmer.a_3 = [new Among("anci", -1, 3), new Among("enci", -1, 2), new Among("abli", -1, 4), new Among("eli", -1, 6), new Among("alli", -1, 9), new Among("ousli", -1, 12), new Among("entli", -1, 5), new Among("aliti", -1, 10), new Among("biliti", -1, 14), new Among("iviti", -1, 13), new Among("tional", -1, 1), new Among("ational", 10, 8), new Among("alism", -1, 10), new Among("ation", -1, 8), new Among("ization", 13, 7), new Among("izer", -1, 7), new Among("ator", -1, 8), new Among("iveness", -1, 13), new Among("fulness", -1, 11), new Among("ousness", -1, 12)];
            }
        }, {
            key: 'a_4',
            get: function get() {
                delete porterStemmer.a_4;
                return porterStemmer.a_4 = [new Among("icate", -1, 2), new Among("ative", -1, 3), new Among("alize", -1, 1), new Among("iciti", -1, 2), new Among("ical", -1, 2), new Among("ful", -1, 3), new Among("ness", -1, 3)];
            }
        }, {
            key: 'a_5',
            get: function get() {
                delete porterStemmer.a_5;
                return porterStemmer.a_5 = [new Among("ic", -1, 1), new Among("ance", -1, 1), new Among("ence", -1, 1), new Among("able", -1, 1), new Among("ible", -1, 1), new Among("ate", -1, 1), new Among("ive", -1, 1), new Among("ize", -1, 1), new Among("iti", -1, 1), new Among("al", -1, 1), new Among("ism", -1, 1), new Among("ion", -1, 2), new Among("er", -1, 1), new Among("ous", -1, 1), new Among("ant", -1, 1), new Among("ent", -1, 1), new Among("ment", 15, 1), new Among("ement", 16, 1), new Among("ou", -1, 1)];
            }
        }, {
            key: 'g_v',
            get: function get() {
                delete porterStemmer.g_v;
                return porterStemmer.g_v = [17, 65, 16, 1];
            }
        }, {
            key: 'g_v_WXY',
            get: function get() {
                delete porterStemmer.g_v_WXY;
                return porterStemmer.g_v_WXY = [1, 17, 65, 208, 1];
            }
        }]);

        return porterStemmer;
    }(SnowballStemmer);

    var portugueseStemmer = function (_SnowballStemmer17) {
        _inherits(portugueseStemmer, _SnowballStemmer17);

        function portugueseStemmer() {
            _classCallCheck(this, portugueseStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(portugueseStemmer).apply(this, arguments));
        }

        _createClass(portugueseStemmer, [{
            key: 'r_prelude$esjava$0',
            value: function r_prelude$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                replab0: while (true) {
                    v_1 = this.cursor;
                    lab1: do {
                        this.bra = this.cursor;
                        among_var = this.find_among$esjava$1(portugueseStemmer.a_0);
                        if (among_var === 0) {
                            break lab1;
                        }
                        this.ket = this.cursor;
                        switch (among_var) {
                            case 0:
                                break lab1;
                            case 1:
                                this.slice_from$esjava$1("a~");
                                break;
                            case 2:
                                this.slice_from$esjava$1("o~");
                                break;
                            case 3:
                                if (this.cursor >= this.limit) {
                                    break lab1;
                                }
                                this.cursor++;
                                break;
                        }
                        continue replab0;
                    } while (false);
                    this.cursor = v_1;
                    break replab0;
                }
                return true;
            }
        }, {
            key: 'r_mark_regions$esjava$0',
            value: function r_mark_regions$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_6 = void 0;
                var v_8 = void 0;
                this.I_pV = this.limit;
                this.I_p1 = this.limit;
                this.I_p2 = this.limit;
                v_1 = this.cursor;
                lab0: do {
                    lab1: do {
                        v_2 = this.cursor;
                        lab2: do {
                            if (!this.in_grouping$esjava$3(portugueseStemmer.g_v, 97, 250)) {
                                break lab2;
                            }
                            lab3: do {
                                v_3 = this.cursor;
                                lab4: do {
                                    if (!this.out_grouping$esjava$3(portugueseStemmer.g_v, 97, 250)) {
                                        break lab4;
                                    }
                                    golab5: while (true) {
                                        lab6: do {
                                            if (!this.in_grouping$esjava$3(portugueseStemmer.g_v, 97, 250)) {
                                                break lab6;
                                            }
                                            break golab5;
                                        } while (false);
                                        if (this.cursor >= this.limit) {
                                            break lab4;
                                        }
                                        this.cursor++;
                                    }
                                    break lab3;
                                } while (false);
                                this.cursor = v_3;
                                if (!this.in_grouping$esjava$3(portugueseStemmer.g_v, 97, 250)) {
                                    break lab2;
                                }
                                golab7: while (true) {
                                    lab8: do {
                                        if (!this.out_grouping$esjava$3(portugueseStemmer.g_v, 97, 250)) {
                                            break lab8;
                                        }
                                        break golab7;
                                    } while (false);
                                    if (this.cursor >= this.limit) {
                                        break lab2;
                                    }
                                    this.cursor++;
                                }
                            } while (false);
                            break lab1;
                        } while (false);
                        this.cursor = v_2;
                        if (!this.out_grouping$esjava$3(portugueseStemmer.g_v, 97, 250)) {
                            break lab0;
                        }
                        lab9: do {
                            v_6 = this.cursor;
                            lab10: do {
                                if (!this.out_grouping$esjava$3(portugueseStemmer.g_v, 97, 250)) {
                                    break lab10;
                                }
                                golab11: while (true) {
                                    lab12: do {
                                        if (!this.in_grouping$esjava$3(portugueseStemmer.g_v, 97, 250)) {
                                            break lab12;
                                        }
                                        break golab11;
                                    } while (false);
                                    if (this.cursor >= this.limit) {
                                        break lab10;
                                    }
                                    this.cursor++;
                                }
                                break lab9;
                            } while (false);
                            this.cursor = v_6;
                            if (!this.in_grouping$esjava$3(portugueseStemmer.g_v, 97, 250)) {
                                break lab0;
                            }
                            if (this.cursor >= this.limit) {
                                break lab0;
                            }
                            this.cursor++;
                        } while (false);
                    } while (false);
                    this.I_pV = this.cursor;
                } while (false);
                this.cursor = v_1;
                v_8 = this.cursor;
                lab13: do {
                    golab14: while (true) {
                        lab15: do {
                            if (!this.in_grouping$esjava$3(portugueseStemmer.g_v, 97, 250)) {
                                break lab15;
                            }
                            break golab14;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab13;
                        }
                        this.cursor++;
                    }
                    golab16: while (true) {
                        lab17: do {
                            if (!this.out_grouping$esjava$3(portugueseStemmer.g_v, 97, 250)) {
                                break lab17;
                            }
                            break golab16;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab13;
                        }
                        this.cursor++;
                    }
                    this.I_p1 = this.cursor;
                    golab18: while (true) {
                        lab19: do {
                            if (!this.in_grouping$esjava$3(portugueseStemmer.g_v, 97, 250)) {
                                break lab19;
                            }
                            break golab18;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab13;
                        }
                        this.cursor++;
                    }
                    golab20: while (true) {
                        lab21: do {
                            if (!this.out_grouping$esjava$3(portugueseStemmer.g_v, 97, 250)) {
                                break lab21;
                            }
                            break golab20;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab13;
                        }
                        this.cursor++;
                    }
                    this.I_p2 = this.cursor;
                } while (false);
                this.cursor = v_8;
                return true;
            }
        }, {
            key: 'r_postlude$esjava$0',
            value: function r_postlude$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                replab0: while (true) {
                    v_1 = this.cursor;
                    lab1: do {
                        this.bra = this.cursor;
                        among_var = this.find_among$esjava$1(portugueseStemmer.a_1);
                        if (among_var === 0) {
                            break lab1;
                        }
                        this.ket = this.cursor;
                        switch (among_var) {
                            case 0:
                                break lab1;
                            case 1:
                                this.slice_from$esjava$1('\u00E3');
                                break;
                            case 2:
                                this.slice_from$esjava$1('\u00F5');
                                break;
                            case 3:
                                if (this.cursor >= this.limit) {
                                    break lab1;
                                }
                                this.cursor++;
                                break;
                        }
                        continue replab0;
                    } while (false);
                    this.cursor = v_1;
                    break replab0;
                }
                return true;
            }
        }, {
            key: 'r_RV$esjava$0',
            value: function r_RV$esjava$0() {
                if (!(this.I_pV <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_R1$esjava$0',
            value: function r_R1$esjava$0() {
                if (!(this.I_p1 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_R2$esjava$0',
            value: function r_R2$esjava$0() {
                if (!(this.I_p2 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_standard_suffix$esjava$0',
            value: function r_standard_suffix$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(portugueseStemmer.a_5);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_from$esjava$1("log");
                        break;
                    case 3:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_from$esjava$1("u");
                        break;
                    case 4:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_from$esjava$1("ente");
                        break;
                    case 5:
                        if (!this.r_R1$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        v_1 = this.limit - this.cursor;
                        lab0: do {
                            this.ket = this.cursor;
                            among_var = this.find_among_b$esjava$1(portugueseStemmer.a_2);
                            if (among_var === 0) {
                                this.cursor = this.limit - v_1;
                                break lab0;
                            }
                            this.bra = this.cursor;
                            if (!this.r_R2$esjava$0()) {
                                this.cursor = this.limit - v_1;
                                break lab0;
                            }
                            this.slice_del$esjava$0();
                            switch (among_var) {
                                case 0:
                                    this.cursor = this.limit - v_1;
                                    break lab0;
                                case 1:
                                    this.ket = this.cursor;
                                    if (!this.eq_s_b$esjava$1("at")) {
                                        this.cursor = this.limit - v_1;
                                        break lab0;
                                    }
                                    this.bra = this.cursor;
                                    if (!this.r_R2$esjava$0()) {
                                        this.cursor = this.limit - v_1;
                                        break lab0;
                                    }
                                    this.slice_del$esjava$0();
                                    break;
                            }
                        } while (false);
                        break;
                    case 6:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        v_2 = this.limit - this.cursor;
                        lab1: do {
                            this.ket = this.cursor;
                            among_var = this.find_among_b$esjava$1(portugueseStemmer.a_3);
                            if (among_var === 0) {
                                this.cursor = this.limit - v_2;
                                break lab1;
                            }
                            this.bra = this.cursor;
                            switch (among_var) {
                                case 0:
                                    this.cursor = this.limit - v_2;
                                    break lab1;
                                case 1:
                                    if (!this.r_R2$esjava$0()) {
                                        this.cursor = this.limit - v_2;
                                        break lab1;
                                    }
                                    this.slice_del$esjava$0();
                                    break;
                            }
                        } while (false);
                        break;
                    case 7:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        v_3 = this.limit - this.cursor;
                        lab2: do {
                            this.ket = this.cursor;
                            among_var = this.find_among_b$esjava$1(portugueseStemmer.a_4);
                            if (among_var === 0) {
                                this.cursor = this.limit - v_3;
                                break lab2;
                            }
                            this.bra = this.cursor;
                            switch (among_var) {
                                case 0:
                                    this.cursor = this.limit - v_3;
                                    break lab2;
                                case 1:
                                    if (!this.r_R2$esjava$0()) {
                                        this.cursor = this.limit - v_3;
                                        break lab2;
                                    }
                                    this.slice_del$esjava$0();
                                    break;
                            }
                        } while (false);
                        break;
                    case 8:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        v_4 = this.limit - this.cursor;
                        lab3: do {
                            this.ket = this.cursor;
                            if (!this.eq_s_b$esjava$1("at")) {
                                this.cursor = this.limit - v_4;
                                break lab3;
                            }
                            this.bra = this.cursor;
                            if (!this.r_R2$esjava$0()) {
                                this.cursor = this.limit - v_4;
                                break lab3;
                            }
                            this.slice_del$esjava$0();
                        } while (false);
                        break;
                    case 9:
                        if (!this.r_RV$esjava$0()) {
                            return false;
                        }
                        if (!this.eq_s_b$esjava$1("e")) {
                            return false;
                        }
                        this.slice_from$esjava$1("ir");
                        break;
                }
                return true;
            }
        }, {
            key: 'r_verb_suffix$esjava$0',
            value: function r_verb_suffix$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                v_1 = this.limit - this.cursor;
                if (this.cursor < this.I_pV) {
                    return false;
                }
                this.cursor = this.I_pV;
                v_2 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_1;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(portugueseStemmer.a_6);
                if (among_var === 0) {
                    this.limit_backward = v_2;
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        this.limit_backward = v_2;
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                }
                this.limit_backward = v_2;
                return true;
            }
        }, {
            key: 'r_residual_suffix$esjava$0',
            value: function r_residual_suffix$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(portugueseStemmer.a_7);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!this.r_RV$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_residual_form$esjava$0',
            value: function r_residual_form$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(portugueseStemmer.a_8);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!this.r_RV$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        this.ket = this.cursor;
                        lab0: do {
                            v_1 = this.limit - this.cursor;
                            lab1: do {
                                if (!this.eq_s_b$esjava$1("u")) {
                                    break lab1;
                                }
                                this.bra = this.cursor;
                                v_2 = this.limit - this.cursor;
                                if (!this.eq_s_b$esjava$1("g")) {
                                    break lab1;
                                }
                                this.cursor = this.limit - v_2;
                                break lab0;
                            } while (false);
                            this.cursor = this.limit - v_1;
                            if (!this.eq_s_b$esjava$1("i")) {
                                return false;
                            }
                            this.bra = this.cursor;
                            v_3 = this.limit - this.cursor;
                            if (!this.eq_s_b$esjava$1("c")) {
                                return false;
                            }
                            this.cursor = this.limit - v_3;
                        } while (false);
                        if (!this.r_RV$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        this.slice_from$esjava$1("c");
                        break;
                }
                return true;
            }
        }, {
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                var v_8 = void 0;
                var v_9 = void 0;
                var v_10 = void 0;
                v_1 = this.cursor;
                lab0: do {
                    if (!this.r_prelude$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = v_1;
                v_2 = this.cursor;
                lab1: do {
                    if (!this.r_mark_regions$esjava$0()) {
                        break lab1;
                    }
                } while (false);
                this.cursor = v_2;
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                v_3 = this.limit - this.cursor;
                lab2: do {
                    lab3: do {
                        v_4 = this.limit - this.cursor;
                        lab4: do {
                            v_5 = this.limit - this.cursor;
                            lab5: do {
                                v_6 = this.limit - this.cursor;
                                lab6: do {
                                    if (!this.r_standard_suffix$esjava$0()) {
                                        break lab6;
                                    }
                                    break lab5;
                                } while (false);
                                this.cursor = this.limit - v_6;
                                if (!this.r_verb_suffix$esjava$0()) {
                                    break lab4;
                                }
                            } while (false);
                            this.cursor = this.limit - v_5;
                            v_7 = this.limit - this.cursor;
                            lab7: do {
                                this.ket = this.cursor;
                                if (!this.eq_s_b$esjava$1("i")) {
                                    break lab7;
                                }
                                this.bra = this.cursor;
                                v_8 = this.limit - this.cursor;
                                if (!this.eq_s_b$esjava$1("c")) {
                                    break lab7;
                                }
                                this.cursor = this.limit - v_8;
                                if (!this.r_RV$esjava$0()) {
                                    break lab7;
                                }
                                this.slice_del$esjava$0();
                            } while (false);
                            this.cursor = this.limit - v_7;
                            break lab3;
                        } while (false);
                        this.cursor = this.limit - v_4;
                        if (!this.r_residual_suffix$esjava$0()) {
                            break lab2;
                        }
                    } while (false);
                } while (false);
                this.cursor = this.limit - v_3;
                v_9 = this.limit - this.cursor;
                lab8: do {
                    if (!this.r_residual_form$esjava$0()) {
                        break lab8;
                    }
                } while (false);
                this.cursor = this.limit - v_9;
                this.cursor = this.limit_backward;
                v_10 = this.cursor;
                lab9: do {
                    if (!this.r_postlude$esjava$0()) {
                        break lab9;
                    }
                } while (false);
                this.cursor = v_10;
                return true;
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get43;

                for (var _len42 = arguments.length, args = Array(_len42), _key42 = 0; _key42 < _len42; _key42++) {
                    args[_key42] = arguments[_key42];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get43 = _get(Object.getPrototypeOf(portugueseStemmer.prototype), 'stem', this)).call.apply(_get43, [this].concat(args));
            }
        }, {
            key: 'I_p2',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p2') ? this._$esjava$I_p2 : this._$esjava$I_p2 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p2 = v;
            }
        }, {
            key: 'I_p1',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p1') ? this._$esjava$I_p1 : this._$esjava$I_p1 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p1 = v;
            }
        }, {
            key: 'I_pV',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_pV') ? this._$esjava$I_pV : this._$esjava$I_pV = 0;
            },
            set: function set(v) {
                this._$esjava$I_pV = v;
            }
        }], [{
            key: 'a_0',
            get: function get() {
                delete portugueseStemmer.a_0;
                return portugueseStemmer.a_0 = [new Among("", -1, 3), new Among('\u00E3', 0, 1), new Among('\u00F5', 0, 2)];
            }
        }, {
            key: 'a_1',
            get: function get() {
                delete portugueseStemmer.a_1;
                return portugueseStemmer.a_1 = [new Among("", -1, 3), new Among("a~", 0, 1), new Among("o~", 0, 2)];
            }
        }, {
            key: 'a_2',
            get: function get() {
                delete portugueseStemmer.a_2;
                return portugueseStemmer.a_2 = [new Among("ic", -1, -1), new Among("ad", -1, -1), new Among("os", -1, -1), new Among("iv", -1, 1)];
            }
        }, {
            key: 'a_3',
            get: function get() {
                delete portugueseStemmer.a_3;
                return portugueseStemmer.a_3 = [new Among("ante", -1, 1), new Among("avel", -1, 1), new Among('\u00EDvel', -1, 1)];
            }
        }, {
            key: 'a_4',
            get: function get() {
                delete portugueseStemmer.a_4;
                return portugueseStemmer.a_4 = [new Among("ic", -1, 1), new Among("abil", -1, 1), new Among("iv", -1, 1)];
            }
        }, {
            key: 'a_5',
            get: function get() {
                delete portugueseStemmer.a_5;
                return portugueseStemmer.a_5 = [new Among("ica", -1, 1), new Among('\u00E2ncia', -1, 1), new Among('\u00EAncia', -1, 4), new Among("logia", -1, 2), new Among("ira", -1, 9), new Among("adora", -1, 1), new Among("osa", -1, 1), new Among("ista", -1, 1), new Among("iva", -1, 8), new Among("eza", -1, 1), new Among("idade", -1, 7), new Among("ante", -1, 1), new Among("mente", -1, 6), new Among("amente", 12, 5), new Among('\u00E1vel', -1, 1), new Among('\u00EDvel', -1, 1), new Among("ico", -1, 1), new Among("ismo", -1, 1), new Among("oso", -1, 1), new Among("amento", -1, 1), new Among("imento", -1, 1), new Among("ivo", -1, 8), new Among('a\u00E7a~o', -1, 1), new Among('u\u00E7a~o', -1, 3), new Among("ador", -1, 1), new Among("icas", -1, 1), new Among('\u00EAncias', -1, 4), new Among("logias", -1, 2), new Among("iras", -1, 9), new Among("adoras", -1, 1), new Among("osas", -1, 1), new Among("istas", -1, 1), new Among("ivas", -1, 8), new Among("ezas", -1, 1), new Among("idades", -1, 7), new Among("adores", -1, 1), new Among("antes", -1, 1), new Among('a\u00E7o~es', -1, 1), new Among('u\u00E7o~es', -1, 3), new Among("icos", -1, 1), new Among("ismos", -1, 1), new Among("osos", -1, 1), new Among("amentos", -1, 1), new Among("imentos", -1, 1), new Among("ivos", -1, 8)];
            }
        }, {
            key: 'a_6',
            get: function get() {
                delete portugueseStemmer.a_6;
                return portugueseStemmer.a_6 = [new Among("ada", -1, 1), new Among("ida", -1, 1), new Among("ia", -1, 1), new Among("aria", 2, 1), new Among("eria", 2, 1), new Among("iria", 2, 1), new Among("ara", -1, 1), new Among("era", -1, 1), new Among("ira", -1, 1), new Among("ava", -1, 1), new Among("asse", -1, 1), new Among("esse", -1, 1), new Among("isse", -1, 1), new Among("aste", -1, 1), new Among("este", -1, 1), new Among("iste", -1, 1), new Among("ei", -1, 1), new Among("arei", 16, 1), new Among("erei", 16, 1), new Among("irei", 16, 1), new Among("am", -1, 1), new Among("iam", 20, 1), new Among("ariam", 21, 1), new Among("eriam", 21, 1), new Among("iriam", 21, 1), new Among("aram", 20, 1), new Among("eram", 20, 1), new Among("iram", 20, 1), new Among("avam", 20, 1), new Among("em", -1, 1), new Among("arem", 29, 1), new Among("erem", 29, 1), new Among("irem", 29, 1), new Among("assem", 29, 1), new Among("essem", 29, 1), new Among("issem", 29, 1), new Among("ado", -1, 1), new Among("ido", -1, 1), new Among("ando", -1, 1), new Among("endo", -1, 1), new Among("indo", -1, 1), new Among("ara~o", -1, 1), new Among("era~o", -1, 1), new Among("ira~o", -1, 1), new Among("ar", -1, 1), new Among("er", -1, 1), new Among("ir", -1, 1), new Among("as", -1, 1), new Among("adas", 47, 1), new Among("idas", 47, 1), new Among("ias", 47, 1), new Among("arias", 50, 1), new Among("erias", 50, 1), new Among("irias", 50, 1), new Among("aras", 47, 1), new Among("eras", 47, 1), new Among("iras", 47, 1), new Among("avas", 47, 1), new Among("es", -1, 1), new Among("ardes", 58, 1), new Among("erdes", 58, 1), new Among("irdes", 58, 1), new Among("ares", 58, 1), new Among("eres", 58, 1), new Among("ires", 58, 1), new Among("asses", 58, 1), new Among("esses", 58, 1), new Among("isses", 58, 1), new Among("astes", 58, 1), new Among("estes", 58, 1), new Among("istes", 58, 1), new Among("is", -1, 1), new Among("ais", 71, 1), new Among("eis", 71, 1), new Among("areis", 73, 1), new Among("ereis", 73, 1), new Among("ireis", 73, 1), new Among('\u00E1reis', 73, 1), new Among('\u00E9reis', 73, 1), new Among('\u00EDreis', 73, 1), new Among('\u00E1sseis', 73, 1), new Among('\u00E9sseis', 73, 1), new Among('\u00EDsseis', 73, 1), new Among('\u00E1veis', 73, 1), new Among('\u00EDeis', 73, 1), new Among('ar\u00EDeis', 84, 1), new Among('er\u00EDeis', 84, 1), new Among('ir\u00EDeis', 84, 1), new Among("ados", -1, 1), new Among("idos", -1, 1), new Among("amos", -1, 1), new Among('\u00E1ramos', 90, 1), new Among('\u00E9ramos', 90, 1), new Among('\u00EDramos', 90, 1), new Among('\u00E1vamos', 90, 1), new Among('\u00EDamos', 90, 1), new Among('ar\u00EDamos', 95, 1), new Among('er\u00EDamos', 95, 1), new Among('ir\u00EDamos', 95, 1), new Among("emos", -1, 1), new Among("aremos", 99, 1), new Among("eremos", 99, 1), new Among("iremos", 99, 1), new Among('\u00E1ssemos', 99, 1), new Among('\u00EAssemos', 99, 1), new Among('\u00EDssemos', 99, 1), new Among("imos", -1, 1), new Among("armos", -1, 1), new Among("ermos", -1, 1), new Among("irmos", -1, 1), new Among('\u00E1mos', -1, 1), new Among('ar\u00E1s', -1, 1), new Among('er\u00E1s', -1, 1), new Among('ir\u00E1s', -1, 1), new Among("eu", -1, 1), new Among("iu", -1, 1), new Among("ou", -1, 1), new Among('ar\u00E1', -1, 1), new Among('er\u00E1', -1, 1), new Among('ir\u00E1', -1, 1)];
            }
        }, {
            key: 'a_7',
            get: function get() {
                delete portugueseStemmer.a_7;
                return portugueseStemmer.a_7 = [new Among("a", -1, 1), new Among("i", -1, 1), new Among("o", -1, 1), new Among("os", -1, 1), new Among('\u00E1', -1, 1), new Among('\u00ED', -1, 1), new Among('\u00F3', -1, 1)];
            }
        }, {
            key: 'a_8',
            get: function get() {
                delete portugueseStemmer.a_8;
                return portugueseStemmer.a_8 = [new Among("e", -1, 1), new Among('\u00E7', -1, 2), new Among('\u00E9', -1, 1), new Among('\u00EA', -1, 1)];
            }
        }, {
            key: 'g_v',
            get: function get() {
                delete portugueseStemmer.g_v;
                return portugueseStemmer.g_v = [17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 19, 12, 2];
            }
        }]);

        return portugueseStemmer;
    }(SnowballStemmer);

    var romanianStemmer = function (_SnowballStemmer18) {
        _inherits(romanianStemmer, _SnowballStemmer18);

        function romanianStemmer() {
            _classCallCheck(this, romanianStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(romanianStemmer).apply(this, arguments));
        }

        _createClass(romanianStemmer, [{
            key: 'r_prelude$esjava$0',
            value: function r_prelude$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                replab0: while (true) {
                    v_1 = this.cursor;
                    lab1: do {
                        golab2: while (true) {
                            v_2 = this.cursor;
                            lab3: do {
                                if (!this.in_grouping$esjava$3(romanianStemmer.g_v, 97, 259)) {
                                    break lab3;
                                }
                                this.bra = this.cursor;
                                lab4: do {
                                    v_3 = this.cursor;
                                    lab5: do {
                                        if (!this.eq_s$esjava$1("u")) {
                                            break lab5;
                                        }
                                        this.ket = this.cursor;
                                        if (!this.in_grouping$esjava$3(romanianStemmer.g_v, 97, 259)) {
                                            break lab5;
                                        }
                                        this.slice_from$esjava$1("U");
                                        break lab4;
                                    } while (false);
                                    this.cursor = v_3;
                                    if (!this.eq_s$esjava$1("i")) {
                                        break lab3;
                                    }
                                    this.ket = this.cursor;
                                    if (!this.in_grouping$esjava$3(romanianStemmer.g_v, 97, 259)) {
                                        break lab3;
                                    }
                                    this.slice_from$esjava$1("I");
                                } while (false);
                                this.cursor = v_2;
                                break golab2;
                            } while (false);
                            this.cursor = v_2;
                            if (this.cursor >= this.limit) {
                                break lab1;
                            }
                            this.cursor++;
                        }
                        continue replab0;
                    } while (false);
                    this.cursor = v_1;
                    break replab0;
                }
                return true;
            }
        }, {
            key: 'r_mark_regions$esjava$0',
            value: function r_mark_regions$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_6 = void 0;
                var v_8 = void 0;
                this.I_pV = this.limit;
                this.I_p1 = this.limit;
                this.I_p2 = this.limit;
                v_1 = this.cursor;
                lab0: do {
                    lab1: do {
                        v_2 = this.cursor;
                        lab2: do {
                            if (!this.in_grouping$esjava$3(romanianStemmer.g_v, 97, 259)) {
                                break lab2;
                            }
                            lab3: do {
                                v_3 = this.cursor;
                                lab4: do {
                                    if (!this.out_grouping$esjava$3(romanianStemmer.g_v, 97, 259)) {
                                        break lab4;
                                    }
                                    golab5: while (true) {
                                        lab6: do {
                                            if (!this.in_grouping$esjava$3(romanianStemmer.g_v, 97, 259)) {
                                                break lab6;
                                            }
                                            break golab5;
                                        } while (false);
                                        if (this.cursor >= this.limit) {
                                            break lab4;
                                        }
                                        this.cursor++;
                                    }
                                    break lab3;
                                } while (false);
                                this.cursor = v_3;
                                if (!this.in_grouping$esjava$3(romanianStemmer.g_v, 97, 259)) {
                                    break lab2;
                                }
                                golab7: while (true) {
                                    lab8: do {
                                        if (!this.out_grouping$esjava$3(romanianStemmer.g_v, 97, 259)) {
                                            break lab8;
                                        }
                                        break golab7;
                                    } while (false);
                                    if (this.cursor >= this.limit) {
                                        break lab2;
                                    }
                                    this.cursor++;
                                }
                            } while (false);
                            break lab1;
                        } while (false);
                        this.cursor = v_2;
                        if (!this.out_grouping$esjava$3(romanianStemmer.g_v, 97, 259)) {
                            break lab0;
                        }
                        lab9: do {
                            v_6 = this.cursor;
                            lab10: do {
                                if (!this.out_grouping$esjava$3(romanianStemmer.g_v, 97, 259)) {
                                    break lab10;
                                }
                                golab11: while (true) {
                                    lab12: do {
                                        if (!this.in_grouping$esjava$3(romanianStemmer.g_v, 97, 259)) {
                                            break lab12;
                                        }
                                        break golab11;
                                    } while (false);
                                    if (this.cursor >= this.limit) {
                                        break lab10;
                                    }
                                    this.cursor++;
                                }
                                break lab9;
                            } while (false);
                            this.cursor = v_6;
                            if (!this.in_grouping$esjava$3(romanianStemmer.g_v, 97, 259)) {
                                break lab0;
                            }
                            if (this.cursor >= this.limit) {
                                break lab0;
                            }
                            this.cursor++;
                        } while (false);
                    } while (false);
                    this.I_pV = this.cursor;
                } while (false);
                this.cursor = v_1;
                v_8 = this.cursor;
                lab13: do {
                    golab14: while (true) {
                        lab15: do {
                            if (!this.in_grouping$esjava$3(romanianStemmer.g_v, 97, 259)) {
                                break lab15;
                            }
                            break golab14;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab13;
                        }
                        this.cursor++;
                    }
                    golab16: while (true) {
                        lab17: do {
                            if (!this.out_grouping$esjava$3(romanianStemmer.g_v, 97, 259)) {
                                break lab17;
                            }
                            break golab16;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab13;
                        }
                        this.cursor++;
                    }
                    this.I_p1 = this.cursor;
                    golab18: while (true) {
                        lab19: do {
                            if (!this.in_grouping$esjava$3(romanianStemmer.g_v, 97, 259)) {
                                break lab19;
                            }
                            break golab18;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab13;
                        }
                        this.cursor++;
                    }
                    golab20: while (true) {
                        lab21: do {
                            if (!this.out_grouping$esjava$3(romanianStemmer.g_v, 97, 259)) {
                                break lab21;
                            }
                            break golab20;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab13;
                        }
                        this.cursor++;
                    }
                    this.I_p2 = this.cursor;
                } while (false);
                this.cursor = v_8;
                return true;
            }
        }, {
            key: 'r_postlude$esjava$0',
            value: function r_postlude$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                replab0: while (true) {
                    v_1 = this.cursor;
                    lab1: do {
                        this.bra = this.cursor;
                        among_var = this.find_among$esjava$1(romanianStemmer.a_0);
                        if (among_var === 0) {
                            break lab1;
                        }
                        this.ket = this.cursor;
                        switch (among_var) {
                            case 0:
                                break lab1;
                            case 1:
                                this.slice_from$esjava$1("i");
                                break;
                            case 2:
                                this.slice_from$esjava$1("u");
                                break;
                            case 3:
                                if (this.cursor >= this.limit) {
                                    break lab1;
                                }
                                this.cursor++;
                                break;
                        }
                        continue replab0;
                    } while (false);
                    this.cursor = v_1;
                    break replab0;
                }
                return true;
            }
        }, {
            key: 'r_RV$esjava$0',
            value: function r_RV$esjava$0() {
                if (!(this.I_pV <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_R1$esjava$0',
            value: function r_R1$esjava$0() {
                if (!(this.I_p1 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_R2$esjava$0',
            value: function r_R2$esjava$0() {
                if (!(this.I_p2 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_step_0$esjava$0',
            value: function r_step_0$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(romanianStemmer.a_1);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_R1$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        this.slice_from$esjava$1("a");
                        break;
                    case 3:
                        this.slice_from$esjava$1("e");
                        break;
                    case 4:
                        this.slice_from$esjava$1("i");
                        break;
                    case 5:
                        {
                            v_1 = this.limit - this.cursor;
                            lab0: do {
                                if (!this.eq_s_b$esjava$1("ab")) {
                                    break lab0;
                                }
                                return false;
                            } while (false);
                            this.cursor = this.limit - v_1;
                        }
                        this.slice_from$esjava$1("i");
                        break;
                    case 6:
                        this.slice_from$esjava$1("at");
                        break;
                    case 7:
                        this.slice_from$esjava$1('a\u0163i');
                        break;
                }
                return true;
            }
        }, {
            key: 'r_combo_suffix$esjava$0',
            value: function r_combo_suffix$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                v_1 = this.limit - this.cursor;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(romanianStemmer.a_2);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_R1$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_from$esjava$1("abil");
                        break;
                    case 2:
                        this.slice_from$esjava$1("ibil");
                        break;
                    case 3:
                        this.slice_from$esjava$1("iv");
                        break;
                    case 4:
                        this.slice_from$esjava$1("ic");
                        break;
                    case 5:
                        this.slice_from$esjava$1("at");
                        break;
                    case 6:
                        this.slice_from$esjava$1("it");
                        break;
                }
                this.B_standard_suffix_removed = true;
                this.cursor = this.limit - v_1;
                return true;
            }
        }, {
            key: 'r_standard_suffix$esjava$0',
            value: function r_standard_suffix$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                this.B_standard_suffix_removed = false;
                replab0: while (true) {
                    v_1 = this.limit - this.cursor;
                    lab1: do {
                        if (!this.r_combo_suffix$esjava$0()) {
                            break lab1;
                        }
                        continue replab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    break replab0;
                }
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(romanianStemmer.a_3);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_R2$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!this.eq_s_b$esjava$1('\u0163')) {
                            return false;
                        }
                        this.bra = this.cursor;
                        this.slice_from$esjava$1("t");
                        break;
                    case 3:
                        this.slice_from$esjava$1("ist");
                        break;
                }
                this.B_standard_suffix_removed = true;
                return true;
            }
        }, {
            key: 'r_verb_suffix$esjava$0',
            value: function r_verb_suffix$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                v_1 = this.limit - this.cursor;
                if (this.cursor < this.I_pV) {
                    return false;
                }
                this.cursor = this.I_pV;
                v_2 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_1;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(romanianStemmer.a_4);
                if (among_var === 0) {
                    this.limit_backward = v_2;
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        this.limit_backward = v_2;
                        return false;
                    case 1:
                        lab0: do {
                            v_3 = this.limit - this.cursor;
                            lab1: do {
                                if (!this.out_grouping_b$esjava$3(romanianStemmer.g_v, 97, 259)) {
                                    break lab1;
                                }
                                break lab0;
                            } while (false);
                            this.cursor = this.limit - v_3;
                            if (!this.eq_s_b$esjava$1("u")) {
                                this.limit_backward = v_2;
                                return false;
                            }
                        } while (false);
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        this.slice_del$esjava$0();
                        break;
                }
                this.limit_backward = v_2;
                return true;
            }
        }, {
            key: 'r_vowel_suffix$esjava$0',
            value: function r_vowel_suffix$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(romanianStemmer.a_5);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_RV$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                var v_8 = void 0;
                v_1 = this.cursor;
                lab0: do {
                    if (!this.r_prelude$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = v_1;
                v_2 = this.cursor;
                lab1: do {
                    if (!this.r_mark_regions$esjava$0()) {
                        break lab1;
                    }
                } while (false);
                this.cursor = v_2;
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                v_3 = this.limit - this.cursor;
                lab2: do {
                    if (!this.r_step_0$esjava$0()) {
                        break lab2;
                    }
                } while (false);
                this.cursor = this.limit - v_3;
                v_4 = this.limit - this.cursor;
                lab3: do {
                    if (!this.r_standard_suffix$esjava$0()) {
                        break lab3;
                    }
                } while (false);
                this.cursor = this.limit - v_4;
                v_5 = this.limit - this.cursor;
                lab4: do {
                    lab5: do {
                        v_6 = this.limit - this.cursor;
                        lab6: do {
                            if (!this.B_standard_suffix_removed) {
                                break lab6;
                            }
                            break lab5;
                        } while (false);
                        this.cursor = this.limit - v_6;
                        if (!this.r_verb_suffix$esjava$0()) {
                            break lab4;
                        }
                    } while (false);
                } while (false);
                this.cursor = this.limit - v_5;
                v_7 = this.limit - this.cursor;
                lab7: do {
                    if (!this.r_vowel_suffix$esjava$0()) {
                        break lab7;
                    }
                } while (false);
                this.cursor = this.limit - v_7;
                this.cursor = this.limit_backward;
                v_8 = this.cursor;
                lab8: do {
                    if (!this.r_postlude$esjava$0()) {
                        break lab8;
                    }
                } while (false);
                this.cursor = v_8;
                return true;
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get44;

                for (var _len43 = arguments.length, args = Array(_len43), _key43 = 0; _key43 < _len43; _key43++) {
                    args[_key43] = arguments[_key43];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get44 = _get(Object.getPrototypeOf(romanianStemmer.prototype), 'stem', this)).call.apply(_get44, [this].concat(args));
            }
        }, {
            key: 'B_standard_suffix_removed',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$B_standard_suffix_removed') ? this._$esjava$B_standard_suffix_removed : this._$esjava$B_standard_suffix_removed = false;
            },
            set: function set(v) {
                this._$esjava$B_standard_suffix_removed = v;
            }
        }, {
            key: 'I_p2',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p2') ? this._$esjava$I_p2 : this._$esjava$I_p2 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p2 = v;
            }
        }, {
            key: 'I_p1',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p1') ? this._$esjava$I_p1 : this._$esjava$I_p1 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p1 = v;
            }
        }, {
            key: 'I_pV',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_pV') ? this._$esjava$I_pV : this._$esjava$I_pV = 0;
            },
            set: function set(v) {
                this._$esjava$I_pV = v;
            }
        }], [{
            key: 'a_0',
            get: function get() {
                delete romanianStemmer.a_0;
                return romanianStemmer.a_0 = [new Among("", -1, 3), new Among("I", 0, 1), new Among("U", 0, 2)];
            }
        }, {
            key: 'a_1',
            get: function get() {
                delete romanianStemmer.a_1;
                return romanianStemmer.a_1 = [new Among("ea", -1, 3), new Among('a\u0163ia', -1, 7), new Among("aua", -1, 2), new Among("iua", -1, 4), new Among('a\u0163ie', -1, 7), new Among("ele", -1, 3), new Among("ile", -1, 5), new Among("iile", 6, 4), new Among("iei", -1, 4), new Among("atei", -1, 6), new Among("ii", -1, 4), new Among("ului", -1, 1), new Among("ul", -1, 1), new Among("elor", -1, 3), new Among("ilor", -1, 4), new Among("iilor", 14, 4)];
            }
        }, {
            key: 'a_2',
            get: function get() {
                delete romanianStemmer.a_2;
                return romanianStemmer.a_2 = [new Among("icala", -1, 4), new Among("iciva", -1, 4), new Among("ativa", -1, 5), new Among("itiva", -1, 6), new Among("icale", -1, 4), new Among('a\u0163iune', -1, 5), new Among('i\u0163iune', -1, 6), new Among("atoare", -1, 5), new Among("itoare", -1, 6), new Among('\u0103toare', -1, 5), new Among("icitate", -1, 4), new Among("abilitate", -1, 1), new Among("ibilitate", -1, 2), new Among("ivitate", -1, 3), new Among("icive", -1, 4), new Among("ative", -1, 5), new Among("itive", -1, 6), new Among("icali", -1, 4), new Among("atori", -1, 5), new Among("icatori", 18, 4), new Among("itori", -1, 6), new Among('\u0103tori', -1, 5), new Among("icitati", -1, 4), new Among("abilitati", -1, 1), new Among("ivitati", -1, 3), new Among("icivi", -1, 4), new Among("ativi", -1, 5), new Among("itivi", -1, 6), new Among('icit\u0103i', -1, 4), new Among('abilit\u0103i', -1, 1), new Among('ivit\u0103i', -1, 3), new Among('icit\u0103\u0163i', -1, 4), new Among('abilit\u0103\u0163i', -1, 1), new Among('ivit\u0103\u0163i', -1, 3), new Among("ical", -1, 4), new Among("ator", -1, 5), new Among("icator", 35, 4), new Among("itor", -1, 6), new Among('\u0103tor', -1, 5), new Among("iciv", -1, 4), new Among("ativ", -1, 5), new Among("itiv", -1, 6), new Among('ical\u0103', -1, 4), new Among('iciv\u0103', -1, 4), new Among('ativ\u0103', -1, 5), new Among('itiv\u0103', -1, 6)];
            }
        }, {
            key: 'a_3',
            get: function get() {
                delete romanianStemmer.a_3;
                return romanianStemmer.a_3 = [new Among("ica", -1, 1), new Among("abila", -1, 1), new Among("ibila", -1, 1), new Among("oasa", -1, 1), new Among("ata", -1, 1), new Among("ita", -1, 1), new Among("anta", -1, 1), new Among("ista", -1, 3), new Among("uta", -1, 1), new Among("iva", -1, 1), new Among("ic", -1, 1), new Among("ice", -1, 1), new Among("abile", -1, 1), new Among("ibile", -1, 1), new Among("isme", -1, 3), new Among("iune", -1, 2), new Among("oase", -1, 1), new Among("ate", -1, 1), new Among("itate", 17, 1), new Among("ite", -1, 1), new Among("ante", -1, 1), new Among("iste", -1, 3), new Among("ute", -1, 1), new Among("ive", -1, 1), new Among("ici", -1, 1), new Among("abili", -1, 1), new Among("ibili", -1, 1), new Among("iuni", -1, 2), new Among("atori", -1, 1), new Among("osi", -1, 1), new Among("ati", -1, 1), new Among("itati", 30, 1), new Among("iti", -1, 1), new Among("anti", -1, 1), new Among("isti", -1, 3), new Among("uti", -1, 1), new Among('i\u015Fti', -1, 3), new Among("ivi", -1, 1), new Among('it\u0103i', -1, 1), new Among('o\u015Fi', -1, 1), new Among('it\u0103\u0163i', -1, 1), new Among("abil", -1, 1), new Among("ibil", -1, 1), new Among("ism", -1, 3), new Among("ator", -1, 1), new Among("os", -1, 1), new Among("at", -1, 1), new Among("it", -1, 1), new Among("ant", -1, 1), new Among("ist", -1, 3), new Among("ut", -1, 1), new Among("iv", -1, 1), new Among('ic\u0103', -1, 1), new Among('abil\u0103', -1, 1), new Among('ibil\u0103', -1, 1), new Among('oas\u0103', -1, 1), new Among('at\u0103', -1, 1), new Among('it\u0103', -1, 1), new Among('ant\u0103', -1, 1), new Among('ist\u0103', -1, 3), new Among('ut\u0103', -1, 1), new Among('iv\u0103', -1, 1)];
            }
        }, {
            key: 'a_4',
            get: function get() {
                delete romanianStemmer.a_4;
                return romanianStemmer.a_4 = [new Among("ea", -1, 1), new Among("ia", -1, 1), new Among("esc", -1, 1), new Among('\u0103sc', -1, 1), new Among("ind", -1, 1), new Among('\u00E2nd', -1, 1), new Among("are", -1, 1), new Among("ere", -1, 1), new Among("ire", -1, 1), new Among('\u00E2re', -1, 1), new Among("se", -1, 2), new Among("ase", 10, 1), new Among("sese", 10, 2), new Among("ise", 10, 1), new Among("use", 10, 1), new Among('\u00E2se', 10, 1), new Among('e\u015Fte', -1, 1), new Among('\u0103\u015Fte', -1, 1), new Among("eze", -1, 1), new Among("ai", -1, 1), new Among("eai", 19, 1), new Among("iai", 19, 1), new Among("sei", -1, 2), new Among('e\u015Fti', -1, 1), new Among('\u0103\u015Fti', -1, 1), new Among("ui", -1, 1), new Among("ezi", -1, 1), new Among('\u00E2i', -1, 1), new Among('a\u015Fi', -1, 1), new Among('se\u015Fi', -1, 2), new Among('ase\u015Fi', 29, 1), new Among('sese\u015Fi', 29, 2), new Among('ise\u015Fi', 29, 1), new Among('use\u015Fi', 29, 1), new Among('\u00E2se\u015Fi', 29, 1), new Among('i\u015Fi', -1, 1), new Among('u\u015Fi', -1, 1), new Among('\u00E2\u015Fi', -1, 1), new Among('a\u0163i', -1, 2), new Among('ea\u0163i', 38, 1), new Among('ia\u0163i', 38, 1), new Among('e\u0163i', -1, 2), new Among('i\u0163i', -1, 2), new Among('\u00E2\u0163i', -1, 2), new Among('ar\u0103\u0163i', -1, 1), new Among('ser\u0103\u0163i', -1, 2), new Among('aser\u0103\u0163i', 45, 1), new Among('seser\u0103\u0163i', 45, 2), new Among('iser\u0103\u0163i', 45, 1), new Among('user\u0103\u0163i', 45, 1), new Among('\u00E2ser\u0103\u0163i', 45, 1), new Among('ir\u0103\u0163i', -1, 1), new Among('ur\u0103\u0163i', -1, 1), new Among('\u00E2r\u0103\u0163i', -1, 1), new Among("am", -1, 1), new Among("eam", 54, 1), new Among("iam", 54, 1), new Among("em", -1, 2), new Among("asem", 57, 1), new Among("sesem", 57, 2), new Among("isem", 57, 1), new Among("usem", 57, 1), new Among('\u00E2sem', 57, 1), new Among("im", -1, 2), new Among('\u00E2m', -1, 2), new Among('\u0103m', -1, 2), new Among('ar\u0103m', 65, 1), new Among('ser\u0103m', 65, 2), new Among('aser\u0103m', 67, 1), new Among('seser\u0103m', 67, 2), new Among('iser\u0103m', 67, 1), new Among('user\u0103m', 67, 1), new Among('\u00E2ser\u0103m', 67, 1), new Among('ir\u0103m', 65, 1), new Among('ur\u0103m', 65, 1), new Among('\u00E2r\u0103m', 65, 1), new Among("au", -1, 1), new Among("eau", 76, 1), new Among("iau", 76, 1), new Among("indu", -1, 1), new Among('\u00E2ndu', -1, 1), new Among("ez", -1, 1), new Among('easc\u0103', -1, 1), new Among('ar\u0103', -1, 1), new Among('ser\u0103', -1, 2), new Among('aser\u0103', 84, 1), new Among('seser\u0103', 84, 2), new Among('iser\u0103', 84, 1), new Among('user\u0103', 84, 1), new Among('\u00E2ser\u0103', 84, 1), new Among('ir\u0103', -1, 1), new Among('ur\u0103', -1, 1), new Among('\u00E2r\u0103', -1, 1), new Among('eaz\u0103', -1, 1)];
            }
        }, {
            key: 'a_5',
            get: function get() {
                delete romanianStemmer.a_5;
                return romanianStemmer.a_5 = [new Among("a", -1, 1), new Among("e", -1, 1), new Among("ie", 1, 1), new Among("i", -1, 1), new Among('\u0103', -1, 1)];
            }
        }, {
            key: 'g_v',
            get: function get() {
                delete romanianStemmer.g_v;
                return romanianStemmer.g_v = [17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 32, 0, 0, 4];
            }
        }]);

        return romanianStemmer;
    }(SnowballStemmer);

    var russianStemmer = function (_SnowballStemmer19) {
        _inherits(russianStemmer, _SnowballStemmer19);

        function russianStemmer() {
            _classCallCheck(this, russianStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(russianStemmer).apply(this, arguments));
        }

        _createClass(russianStemmer, [{
            key: 'r_mark_regions$esjava$0',
            value: function r_mark_regions$esjava$0() {
                var v_1 = void 0;
                this.I_pV = this.limit;
                this.I_p2 = this.limit;
                v_1 = this.cursor;
                lab0: do {
                    golab1: while (true) {
                        lab2: do {
                            if (!this.in_grouping$esjava$3(russianStemmer.g_v, 1072, 1103)) {
                                break lab2;
                            }
                            break golab1;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab0;
                        }
                        this.cursor++;
                    }
                    this.I_pV = this.cursor;
                    golab3: while (true) {
                        lab4: do {
                            if (!this.out_grouping$esjava$3(russianStemmer.g_v, 1072, 1103)) {
                                break lab4;
                            }
                            break golab3;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab0;
                        }
                        this.cursor++;
                    }
                    golab5: while (true) {
                        lab6: do {
                            if (!this.in_grouping$esjava$3(russianStemmer.g_v, 1072, 1103)) {
                                break lab6;
                            }
                            break golab5;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab0;
                        }
                        this.cursor++;
                    }
                    golab7: while (true) {
                        lab8: do {
                            if (!this.out_grouping$esjava$3(russianStemmer.g_v, 1072, 1103)) {
                                break lab8;
                            }
                            break golab7;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab0;
                        }
                        this.cursor++;
                    }
                    this.I_p2 = this.cursor;
                } while (false);
                this.cursor = v_1;
                return true;
            }
        }, {
            key: 'r_R2$esjava$0',
            value: function r_R2$esjava$0() {
                if (!(this.I_p2 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_perfective_gerund$esjava$0',
            value: function r_perfective_gerund$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(russianStemmer.a_0);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        lab0: do {
                            v_1 = this.limit - this.cursor;
                            lab1: do {
                                if (!this.eq_s_b$esjava$1('\u0430')) {
                                    break lab1;
                                }
                                break lab0;
                            } while (false);
                            this.cursor = this.limit - v_1;
                            if (!this.eq_s_b$esjava$1('\u044F')) {
                                return false;
                            }
                        } while (false);
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_adjective$esjava$0',
            value: function r_adjective$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(russianStemmer.a_1);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_adjectival$esjava$0',
            value: function r_adjectival$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                if (!this.r_adjective$esjava$0()) {
                    return false;
                }
                v_1 = this.limit - this.cursor;
                lab0: do {
                    this.ket = this.cursor;
                    among_var = this.find_among_b$esjava$1(russianStemmer.a_2);
                    if (among_var === 0) {
                        this.cursor = this.limit - v_1;
                        break lab0;
                    }
                    this.bra = this.cursor;
                    switch (among_var) {
                        case 0:
                            this.cursor = this.limit - v_1;
                            break lab0;
                        case 1:
                            lab1: do {
                                v_2 = this.limit - this.cursor;
                                lab2: do {
                                    if (!this.eq_s_b$esjava$1('\u0430')) {
                                        break lab2;
                                    }
                                    break lab1;
                                } while (false);
                                this.cursor = this.limit - v_2;
                                if (!this.eq_s_b$esjava$1('\u044F')) {
                                    this.cursor = this.limit - v_1;
                                    break lab0;
                                }
                            } while (false);
                            this.slice_del$esjava$0();
                            break;
                        case 2:
                            this.slice_del$esjava$0();
                            break;
                    }
                } while (false);
                return true;
            }
        }, {
            key: 'r_reflexive$esjava$0',
            value: function r_reflexive$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(russianStemmer.a_3);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_verb$esjava$0',
            value: function r_verb$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(russianStemmer.a_4);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        lab0: do {
                            v_1 = this.limit - this.cursor;
                            lab1: do {
                                if (!this.eq_s_b$esjava$1('\u0430')) {
                                    break lab1;
                                }
                                break lab0;
                            } while (false);
                            this.cursor = this.limit - v_1;
                            if (!this.eq_s_b$esjava$1('\u044F')) {
                                return false;
                            }
                        } while (false);
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_noun$esjava$0',
            value: function r_noun$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(russianStemmer.a_5);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_derivational$esjava$0',
            value: function r_derivational$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(russianStemmer.a_6);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                if (!this.r_R2$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_tidy_up$esjava$0',
            value: function r_tidy_up$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(russianStemmer.a_7);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        this.ket = this.cursor;
                        if (!this.eq_s_b$esjava$1('\u043D')) {
                            return false;
                        }
                        this.bra = this.cursor;
                        if (!this.eq_s_b$esjava$1('\u043D')) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!this.eq_s_b$esjava$1('\u043D')) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 3:
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                var v_8 = void 0;
                var v_9 = void 0;
                var v_10 = void 0;
                v_1 = this.cursor;
                lab0: do {
                    if (!this.r_mark_regions$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = v_1;
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                v_2 = this.limit - this.cursor;
                if (this.cursor < this.I_pV) {
                    return false;
                }
                this.cursor = this.I_pV;
                v_3 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_2;
                v_4 = this.limit - this.cursor;
                lab1: do {
                    lab2: do {
                        v_5 = this.limit - this.cursor;
                        lab3: do {
                            if (!this.r_perfective_gerund$esjava$0()) {
                                break lab3;
                            }
                            break lab2;
                        } while (false);
                        this.cursor = this.limit - v_5;
                        v_6 = this.limit - this.cursor;
                        lab4: do {
                            if (!this.r_reflexive$esjava$0()) {
                                this.cursor = this.limit - v_6;
                                break lab4;
                            }
                        } while (false);
                        lab5: do {
                            v_7 = this.limit - this.cursor;
                            lab6: do {
                                if (!this.r_adjectival$esjava$0()) {
                                    break lab6;
                                }
                                break lab5;
                            } while (false);
                            this.cursor = this.limit - v_7;
                            lab7: do {
                                if (!this.r_verb$esjava$0()) {
                                    break lab7;
                                }
                                break lab5;
                            } while (false);
                            this.cursor = this.limit - v_7;
                            if (!this.r_noun$esjava$0()) {
                                break lab1;
                            }
                        } while (false);
                    } while (false);
                } while (false);
                this.cursor = this.limit - v_4;
                v_8 = this.limit - this.cursor;
                lab8: do {
                    this.ket = this.cursor;
                    if (!this.eq_s_b$esjava$1('\u0438')) {
                        this.cursor = this.limit - v_8;
                        break lab8;
                    }
                    this.bra = this.cursor;
                    this.slice_del$esjava$0();
                } while (false);
                v_9 = this.limit - this.cursor;
                lab9: do {
                    if (!this.r_derivational$esjava$0()) {
                        break lab9;
                    }
                } while (false);
                this.cursor = this.limit - v_9;
                v_10 = this.limit - this.cursor;
                lab10: do {
                    if (!this.r_tidy_up$esjava$0()) {
                        break lab10;
                    }
                } while (false);
                this.cursor = this.limit - v_10;
                this.limit_backward = v_3;
                this.cursor = this.limit_backward;
                return true;
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get45;

                for (var _len44 = arguments.length, args = Array(_len44), _key44 = 0; _key44 < _len44; _key44++) {
                    args[_key44] = arguments[_key44];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get45 = _get(Object.getPrototypeOf(russianStemmer.prototype), 'stem', this)).call.apply(_get45, [this].concat(args));
            }
        }, {
            key: 'I_p2',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p2') ? this._$esjava$I_p2 : this._$esjava$I_p2 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p2 = v;
            }
        }, {
            key: 'I_pV',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_pV') ? this._$esjava$I_pV : this._$esjava$I_pV = 0;
            },
            set: function set(v) {
                this._$esjava$I_pV = v;
            }
        }], [{
            key: 'a_0',
            get: function get() {
                delete russianStemmer.a_0;
                return russianStemmer.a_0 = [new Among('\u0432', -1, 1), new Among('\u0438\u0432', 0, 2), new Among('\u044B\u0432', 0, 2), new Among('\u0432\u0448\u0438', -1, 1), new Among('\u0438\u0432\u0448\u0438', 3, 2), new Among('\u044B\u0432\u0448\u0438', 3, 2), new Among('\u0432\u0448\u0438\u0441\u044C', -1, 1), new Among('\u0438\u0432\u0448\u0438\u0441\u044C', 6, 2), new Among('\u044B\u0432\u0448\u0438\u0441\u044C', 6, 2)];
            }
        }, {
            key: 'a_1',
            get: function get() {
                delete russianStemmer.a_1;
                return russianStemmer.a_1 = [new Among('\u0435\u0435', -1, 1), new Among('\u0438\u0435', -1, 1), new Among('\u043E\u0435', -1, 1), new Among('\u044B\u0435', -1, 1), new Among('\u0438\u043C\u0438', -1, 1), new Among('\u044B\u043C\u0438', -1, 1), new Among('\u0435\u0439', -1, 1), new Among('\u0438\u0439', -1, 1), new Among('\u043E\u0439', -1, 1), new Among('\u044B\u0439', -1, 1), new Among('\u0435\u043C', -1, 1), new Among('\u0438\u043C', -1, 1), new Among('\u043E\u043C', -1, 1), new Among('\u044B\u043C', -1, 1), new Among('\u0435\u0433\u043E', -1, 1), new Among('\u043E\u0433\u043E', -1, 1), new Among('\u0435\u043C\u0443', -1, 1), new Among('\u043E\u043C\u0443', -1, 1), new Among('\u0438\u0445', -1, 1), new Among('\u044B\u0445', -1, 1), new Among('\u0435\u044E', -1, 1), new Among('\u043E\u044E', -1, 1), new Among('\u0443\u044E', -1, 1), new Among('\u044E\u044E', -1, 1), new Among('\u0430\u044F', -1, 1), new Among('\u044F\u044F', -1, 1)];
            }
        }, {
            key: 'a_2',
            get: function get() {
                delete russianStemmer.a_2;
                return russianStemmer.a_2 = [new Among('\u0435\u043C', -1, 1), new Among('\u043D\u043D', -1, 1), new Among('\u0432\u0448', -1, 1), new Among('\u0438\u0432\u0448', 2, 2), new Among('\u044B\u0432\u0448', 2, 2), new Among('\u0449', -1, 1), new Among('\u044E\u0449', 5, 1), new Among('\u0443\u044E\u0449', 6, 2)];
            }
        }, {
            key: 'a_3',
            get: function get() {
                delete russianStemmer.a_3;
                return russianStemmer.a_3 = [new Among('\u0441\u044C', -1, 1), new Among('\u0441\u044F', -1, 1)];
            }
        }, {
            key: 'a_4',
            get: function get() {
                delete russianStemmer.a_4;
                return russianStemmer.a_4 = [new Among('\u043B\u0430', -1, 1), new Among('\u0438\u043B\u0430', 0, 2), new Among('\u044B\u043B\u0430', 0, 2), new Among('\u043D\u0430', -1, 1), new Among('\u0435\u043D\u0430', 3, 2), new Among('\u0435\u0442\u0435', -1, 1), new Among('\u0438\u0442\u0435', -1, 2), new Among('\u0439\u0442\u0435', -1, 1), new Among('\u0435\u0439\u0442\u0435', 7, 2), new Among('\u0443\u0439\u0442\u0435', 7, 2), new Among('\u043B\u0438', -1, 1), new Among('\u0438\u043B\u0438', 10, 2), new Among('\u044B\u043B\u0438', 10, 2), new Among('\u0439', -1, 1), new Among('\u0435\u0439', 13, 2), new Among('\u0443\u0439', 13, 2), new Among('\u043B', -1, 1), new Among('\u0438\u043B', 16, 2), new Among('\u044B\u043B', 16, 2), new Among('\u0435\u043C', -1, 1), new Among('\u0438\u043C', -1, 2), new Among('\u044B\u043C', -1, 2), new Among('\u043D', -1, 1), new Among('\u0435\u043D', 22, 2), new Among('\u043B\u043E', -1, 1), new Among('\u0438\u043B\u043E', 24, 2), new Among('\u044B\u043B\u043E', 24, 2), new Among('\u043D\u043E', -1, 1), new Among('\u0435\u043D\u043E', 27, 2), new Among('\u043D\u043D\u043E', 27, 1), new Among('\u0435\u0442', -1, 1), new Among('\u0443\u0435\u0442', 30, 2), new Among('\u0438\u0442', -1, 2), new Among('\u044B\u0442', -1, 2), new Among('\u044E\u0442', -1, 1), new Among('\u0443\u044E\u0442', 34, 2), new Among('\u044F\u0442', -1, 2), new Among('\u043D\u044B', -1, 1), new Among('\u0435\u043D\u044B', 37, 2), new Among('\u0442\u044C', -1, 1), new Among('\u0438\u0442\u044C', 39, 2), new Among('\u044B\u0442\u044C', 39, 2), new Among('\u0435\u0448\u044C', -1, 1), new Among('\u0438\u0448\u044C', -1, 2), new Among('\u044E', -1, 2), new Among('\u0443\u044E', 44, 2)];
            }
        }, {
            key: 'a_5',
            get: function get() {
                delete russianStemmer.a_5;
                return russianStemmer.a_5 = [new Among('\u0430', -1, 1), new Among('\u0435\u0432', -1, 1), new Among('\u043E\u0432', -1, 1), new Among('\u0435', -1, 1), new Among('\u0438\u0435', 3, 1), new Among('\u044C\u0435', 3, 1), new Among('\u0438', -1, 1), new Among('\u0435\u0438', 6, 1), new Among('\u0438\u0438', 6, 1), new Among('\u0430\u043C\u0438', 6, 1), new Among('\u044F\u043C\u0438', 6, 1), new Among('\u0438\u044F\u043C\u0438', 10, 1), new Among('\u0439', -1, 1), new Among('\u0435\u0439', 12, 1), new Among('\u0438\u0435\u0439', 13, 1), new Among('\u0438\u0439', 12, 1), new Among('\u043E\u0439', 12, 1), new Among('\u0430\u043C', -1, 1), new Among('\u0435\u043C', -1, 1), new Among('\u0438\u0435\u043C', 18, 1), new Among('\u043E\u043C', -1, 1), new Among('\u044F\u043C', -1, 1), new Among('\u0438\u044F\u043C', 21, 1), new Among('\u043E', -1, 1), new Among('\u0443', -1, 1), new Among('\u0430\u0445', -1, 1), new Among('\u044F\u0445', -1, 1), new Among('\u0438\u044F\u0445', 26, 1), new Among('\u044B', -1, 1), new Among('\u044C', -1, 1), new Among('\u044E', -1, 1), new Among('\u0438\u044E', 30, 1), new Among('\u044C\u044E', 30, 1), new Among('\u044F', -1, 1), new Among('\u0438\u044F', 33, 1), new Among('\u044C\u044F', 33, 1)];
            }
        }, {
            key: 'a_6',
            get: function get() {
                delete russianStemmer.a_6;
                return russianStemmer.a_6 = [new Among('\u043E\u0441\u0442', -1, 1), new Among('\u043E\u0441\u0442\u044C', -1, 1)];
            }
        }, {
            key: 'a_7',
            get: function get() {
                delete russianStemmer.a_7;
                return russianStemmer.a_7 = [new Among('\u0435\u0439\u0448\u0435', -1, 1), new Among('\u043D', -1, 2), new Among('\u0435\u0439\u0448', -1, 1), new Among('\u044C', -1, 3)];
            }
        }, {
            key: 'g_v',
            get: function get() {
                delete russianStemmer.g_v;
                return russianStemmer.g_v = [33, 65, 8, 232];
            }
        }]);

        return russianStemmer;
    }(SnowballStemmer);

    var sloveneStemmer = function (_SnowballStemmer20) {
        _inherits(sloveneStemmer, _SnowballStemmer20);

        function sloveneStemmer() {
            _classCallCheck(this, sloveneStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(sloveneStemmer).apply(this, arguments));
        }

        _createClass(sloveneStemmer, [{
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                var v_8 = void 0;
                var v_9 = void 0;
                var v_10 = void 0;
                this.I_p1 = this.current.length();
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                v_1 = this.limit - this.cursor;
                lab0: do {
                    for (v_2 = 4; v_2 > 0; v_2--) {
                        v_3 = this.limit - this.cursor;
                        lab1: do {
                            if (!(this.I_p1 > 8)) {
                                this.cursor = this.limit - v_3;
                                break lab1;
                            }
                            this.ket = this.cursor;
                            among_var = this.find_among_b$esjava$1(sloveneStemmer.a_0);
                            if (among_var === 0) {
                                this.cursor = this.limit - v_3;
                                break lab1;
                            }
                            this.bra = this.cursor;
                            switch (among_var) {
                                case 0:
                                    this.cursor = this.limit - v_3;
                                    break lab1;
                                case 1:
                                    this.slice_del$esjava$0();
                                    break;
                            }
                        } while (false);
                        v_4 = this.limit - this.cursor;
                        lab2: do {
                            if (!(this.I_p1 > 7)) {
                                this.cursor = this.limit - v_4;
                                break lab2;
                            }
                            this.ket = this.cursor;
                            among_var = this.find_among_b$esjava$1(sloveneStemmer.a_1);
                            if (among_var === 0) {
                                this.cursor = this.limit - v_4;
                                break lab2;
                            }
                            this.bra = this.cursor;
                            switch (among_var) {
                                case 0:
                                    this.cursor = this.limit - v_4;
                                    break lab2;
                                case 1:
                                    this.slice_del$esjava$0();
                                    break;
                            }
                        } while (false);
                        this.I_p1 = this.current.length();
                        v_5 = this.limit - this.cursor;
                        lab3: do {
                            if (!(this.I_p1 > 6)) {
                                this.cursor = this.limit - v_5;
                                break lab3;
                            }
                            this.ket = this.cursor;
                            among_var = this.find_among_b$esjava$1(sloveneStemmer.a_2);
                            if (among_var === 0) {
                                this.cursor = this.limit - v_5;
                                break lab3;
                            }
                            this.bra = this.cursor;
                            switch (among_var) {
                                case 0:
                                    this.cursor = this.limit - v_5;
                                    break lab3;
                                case 1:
                                    this.slice_del$esjava$0();
                                    break;
                            }
                        } while (false);
                        this.I_p1 = this.current.length();
                        v_6 = this.limit - this.cursor;
                        lab4: do {
                            if (!(this.I_p1 > 6)) {
                                this.cursor = this.limit - v_6;
                                break lab4;
                            }
                            this.ket = this.cursor;
                            among_var = this.find_among_b$esjava$1(sloveneStemmer.a_3);
                            if (among_var === 0) {
                                this.cursor = this.limit - v_6;
                                break lab4;
                            }
                            this.bra = this.cursor;
                            switch (among_var) {
                                case 0:
                                    this.cursor = this.limit - v_6;
                                    break lab4;
                                case 1:
                                    this.slice_del$esjava$0();
                                    break;
                            }
                        } while (false);
                        this.I_p1 = this.current.length();
                        v_7 = this.limit - this.cursor;
                        lab5: do {
                            if (!(this.I_p1 > 5)) {
                                this.cursor = this.limit - v_7;
                                break lab5;
                            }
                            this.ket = this.cursor;
                            among_var = this.find_among_b$esjava$1(sloveneStemmer.a_4);
                            if (among_var === 0) {
                                this.cursor = this.limit - v_7;
                                break lab5;
                            }
                            this.bra = this.cursor;
                            switch (among_var) {
                                case 0:
                                    this.cursor = this.limit - v_7;
                                    break lab5;
                                case 1:
                                    this.slice_del$esjava$0();
                                    break;
                            }
                        } while (false);
                        this.I_p1 = this.current.length();
                        v_8 = this.limit - this.cursor;
                        lab6: do {
                            if (!(this.I_p1 > 6)) {
                                this.cursor = this.limit - v_8;
                                break lab6;
                            }
                            this.ket = this.cursor;
                            if (!this.in_grouping_b$esjava$3(sloveneStemmer.g_soglasniki, 98, 382)) {
                                this.cursor = this.limit - v_8;
                                break lab6;
                            }
                            this.bra = this.cursor;
                            v_9 = this.limit - this.cursor;
                            if (!this.in_grouping_b$esjava$3(sloveneStemmer.g_soglasniki, 98, 382)) {
                                this.cursor = this.limit - v_8;
                                break lab6;
                            }
                            this.cursor = this.limit - v_9;
                            this.slice_del$esjava$0();
                        } while (false);
                        this.I_p1 = this.current.length();
                        v_10 = this.limit - this.cursor;
                        lab7: do {
                            if (!(this.I_p1 > 5)) {
                                this.cursor = this.limit - v_10;
                                break lab7;
                            }
                            this.ket = this.cursor;
                            among_var = this.find_among_b$esjava$1(sloveneStemmer.a_5);
                            if (among_var === 0) {
                                this.cursor = this.limit - v_10;
                                break lab7;
                            }
                            this.bra = this.cursor;
                            switch (among_var) {
                                case 0:
                                    this.cursor = this.limit - v_10;
                                    break lab7;
                                case 1:
                                    this.slice_del$esjava$0();
                                    break;
                            }
                        } while (false);
                    }
                } while (false);
                this.cursor = this.limit - v_1;
                this.cursor = this.limit_backward;
                return true;
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get46;

                for (var _len45 = arguments.length, args = Array(_len45), _key45 = 0; _key45 < _len45; _key45++) {
                    args[_key45] = arguments[_key45];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get46 = _get(Object.getPrototypeOf(sloveneStemmer.prototype), 'stem', this)).call.apply(_get46, [this].concat(args));
            }
        }, {
            key: 'I_p1',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p1') ? this._$esjava$I_p1 : this._$esjava$I_p1 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p1 = v;
            }
        }], [{
            key: 'a_0',
            get: function get() {
                delete sloveneStemmer.a_0;
                return sloveneStemmer.a_0 = [new Among("anski", -1, 1), new Among("evski", -1, 1), new Among("ovski", -1, 1)];
            }
        }, {
            key: 'a_1',
            get: function get() {
                delete sloveneStemmer.a_1;
                return sloveneStemmer.a_1 = [new Among("stvo", -1, 1), new Among('\u0161tvo', -1, 1)];
            }
        }, {
            key: 'a_2',
            get: function get() {
                delete sloveneStemmer.a_2;
                return sloveneStemmer.a_2 = [new Among("ega", -1, 1), new Among("ija", -1, 1), new Among("ila", -1, 1), new Among("ema", -1, 1), new Among("vna", -1, 1), new Among("ite", -1, 1), new Among("ste", -1, 1), new Among('\u0161\u010De', -1, 1), new Among("ski", -1, 1), new Among('\u0161ki', -1, 1), new Among("iti", -1, 1), new Among("ovi", -1, 1), new Among('\u010Dek', -1, 1), new Among("ovm", -1, 1), new Among('\u010Dan', -1, 1), new Among("len", -1, 1), new Among("ven", -1, 1), new Among('\u0161en', -1, 1), new Among("ejo", -1, 1), new Among("ijo", -1, 1), new Among("ast", -1, 1), new Among("ost", -1, 1)];
            }
        }, {
            key: 'a_3',
            get: function get() {
                delete sloveneStemmer.a_3;
                return sloveneStemmer.a_3 = [new Among("ja", -1, 1), new Among("ka", -1, 1), new Among("ma", -1, 1), new Among("ec", -1, 1), new Among("je", -1, 1), new Among("eg", -1, 1), new Among("eh", -1, 1), new Among("ih", -1, 1), new Among("mi", -1, 1), new Among("ti", -1, 1), new Among("ij", -1, 1), new Among("al", -1, 1), new Among("il", -1, 1), new Among("em", -1, 1), new Among("om", -1, 1), new Among("an", -1, 1), new Among("en", -1, 1), new Among("in", -1, 1), new Among("do", -1, 1), new Among("jo", -1, 1), new Among("ir", -1, 1), new Among("at", -1, 1), new Among("ev", -1, 1), new Among("iv", -1, 1), new Among("ov", -1, 1), new Among('o\u010D', -1, 1)];
            }
        }, {
            key: 'a_4',
            get: function get() {
                delete sloveneStemmer.a_4;
                return sloveneStemmer.a_4 = [new Among("a", -1, 1), new Among("c", -1, 1), new Among("e", -1, 1), new Among("i", -1, 1), new Among("m", -1, 1), new Among("o", -1, 1), new Among("u", -1, 1), new Among('\u0161', -1, 1)];
            }
        }, {
            key: 'a_5',
            get: function get() {
                delete sloveneStemmer.a_5;
                return sloveneStemmer.a_5 = [new Among("a", -1, 1), new Among("e", -1, 1), new Among("i", -1, 1), new Among("o", -1, 1), new Among("u", -1, 1)];
            }
        }, {
            key: 'g_soglasniki',
            get: function get() {
                delete sloveneStemmer.g_soglasniki;
                return sloveneStemmer.g_soglasniki = [119, 95, 23, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128, 0, 0, 0, 16];
            }
        }]);

        return sloveneStemmer;
    }(SnowballStemmer);

    var spanishStemmer = function (_SnowballStemmer21) {
        _inherits(spanishStemmer, _SnowballStemmer21);

        function spanishStemmer() {
            _classCallCheck(this, spanishStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(spanishStemmer).apply(this, arguments));
        }

        _createClass(spanishStemmer, [{
            key: 'r_mark_regions$esjava$0',
            value: function r_mark_regions$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_6 = void 0;
                var v_8 = void 0;
                this.I_pV = this.limit;
                this.I_p1 = this.limit;
                this.I_p2 = this.limit;
                v_1 = this.cursor;
                lab0: do {
                    lab1: do {
                        v_2 = this.cursor;
                        lab2: do {
                            if (!this.in_grouping$esjava$3(spanishStemmer.g_v, 97, 252)) {
                                break lab2;
                            }
                            lab3: do {
                                v_3 = this.cursor;
                                lab4: do {
                                    if (!this.out_grouping$esjava$3(spanishStemmer.g_v, 97, 252)) {
                                        break lab4;
                                    }
                                    golab5: while (true) {
                                        lab6: do {
                                            if (!this.in_grouping$esjava$3(spanishStemmer.g_v, 97, 252)) {
                                                break lab6;
                                            }
                                            break golab5;
                                        } while (false);
                                        if (this.cursor >= this.limit) {
                                            break lab4;
                                        }
                                        this.cursor++;
                                    }
                                    break lab3;
                                } while (false);
                                this.cursor = v_3;
                                if (!this.in_grouping$esjava$3(spanishStemmer.g_v, 97, 252)) {
                                    break lab2;
                                }
                                golab7: while (true) {
                                    lab8: do {
                                        if (!this.out_grouping$esjava$3(spanishStemmer.g_v, 97, 252)) {
                                            break lab8;
                                        }
                                        break golab7;
                                    } while (false);
                                    if (this.cursor >= this.limit) {
                                        break lab2;
                                    }
                                    this.cursor++;
                                }
                            } while (false);
                            break lab1;
                        } while (false);
                        this.cursor = v_2;
                        if (!this.out_grouping$esjava$3(spanishStemmer.g_v, 97, 252)) {
                            break lab0;
                        }
                        lab9: do {
                            v_6 = this.cursor;
                            lab10: do {
                                if (!this.out_grouping$esjava$3(spanishStemmer.g_v, 97, 252)) {
                                    break lab10;
                                }
                                golab11: while (true) {
                                    lab12: do {
                                        if (!this.in_grouping$esjava$3(spanishStemmer.g_v, 97, 252)) {
                                            break lab12;
                                        }
                                        break golab11;
                                    } while (false);
                                    if (this.cursor >= this.limit) {
                                        break lab10;
                                    }
                                    this.cursor++;
                                }
                                break lab9;
                            } while (false);
                            this.cursor = v_6;
                            if (!this.in_grouping$esjava$3(spanishStemmer.g_v, 97, 252)) {
                                break lab0;
                            }
                            if (this.cursor >= this.limit) {
                                break lab0;
                            }
                            this.cursor++;
                        } while (false);
                    } while (false);
                    this.I_pV = this.cursor;
                } while (false);
                this.cursor = v_1;
                v_8 = this.cursor;
                lab13: do {
                    golab14: while (true) {
                        lab15: do {
                            if (!this.in_grouping$esjava$3(spanishStemmer.g_v, 97, 252)) {
                                break lab15;
                            }
                            break golab14;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab13;
                        }
                        this.cursor++;
                    }
                    golab16: while (true) {
                        lab17: do {
                            if (!this.out_grouping$esjava$3(spanishStemmer.g_v, 97, 252)) {
                                break lab17;
                            }
                            break golab16;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab13;
                        }
                        this.cursor++;
                    }
                    this.I_p1 = this.cursor;
                    golab18: while (true) {
                        lab19: do {
                            if (!this.in_grouping$esjava$3(spanishStemmer.g_v, 97, 252)) {
                                break lab19;
                            }
                            break golab18;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab13;
                        }
                        this.cursor++;
                    }
                    golab20: while (true) {
                        lab21: do {
                            if (!this.out_grouping$esjava$3(spanishStemmer.g_v, 97, 252)) {
                                break lab21;
                            }
                            break golab20;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            break lab13;
                        }
                        this.cursor++;
                    }
                    this.I_p2 = this.cursor;
                } while (false);
                this.cursor = v_8;
                return true;
            }
        }, {
            key: 'r_postlude$esjava$0',
            value: function r_postlude$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                replab0: while (true) {
                    v_1 = this.cursor;
                    lab1: do {
                        this.bra = this.cursor;
                        among_var = this.find_among$esjava$1(spanishStemmer.a_0);
                        if (among_var === 0) {
                            break lab1;
                        }
                        this.ket = this.cursor;
                        switch (among_var) {
                            case 0:
                                break lab1;
                            case 1:
                                this.slice_from$esjava$1("a");
                                break;
                            case 2:
                                this.slice_from$esjava$1("e");
                                break;
                            case 3:
                                this.slice_from$esjava$1("i");
                                break;
                            case 4:
                                this.slice_from$esjava$1("o");
                                break;
                            case 5:
                                this.slice_from$esjava$1("u");
                                break;
                            case 6:
                                if (this.cursor >= this.limit) {
                                    break lab1;
                                }
                                this.cursor++;
                                break;
                        }
                        continue replab0;
                    } while (false);
                    this.cursor = v_1;
                    break replab0;
                }
                return true;
            }
        }, {
            key: 'r_RV$esjava$0',
            value: function r_RV$esjava$0() {
                if (!(this.I_pV <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_R1$esjava$0',
            value: function r_R1$esjava$0() {
                if (!(this.I_p1 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_R2$esjava$0',
            value: function r_R2$esjava$0() {
                if (!(this.I_p2 <= this.cursor)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_attached_pronoun$esjava$0',
            value: function r_attached_pronoun$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                if (this.find_among_b$esjava$1(spanishStemmer.a_1) === 0) {
                    return false;
                }
                this.bra = this.cursor;
                among_var = this.find_among_b$esjava$1(spanishStemmer.a_2);
                if (among_var === 0) {
                    return false;
                }
                if (!this.r_RV$esjava$0()) {
                    return false;
                }
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.bra = this.cursor;
                        this.slice_from$esjava$1("iendo");
                        break;
                    case 2:
                        this.bra = this.cursor;
                        this.slice_from$esjava$1("ando");
                        break;
                    case 3:
                        this.bra = this.cursor;
                        this.slice_from$esjava$1("ar");
                        break;
                    case 4:
                        this.bra = this.cursor;
                        this.slice_from$esjava$1("er");
                        break;
                    case 5:
                        this.bra = this.cursor;
                        this.slice_from$esjava$1("ir");
                        break;
                    case 6:
                        this.slice_del$esjava$0();
                        break;
                    case 7:
                        if (!this.eq_s_b$esjava$1("u")) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_standard_suffix$esjava$0',
            value: function r_standard_suffix$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(spanishStemmer.a_6);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        v_1 = this.limit - this.cursor;
                        lab0: do {
                            this.ket = this.cursor;
                            if (!this.eq_s_b$esjava$1("ic")) {
                                this.cursor = this.limit - v_1;
                                break lab0;
                            }
                            this.bra = this.cursor;
                            if (!this.r_R2$esjava$0()) {
                                this.cursor = this.limit - v_1;
                                break lab0;
                            }
                            this.slice_del$esjava$0();
                        } while (false);
                        break;
                    case 3:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_from$esjava$1("log");
                        break;
                    case 4:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_from$esjava$1("u");
                        break;
                    case 5:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_from$esjava$1("ente");
                        break;
                    case 6:
                        if (!this.r_R1$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        v_2 = this.limit - this.cursor;
                        lab1: do {
                            this.ket = this.cursor;
                            among_var = this.find_among_b$esjava$1(spanishStemmer.a_3);
                            if (among_var === 0) {
                                this.cursor = this.limit - v_2;
                                break lab1;
                            }
                            this.bra = this.cursor;
                            if (!this.r_R2$esjava$0()) {
                                this.cursor = this.limit - v_2;
                                break lab1;
                            }
                            this.slice_del$esjava$0();
                            switch (among_var) {
                                case 0:
                                    this.cursor = this.limit - v_2;
                                    break lab1;
                                case 1:
                                    this.ket = this.cursor;
                                    if (!this.eq_s_b$esjava$1("at")) {
                                        this.cursor = this.limit - v_2;
                                        break lab1;
                                    }
                                    this.bra = this.cursor;
                                    if (!this.r_R2$esjava$0()) {
                                        this.cursor = this.limit - v_2;
                                        break lab1;
                                    }
                                    this.slice_del$esjava$0();
                                    break;
                            }
                        } while (false);
                        break;
                    case 7:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        v_3 = this.limit - this.cursor;
                        lab2: do {
                            this.ket = this.cursor;
                            among_var = this.find_among_b$esjava$1(spanishStemmer.a_4);
                            if (among_var === 0) {
                                this.cursor = this.limit - v_3;
                                break lab2;
                            }
                            this.bra = this.cursor;
                            switch (among_var) {
                                case 0:
                                    this.cursor = this.limit - v_3;
                                    break lab2;
                                case 1:
                                    if (!this.r_R2$esjava$0()) {
                                        this.cursor = this.limit - v_3;
                                        break lab2;
                                    }
                                    this.slice_del$esjava$0();
                                    break;
                            }
                        } while (false);
                        break;
                    case 8:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        v_4 = this.limit - this.cursor;
                        lab3: do {
                            this.ket = this.cursor;
                            among_var = this.find_among_b$esjava$1(spanishStemmer.a_5);
                            if (among_var === 0) {
                                this.cursor = this.limit - v_4;
                                break lab3;
                            }
                            this.bra = this.cursor;
                            switch (among_var) {
                                case 0:
                                    this.cursor = this.limit - v_4;
                                    break lab3;
                                case 1:
                                    if (!this.r_R2$esjava$0()) {
                                        this.cursor = this.limit - v_4;
                                        break lab3;
                                    }
                                    this.slice_del$esjava$0();
                                    break;
                            }
                        } while (false);
                        break;
                    case 9:
                        if (!this.r_R2$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        v_5 = this.limit - this.cursor;
                        lab4: do {
                            this.ket = this.cursor;
                            if (!this.eq_s_b$esjava$1("at")) {
                                this.cursor = this.limit - v_5;
                                break lab4;
                            }
                            this.bra = this.cursor;
                            if (!this.r_R2$esjava$0()) {
                                this.cursor = this.limit - v_5;
                                break lab4;
                            }
                            this.slice_del$esjava$0();
                        } while (false);
                        break;
                }
                return true;
            }
        }, {
            key: 'r_y_verb_suffix$esjava$0',
            value: function r_y_verb_suffix$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                v_1 = this.limit - this.cursor;
                if (this.cursor < this.I_pV) {
                    return false;
                }
                this.cursor = this.I_pV;
                v_2 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_1;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(spanishStemmer.a_7);
                if (among_var === 0) {
                    this.limit_backward = v_2;
                    return false;
                }
                this.bra = this.cursor;
                this.limit_backward = v_2;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!this.eq_s_b$esjava$1("u")) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_verb_suffix$esjava$0',
            value: function r_verb_suffix$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                v_1 = this.limit - this.cursor;
                if (this.cursor < this.I_pV) {
                    return false;
                }
                this.cursor = this.I_pV;
                v_2 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_1;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(spanishStemmer.a_8);
                if (among_var === 0) {
                    this.limit_backward = v_2;
                    return false;
                }
                this.bra = this.cursor;
                this.limit_backward = v_2;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        v_3 = this.limit - this.cursor;
                        lab0: do {
                            if (!this.eq_s_b$esjava$1("u")) {
                                this.cursor = this.limit - v_3;
                                break lab0;
                            }
                            v_4 = this.limit - this.cursor;
                            if (!this.eq_s_b$esjava$1("g")) {
                                this.cursor = this.limit - v_3;
                                break lab0;
                            }
                            this.cursor = this.limit - v_4;
                        } while (false);
                        this.bra = this.cursor;
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_residual_suffix$esjava$0',
            value: function r_residual_suffix$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(spanishStemmer.a_9);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        if (!this.r_RV$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!this.r_RV$esjava$0()) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        v_1 = this.limit - this.cursor;
                        lab0: do {
                            this.ket = this.cursor;
                            if (!this.eq_s_b$esjava$1("u")) {
                                this.cursor = this.limit - v_1;
                                break lab0;
                            }
                            this.bra = this.cursor;
                            v_2 = this.limit - this.cursor;
                            if (!this.eq_s_b$esjava$1("g")) {
                                this.cursor = this.limit - v_1;
                                break lab0;
                            }
                            this.cursor = this.limit - v_2;
                            if (!this.r_RV$esjava$0()) {
                                this.cursor = this.limit - v_1;
                                break lab0;
                            }
                            this.slice_del$esjava$0();
                        } while (false);
                        break;
                }
                return true;
            }
        }, {
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                v_1 = this.cursor;
                lab0: do {
                    if (!this.r_mark_regions$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = v_1;
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                v_2 = this.limit - this.cursor;
                lab1: do {
                    if (!this.r_attached_pronoun$esjava$0()) {
                        break lab1;
                    }
                } while (false);
                this.cursor = this.limit - v_2;
                v_3 = this.limit - this.cursor;
                lab2: do {
                    lab3: do {
                        v_4 = this.limit - this.cursor;
                        lab4: do {
                            if (!this.r_standard_suffix$esjava$0()) {
                                break lab4;
                            }
                            break lab3;
                        } while (false);
                        this.cursor = this.limit - v_4;
                        lab5: do {
                            if (!this.r_y_verb_suffix$esjava$0()) {
                                break lab5;
                            }
                            break lab3;
                        } while (false);
                        this.cursor = this.limit - v_4;
                        if (!this.r_verb_suffix$esjava$0()) {
                            break lab2;
                        }
                    } while (false);
                } while (false);
                this.cursor = this.limit - v_3;
                v_5 = this.limit - this.cursor;
                lab6: do {
                    if (!this.r_residual_suffix$esjava$0()) {
                        break lab6;
                    }
                } while (false);
                this.cursor = this.limit - v_5;
                this.cursor = this.limit_backward;
                v_6 = this.cursor;
                lab7: do {
                    if (!this.r_postlude$esjava$0()) {
                        break lab7;
                    }
                } while (false);
                this.cursor = v_6;
                return true;
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get47;

                for (var _len46 = arguments.length, args = Array(_len46), _key46 = 0; _key46 < _len46; _key46++) {
                    args[_key46] = arguments[_key46];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get47 = _get(Object.getPrototypeOf(spanishStemmer.prototype), 'stem', this)).call.apply(_get47, [this].concat(args));
            }
        }, {
            key: 'I_p2',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p2') ? this._$esjava$I_p2 : this._$esjava$I_p2 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p2 = v;
            }
        }, {
            key: 'I_p1',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p1') ? this._$esjava$I_p1 : this._$esjava$I_p1 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p1 = v;
            }
        }, {
            key: 'I_pV',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_pV') ? this._$esjava$I_pV : this._$esjava$I_pV = 0;
            },
            set: function set(v) {
                this._$esjava$I_pV = v;
            }
        }], [{
            key: 'a_0',
            get: function get() {
                delete spanishStemmer.a_0;
                return spanishStemmer.a_0 = [new Among("", -1, 6), new Among('\u00E1', 0, 1), new Among('\u00E9', 0, 2), new Among('\u00ED', 0, 3), new Among('\u00F3', 0, 4), new Among('\u00FA', 0, 5)];
            }
        }, {
            key: 'a_1',
            get: function get() {
                delete spanishStemmer.a_1;
                return spanishStemmer.a_1 = [new Among("la", -1, -1), new Among("sela", 0, -1), new Among("le", -1, -1), new Among("me", -1, -1), new Among("se", -1, -1), new Among("lo", -1, -1), new Among("selo", 5, -1), new Among("las", -1, -1), new Among("selas", 7, -1), new Among("les", -1, -1), new Among("los", -1, -1), new Among("selos", 10, -1), new Among("nos", -1, -1)];
            }
        }, {
            key: 'a_2',
            get: function get() {
                delete spanishStemmer.a_2;
                return spanishStemmer.a_2 = [new Among("ando", -1, 6), new Among("iendo", -1, 6), new Among("yendo", -1, 7), new Among('\u00E1ndo', -1, 2), new Among('i\u00E9ndo', -1, 1), new Among("ar", -1, 6), new Among("er", -1, 6), new Among("ir", -1, 6), new Among('\u00E1r', -1, 3), new Among('\u00E9r', -1, 4), new Among('\u00EDr', -1, 5)];
            }
        }, {
            key: 'a_3',
            get: function get() {
                delete spanishStemmer.a_3;
                return spanishStemmer.a_3 = [new Among("ic", -1, -1), new Among("ad", -1, -1), new Among("os", -1, -1), new Among("iv", -1, 1)];
            }
        }, {
            key: 'a_4',
            get: function get() {
                delete spanishStemmer.a_4;
                return spanishStemmer.a_4 = [new Among("able", -1, 1), new Among("ible", -1, 1), new Among("ante", -1, 1)];
            }
        }, {
            key: 'a_5',
            get: function get() {
                delete spanishStemmer.a_5;
                return spanishStemmer.a_5 = [new Among("ic", -1, 1), new Among("abil", -1, 1), new Among("iv", -1, 1)];
            }
        }, {
            key: 'a_6',
            get: function get() {
                delete spanishStemmer.a_6;
                return spanishStemmer.a_6 = [new Among("ica", -1, 1), new Among("ancia", -1, 2), new Among("encia", -1, 5), new Among("adora", -1, 2), new Among("osa", -1, 1), new Among("ista", -1, 1), new Among("iva", -1, 9), new Among("anza", -1, 1), new Among('log\u00EDa', -1, 3), new Among("idad", -1, 8), new Among("able", -1, 1), new Among("ible", -1, 1), new Among("ante", -1, 2), new Among("mente", -1, 7), new Among("amente", 13, 6), new Among('aci\u00F3n', -1, 2), new Among('uci\u00F3n', -1, 4), new Among("ico", -1, 1), new Among("ismo", -1, 1), new Among("oso", -1, 1), new Among("amiento", -1, 1), new Among("imiento", -1, 1), new Among("ivo", -1, 9), new Among("ador", -1, 2), new Among("icas", -1, 1), new Among("ancias", -1, 2), new Among("encias", -1, 5), new Among("adoras", -1, 2), new Among("osas", -1, 1), new Among("istas", -1, 1), new Among("ivas", -1, 9), new Among("anzas", -1, 1), new Among('log\u00EDas', -1, 3), new Among("idades", -1, 8), new Among("ables", -1, 1), new Among("ibles", -1, 1), new Among("aciones", -1, 2), new Among("uciones", -1, 4), new Among("adores", -1, 2), new Among("antes", -1, 2), new Among("icos", -1, 1), new Among("ismos", -1, 1), new Among("osos", -1, 1), new Among("amientos", -1, 1), new Among("imientos", -1, 1), new Among("ivos", -1, 9)];
            }
        }, {
            key: 'a_7',
            get: function get() {
                delete spanishStemmer.a_7;
                return spanishStemmer.a_7 = [new Among("ya", -1, 1), new Among("ye", -1, 1), new Among("yan", -1, 1), new Among("yen", -1, 1), new Among("yeron", -1, 1), new Among("yendo", -1, 1), new Among("yo", -1, 1), new Among("yas", -1, 1), new Among("yes", -1, 1), new Among("yais", -1, 1), new Among("yamos", -1, 1), new Among('y\u00F3', -1, 1)];
            }
        }, {
            key: 'a_8',
            get: function get() {
                delete spanishStemmer.a_8;
                return spanishStemmer.a_8 = [new Among("aba", -1, 2), new Among("ada", -1, 2), new Among("ida", -1, 2), new Among("ara", -1, 2), new Among("iera", -1, 2), new Among('\u00EDa', -1, 2), new Among('ar\u00EDa', 5, 2), new Among('er\u00EDa', 5, 2), new Among('ir\u00EDa', 5, 2), new Among("ad", -1, 2), new Among("ed", -1, 2), new Among("id", -1, 2), new Among("ase", -1, 2), new Among("iese", -1, 2), new Among("aste", -1, 2), new Among("iste", -1, 2), new Among("an", -1, 2), new Among("aban", 16, 2), new Among("aran", 16, 2), new Among("ieran", 16, 2), new Among('\u00EDan', 16, 2), new Among('ar\u00EDan', 20, 2), new Among('er\u00EDan', 20, 2), new Among('ir\u00EDan', 20, 2), new Among("en", -1, 1), new Among("asen", 24, 2), new Among("iesen", 24, 2), new Among("aron", -1, 2), new Among("ieron", -1, 2), new Among('ar\u00E1n', -1, 2), new Among('er\u00E1n', -1, 2), new Among('ir\u00E1n', -1, 2), new Among("ado", -1, 2), new Among("ido", -1, 2), new Among("ando", -1, 2), new Among("iendo", -1, 2), new Among("ar", -1, 2), new Among("er", -1, 2), new Among("ir", -1, 2), new Among("as", -1, 2), new Among("abas", 39, 2), new Among("adas", 39, 2), new Among("idas", 39, 2), new Among("aras", 39, 2), new Among("ieras", 39, 2), new Among('\u00EDas', 39, 2), new Among('ar\u00EDas', 45, 2), new Among('er\u00EDas', 45, 2), new Among('ir\u00EDas', 45, 2), new Among("es", -1, 1), new Among("ases", 49, 2), new Among("ieses", 49, 2), new Among("abais", -1, 2), new Among("arais", -1, 2), new Among("ierais", -1, 2), new Among('\u00EDais', -1, 2), new Among('ar\u00EDais', 55, 2), new Among('er\u00EDais', 55, 2), new Among('ir\u00EDais', 55, 2), new Among("aseis", -1, 2), new Among("ieseis", -1, 2), new Among("asteis", -1, 2), new Among("isteis", -1, 2), new Among('\u00E1is', -1, 2), new Among('\u00E9is', -1, 1), new Among('ar\u00E9is', 64, 2), new Among('er\u00E9is', 64, 2), new Among('ir\u00E9is', 64, 2), new Among("ados", -1, 2), new Among("idos", -1, 2), new Among("amos", -1, 2), new Among('\u00E1bamos', 70, 2), new Among('\u00E1ramos', 70, 2), new Among('i\u00E9ramos', 70, 2), new Among('\u00EDamos', 70, 2), new Among('ar\u00EDamos', 74, 2), new Among('er\u00EDamos', 74, 2), new Among('ir\u00EDamos', 74, 2), new Among("emos", -1, 1), new Among("aremos", 78, 2), new Among("eremos", 78, 2), new Among("iremos", 78, 2), new Among('\u00E1semos', 78, 2), new Among('i\u00E9semos', 78, 2), new Among("imos", -1, 2), new Among('ar\u00E1s', -1, 2), new Among('er\u00E1s', -1, 2), new Among('ir\u00E1s', -1, 2), new Among('\u00EDs', -1, 2), new Among('ar\u00E1', -1, 2), new Among('er\u00E1', -1, 2), new Among('ir\u00E1', -1, 2), new Among('ar\u00E9', -1, 2), new Among('er\u00E9', -1, 2), new Among('ir\u00E9', -1, 2), new Among('i\u00F3', -1, 2)];
            }
        }, {
            key: 'a_9',
            get: function get() {
                delete spanishStemmer.a_9;
                return spanishStemmer.a_9 = [new Among("a", -1, 1), new Among("e", -1, 2), new Among("o", -1, 1), new Among("os", -1, 1), new Among('\u00E1', -1, 1), new Among('\u00E9', -1, 2), new Among('\u00ED', -1, 1), new Among('\u00F3', -1, 1)];
            }
        }, {
            key: 'g_v',
            get: function get() {
                delete spanishStemmer.g_v;
                return spanishStemmer.g_v = [17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 17, 4, 10];
            }
        }]);

        return spanishStemmer;
    }(SnowballStemmer);

    var swedishStemmer = function (_SnowballStemmer22) {
        _inherits(swedishStemmer, _SnowballStemmer22);

        function swedishStemmer() {
            _classCallCheck(this, swedishStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(swedishStemmer).apply(this, arguments));
        }

        _createClass(swedishStemmer, [{
            key: 'r_mark_regions$esjava$0',
            value: function r_mark_regions$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                this.I_p1 = this.limit;
                v_1 = this.cursor;
                {
                    var c = this.cursor + 3;
                    if (0 > c || c > this.limit) {
                        return false;
                    }
                    this.cursor = c;
                }
                this.I_x = this.cursor;
                this.cursor = v_1;
                golab0: while (true) {
                    v_2 = this.cursor;
                    lab1: do {
                        if (!this.in_grouping$esjava$3(swedishStemmer.g_v, 97, 246)) {
                            break lab1;
                        }
                        this.cursor = v_2;
                        break golab0;
                    } while (false);
                    this.cursor = v_2;
                    if (this.cursor >= this.limit) {
                        return false;
                    }
                    this.cursor++;
                }
                golab2: while (true) {
                    lab3: do {
                        if (!this.out_grouping$esjava$3(swedishStemmer.g_v, 97, 246)) {
                            break lab3;
                        }
                        break golab2;
                    } while (false);
                    if (this.cursor >= this.limit) {
                        return false;
                    }
                    this.cursor++;
                }
                this.I_p1 = this.cursor;
                lab4: do {
                    if (!(this.I_p1 < this.I_x)) {
                        break lab4;
                    }
                    this.I_p1 = this.I_x;
                } while (false);
                return true;
            }
        }, {
            key: 'r_main_suffix$esjava$0',
            value: function r_main_suffix$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                v_1 = this.limit - this.cursor;
                if (this.cursor < this.I_p1) {
                    return false;
                }
                this.cursor = this.I_p1;
                v_2 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_1;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(swedishStemmer.a_0);
                if (among_var === 0) {
                    this.limit_backward = v_2;
                    return false;
                }
                this.bra = this.cursor;
                this.limit_backward = v_2;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        if (!this.in_grouping_b$esjava$3(swedishStemmer.g_s_ending, 98, 121)) {
                            return false;
                        }
                        this.slice_del$esjava$0();
                        break;
                }
                return true;
            }
        }, {
            key: 'r_consonant_pair$esjava$0',
            value: function r_consonant_pair$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                v_1 = this.limit - this.cursor;
                if (this.cursor < this.I_p1) {
                    return false;
                }
                this.cursor = this.I_p1;
                v_2 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_1;
                v_3 = this.limit - this.cursor;
                if (this.find_among_b$esjava$1(swedishStemmer.a_1) === 0) {
                    this.limit_backward = v_2;
                    return false;
                }
                this.cursor = this.limit - v_3;
                this.ket = this.cursor;
                if (this.cursor <= this.limit_backward) {
                    this.limit_backward = v_2;
                    return false;
                }
                this.cursor--;
                this.bra = this.cursor;
                this.slice_del$esjava$0();
                this.limit_backward = v_2;
                return true;
            }
        }, {
            key: 'r_other_suffix$esjava$0',
            value: function r_other_suffix$esjava$0() {
                var among_var = void 0;
                var v_1 = void 0;
                var v_2 = void 0;
                v_1 = this.limit - this.cursor;
                if (this.cursor < this.I_p1) {
                    return false;
                }
                this.cursor = this.I_p1;
                v_2 = this.limit_backward;
                this.limit_backward = this.cursor;
                this.cursor = this.limit - v_1;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(swedishStemmer.a_2);
                if (among_var === 0) {
                    this.limit_backward = v_2;
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        this.limit_backward = v_2;
                        return false;
                    case 1:
                        this.slice_del$esjava$0();
                        break;
                    case 2:
                        this.slice_from$esjava$1('l\u00F6s');
                        break;
                    case 3:
                        this.slice_from$esjava$1("full");
                        break;
                }
                this.limit_backward = v_2;
                return true;
            }
        }, {
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                v_1 = this.cursor;
                lab0: do {
                    if (!this.r_mark_regions$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = v_1;
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                v_2 = this.limit - this.cursor;
                lab1: do {
                    if (!this.r_main_suffix$esjava$0()) {
                        break lab1;
                    }
                } while (false);
                this.cursor = this.limit - v_2;
                v_3 = this.limit - this.cursor;
                lab2: do {
                    if (!this.r_consonant_pair$esjava$0()) {
                        break lab2;
                    }
                } while (false);
                this.cursor = this.limit - v_3;
                v_4 = this.limit - this.cursor;
                lab3: do {
                    if (!this.r_other_suffix$esjava$0()) {
                        break lab3;
                    }
                } while (false);
                this.cursor = this.limit - v_4;
                this.cursor = this.limit_backward;
                return true;
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get48;

                for (var _len47 = arguments.length, args = Array(_len47), _key47 = 0; _key47 < _len47; _key47++) {
                    args[_key47] = arguments[_key47];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get48 = _get(Object.getPrototypeOf(swedishStemmer.prototype), 'stem', this)).call.apply(_get48, [this].concat(args));
            }
        }, {
            key: 'I_x',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_x') ? this._$esjava$I_x : this._$esjava$I_x = 0;
            },
            set: function set(v) {
                this._$esjava$I_x = v;
            }
        }, {
            key: 'I_p1',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_p1') ? this._$esjava$I_p1 : this._$esjava$I_p1 = 0;
            },
            set: function set(v) {
                this._$esjava$I_p1 = v;
            }
        }], [{
            key: 'a_0',
            get: function get() {
                delete swedishStemmer.a_0;
                return swedishStemmer.a_0 = [new Among("a", -1, 1), new Among("arna", 0, 1), new Among("erna", 0, 1), new Among("heterna", 2, 1), new Among("orna", 0, 1), new Among("ad", -1, 1), new Among("e", -1, 1), new Among("ade", 6, 1), new Among("ande", 6, 1), new Among("arne", 6, 1), new Among("are", 6, 1), new Among("aste", 6, 1), new Among("en", -1, 1), new Among("anden", 12, 1), new Among("aren", 12, 1), new Among("heten", 12, 1), new Among("ern", -1, 1), new Among("ar", -1, 1), new Among("er", -1, 1), new Among("heter", 18, 1), new Among("or", -1, 1), new Among("s", -1, 2), new Among("as", 21, 1), new Among("arnas", 22, 1), new Among("ernas", 22, 1), new Among("ornas", 22, 1), new Among("es", 21, 1), new Among("ades", 26, 1), new Among("andes", 26, 1), new Among("ens", 21, 1), new Among("arens", 29, 1), new Among("hetens", 29, 1), new Among("erns", 21, 1), new Among("at", -1, 1), new Among("andet", -1, 1), new Among("het", -1, 1), new Among("ast", -1, 1)];
            }
        }, {
            key: 'a_1',
            get: function get() {
                delete swedishStemmer.a_1;
                return swedishStemmer.a_1 = [new Among("dd", -1, -1), new Among("gd", -1, -1), new Among("nn", -1, -1), new Among("dt", -1, -1), new Among("gt", -1, -1), new Among("kt", -1, -1), new Among("tt", -1, -1)];
            }
        }, {
            key: 'a_2',
            get: function get() {
                delete swedishStemmer.a_2;
                return swedishStemmer.a_2 = [new Among("ig", -1, 1), new Among("lig", 0, 1), new Among("els", -1, 1), new Among("fullt", -1, 3), new Among('l\u00F6st', -1, 2)];
            }
        }, {
            key: 'g_v',
            get: function get() {
                delete swedishStemmer.g_v;
                return swedishStemmer.g_v = [17, 65, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 0, 32];
            }
        }, {
            key: 'g_s_ending',
            get: function get() {
                delete swedishStemmer.g_s_ending;
                return swedishStemmer.g_s_ending = [119, 127, 149];
            }
        }]);

        return swedishStemmer;
    }(SnowballStemmer);

    var tamilStemmer = function (_SnowballStemmer23) {
        _inherits(tamilStemmer, _SnowballStemmer23);

        function tamilStemmer() {
            _classCallCheck(this, tamilStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(tamilStemmer).apply(this, arguments));
        }

        _createClass(tamilStemmer, [{
            key: 'r_has_min_length$esjava$0',
            value: function r_has_min_length$esjava$0() {
                this.I_length = this.current.length();
                if (!(this.I_length > 4)) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_fix_va_start$esjava$0',
            value: function r_fix_va_start$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                var v_8 = void 0;
                var v_9 = void 0;
                lab0: do {
                    v_1 = this.cursor;
                    lab1: do {
                        v_2 = this.cursor;
                        v_3 = this.cursor;
                        lab2: do {
                            if (!this.eq_s$esjava$1('\u0BB5\u0BCB')) {
                                this.cursor = v_3;
                                break lab2;
                            }
                        } while (false);
                        this.cursor = v_2;
                        this.bra = this.cursor;
                        if (!this.eq_s$esjava$1('\u0BB5\u0BCB')) {
                            break lab1;
                        }
                        this.ket = this.cursor;
                        this.slice_from$esjava$1('\u0B93');
                        break lab0;
                    } while (false);
                    this.cursor = v_1;
                    lab3: do {
                        v_4 = this.cursor;
                        v_5 = this.cursor;
                        lab4: do {
                            if (!this.eq_s$esjava$1('\u0BB5\u0BCA')) {
                                this.cursor = v_5;
                                break lab4;
                            }
                        } while (false);
                        this.cursor = v_4;
                        this.bra = this.cursor;
                        if (!this.eq_s$esjava$1('\u0BB5\u0BCA')) {
                            break lab3;
                        }
                        this.ket = this.cursor;
                        this.slice_from$esjava$1('\u0B92');
                        break lab0;
                    } while (false);
                    this.cursor = v_1;
                    lab5: do {
                        v_6 = this.cursor;
                        v_7 = this.cursor;
                        lab6: do {
                            if (!this.eq_s$esjava$1('\u0BB5\u0BC1')) {
                                this.cursor = v_7;
                                break lab6;
                            }
                        } while (false);
                        this.cursor = v_6;
                        this.bra = this.cursor;
                        if (!this.eq_s$esjava$1('\u0BB5\u0BC1')) {
                            break lab5;
                        }
                        this.ket = this.cursor;
                        this.slice_from$esjava$1('\u0B89');
                        break lab0;
                    } while (false);
                    this.cursor = v_1;
                    v_8 = this.cursor;
                    v_9 = this.cursor;
                    lab7: do {
                        if (!this.eq_s$esjava$1('\u0BB5\u0BC2')) {
                            this.cursor = v_9;
                            break lab7;
                        }
                    } while (false);
                    this.cursor = v_8;
                    this.bra = this.cursor;
                    if (!this.eq_s$esjava$1('\u0BB5\u0BC2')) {
                        return false;
                    }
                    this.ket = this.cursor;
                    this.slice_from$esjava$1('\u0B8A');
                } while (false);
                return true;
            }
        }, {
            key: 'r_fix_endings$esjava$0',
            value: function r_fix_endings$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                this.B_found_wrong_ending = true;
                replab0: while (true) {
                    v_1 = this.cursor;
                    lab1: do {
                        if (!this.B_found_wrong_ending) {
                            break lab1;
                        }
                        v_2 = this.cursor;
                        lab2: do {
                            if (!this.r_fix_ending$esjava$0()) {
                                break lab2;
                            }
                        } while (false);
                        this.cursor = v_2;
                        continue replab0;
                    } while (false);
                    this.cursor = v_1;
                    break replab0;
                }
                return true;
            }
        }, {
            key: 'r_remove_question_prefixes$esjava$0',
            value: function r_remove_question_prefixes$esjava$0() {
                var v_1 = void 0;
                this.bra = this.cursor;
                if (!this.eq_s$esjava$1('\u0B8E')) {
                    return false;
                }
                if (this.find_among$esjava$1(tamilStemmer.a_0) === 0) {
                    return false;
                }
                if (!this.eq_s$esjava$1('\u0BCD')) {
                    return false;
                }
                this.ket = this.cursor;
                this.slice_del$esjava$0();
                v_1 = this.cursor;
                lab0: do {
                    if (!this.r_fix_va_start$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = v_1;
                return true;
            }
        }, {
            key: 'r_fix_ending$esjava$0',
            value: function r_fix_ending$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                var v_8 = void 0;
                var v_9 = void 0;
                var v_10 = void 0;
                var v_11 = void 0;
                var v_12 = void 0;
                var v_13 = void 0;
                this.B_found_wrong_ending = false;
                this.I_length = this.current.length();
                if (!(this.I_length > 3)) {
                    return false;
                }
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                lab0: do {
                    v_1 = this.limit - this.cursor;
                    lab1: do {
                        this.ket = this.cursor;
                        if (this.find_among_b$esjava$1(tamilStemmer.a_1) === 0) {
                            break lab1;
                        }
                        this.bra = this.cursor;
                        this.slice_del$esjava$0();
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab2: do {
                        this.ket = this.cursor;
                        if (!this.eq_s_b$esjava$1('\u0BAF\u0BCD')) {
                            break lab2;
                        }
                        v_2 = this.limit - this.cursor;
                        if (this.find_among_b$esjava$1(tamilStemmer.a_2) === 0) {
                            break lab2;
                        }
                        this.cursor = this.limit - v_2;
                        this.bra = this.cursor;
                        this.slice_del$esjava$0();
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab3: do {
                        this.ket = this.cursor;
                        lab4: do {
                            v_3 = this.limit - this.cursor;
                            lab5: do {
                                if (!this.eq_s_b$esjava$1('\u0B9F\u0BCD\u0BAA\u0BCD')) {
                                    break lab5;
                                }
                                break lab4;
                            } while (false);
                            this.cursor = this.limit - v_3;
                            if (!this.eq_s_b$esjava$1('\u0B9F\u0BCD\u0B95\u0BCD')) {
                                break lab3;
                            }
                        } while (false);
                        this.bra = this.cursor;
                        this.slice_from$esjava$1('\u0BB3\u0BCD');
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab6: do {
                        this.ket = this.cursor;
                        if (!this.eq_s_b$esjava$1('\u0BA9\u0BCD\u0BB1\u0BCD')) {
                            break lab6;
                        }
                        this.bra = this.cursor;
                        this.slice_from$esjava$1('\u0BB2\u0BCD');
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab7: do {
                        this.ket = this.cursor;
                        if (!this.eq_s_b$esjava$1('\u0BB1\u0BCD\u0B95\u0BCD')) {
                            break lab7;
                        }
                        this.bra = this.cursor;
                        this.slice_from$esjava$1('\u0BB2\u0BCD');
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab8: do {
                        this.ket = this.cursor;
                        if (!this.eq_s_b$esjava$1('\u0B9F\u0BCD\u0B9F\u0BCD')) {
                            break lab8;
                        }
                        this.bra = this.cursor;
                        this.slice_from$esjava$1('\u0B9F\u0BC1');
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab9: do {
                        if (!this.B_found_vetrumai_urupu) {
                            break lab9;
                        }
                        this.ket = this.cursor;
                        if (!this.eq_s_b$esjava$1('\u0BA4\u0BCD\u0BA4\u0BCD')) {
                            break lab9;
                        }
                        v_4 = this.limit - this.cursor;
                        {
                            v_5 = this.limit - this.cursor;
                            lab10: do {
                                if (!this.eq_s_b$esjava$1('\u0BC8')) {
                                    break lab10;
                                }
                                break lab9;
                            } while (false);
                            this.cursor = this.limit - v_5;
                        }
                        this.cursor = this.limit - v_4;
                        this.bra = this.cursor;
                        this.slice_from$esjava$1('\u0BAE\u0BCD');
                        this.bra = this.cursor;
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab11: do {
                        this.ket = this.cursor;
                        lab12: do {
                            v_6 = this.limit - this.cursor;
                            lab13: do {
                                if (!this.eq_s_b$esjava$1('\u0BC1\u0B95\u0BCD')) {
                                    break lab13;
                                }
                                break lab12;
                            } while (false);
                            this.cursor = this.limit - v_6;
                            if (!this.eq_s_b$esjava$1('\u0BC1\u0B95\u0BCD\u0B95\u0BCD')) {
                                break lab11;
                            }
                        } while (false);
                        this.bra = this.cursor;
                        this.slice_from$esjava$1('\u0BCD');
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab14: do {
                        this.ket = this.cursor;
                        if (!this.eq_s_b$esjava$1('\u0BCD')) {
                            break lab14;
                        }
                        if (this.find_among_b$esjava$1(tamilStemmer.a_3) === 0) {
                            break lab14;
                        }
                        if (!this.eq_s_b$esjava$1('\u0BCD')) {
                            break lab14;
                        }
                        if (this.find_among_b$esjava$1(tamilStemmer.a_4) === 0) {
                            break lab14;
                        }
                        this.bra = this.cursor;
                        this.slice_del$esjava$0();
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab15: do {
                        this.ket = this.cursor;
                        if (!this.eq_s_b$esjava$1('\u0BC1\u0B95\u0BCD')) {
                            break lab15;
                        }
                        this.bra = this.cursor;
                        this.slice_from$esjava$1('\u0BCD');
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab16: do {
                        this.ket = this.cursor;
                        if (!this.eq_s_b$esjava$1('\u0BCD')) {
                            break lab16;
                        }
                        if (this.find_among_b$esjava$1(tamilStemmer.a_5) === 0) {
                            break lab16;
                        }
                        this.bra = this.cursor;
                        this.slice_del$esjava$0();
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab17: do {
                        this.ket = this.cursor;
                        if (!this.eq_s_b$esjava$1('\u0BCD')) {
                            break lab17;
                        }
                        lab18: do {
                            v_7 = this.limit - this.cursor;
                            lab19: do {
                                if (this.find_among_b$esjava$1(tamilStemmer.a_6) === 0) {
                                    break lab19;
                                }
                                break lab18;
                            } while (false);
                            this.cursor = this.limit - v_7;
                            if (this.find_among_b$esjava$1(tamilStemmer.a_7) === 0) {
                                break lab17;
                            }
                        } while (false);
                        if (!this.eq_s_b$esjava$1('\u0BCD')) {
                            break lab17;
                        }
                        this.bra = this.cursor;
                        this.slice_from$esjava$1('\u0BCD');
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab20: do {
                        this.ket = this.cursor;
                        if (this.find_among_b$esjava$1(tamilStemmer.a_8) === 0) {
                            break lab20;
                        }
                        this.bra = this.cursor;
                        this.slice_del$esjava$0();
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab21: do {
                        this.ket = this.cursor;
                        if (!this.eq_s_b$esjava$1('\u0BA9\u0BC1')) {
                            break lab21;
                        }
                        v_8 = this.limit - this.cursor;
                        {
                            v_9 = this.limit - this.cursor;
                            lab22: do {
                                if (this.find_among_b$esjava$1(tamilStemmer.a_9) === 0) {
                                    break lab22;
                                }
                                break lab21;
                            } while (false);
                            this.cursor = this.limit - v_9;
                        }
                        this.cursor = this.limit - v_8;
                        this.bra = this.cursor;
                        this.slice_del$esjava$0();
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab23: do {
                        this.ket = this.cursor;
                        if (!this.eq_s_b$esjava$1('\u0B99\u0BCD')) {
                            break lab23;
                        }
                        v_10 = this.limit - this.cursor;
                        {
                            v_11 = this.limit - this.cursor;
                            lab24: do {
                                if (!this.eq_s_b$esjava$1('\u0BC8')) {
                                    break lab24;
                                }
                                break lab23;
                            } while (false);
                            this.cursor = this.limit - v_11;
                        }
                        this.cursor = this.limit - v_10;
                        this.bra = this.cursor;
                        this.slice_from$esjava$1('\u0BAE\u0BCD');
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab25: do {
                        this.ket = this.cursor;
                        if (!this.eq_s_b$esjava$1('\u0B99\u0BCD')) {
                            break lab25;
                        }
                        this.bra = this.cursor;
                        this.slice_del$esjava$0();
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    this.ket = this.cursor;
                    if (!this.eq_s_b$esjava$1('\u0BCD')) {
                        return false;
                    }
                    v_12 = this.limit - this.cursor;
                    lab26: do {
                        v_13 = this.limit - this.cursor;
                        lab27: do {
                            if (this.find_among_b$esjava$1(tamilStemmer.a_10) === 0) {
                                break lab27;
                            }
                            break lab26;
                        } while (false);
                        this.cursor = this.limit - v_13;
                        if (!this.eq_s_b$esjava$1('\u0BCD')) {
                            return false;
                        }
                    } while (false);
                    this.cursor = this.limit - v_12;
                    this.bra = this.cursor;
                    this.slice_del$esjava$0();
                } while (false);
                this.cursor = this.limit_backward;
                this.B_found_wrong_ending = true;
                return true;
            }
        }, {
            key: 'r_remove_pronoun_prefixes$esjava$0',
            value: function r_remove_pronoun_prefixes$esjava$0() {
                var v_1 = void 0;
                this.B_found_a_match = false;
                this.bra = this.cursor;
                if (this.find_among$esjava$1(tamilStemmer.a_11) === 0) {
                    return false;
                }
                if (this.find_among$esjava$1(tamilStemmer.a_12) === 0) {
                    return false;
                }
                if (!this.eq_s$esjava$1('\u0BCD')) {
                    return false;
                }
                this.ket = this.cursor;
                this.slice_del$esjava$0();
                this.B_found_a_match = true;
                v_1 = this.cursor;
                lab0: do {
                    if (!this.r_fix_va_start$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = v_1;
                return true;
            }
        }, {
            key: 'r_remove_plural_suffix$esjava$0',
            value: function r_remove_plural_suffix$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                this.B_found_a_match = false;
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                lab0: do {
                    v_1 = this.limit - this.cursor;
                    lab1: do {
                        this.ket = this.cursor;
                        if (!this.eq_s_b$esjava$1('\u0BC1\u0B99\u0BCD\u0B95\u0BB3\u0BCD')) {
                            break lab1;
                        }
                        v_2 = this.limit - this.cursor;
                        {
                            v_3 = this.limit - this.cursor;
                            lab2: do {
                                if (this.find_among_b$esjava$1(tamilStemmer.a_13) === 0) {
                                    break lab2;
                                }
                                break lab1;
                            } while (false);
                            this.cursor = this.limit - v_3;
                        }
                        this.cursor = this.limit - v_2;
                        this.bra = this.cursor;
                        this.slice_from$esjava$1('\u0BCD');
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab3: do {
                        this.ket = this.cursor;
                        if (!this.eq_s_b$esjava$1('\u0BB1\u0BCD\u0B95\u0BB3\u0BCD')) {
                            break lab3;
                        }
                        this.bra = this.cursor;
                        this.slice_from$esjava$1('\u0BB2\u0BCD');
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab4: do {
                        this.ket = this.cursor;
                        if (!this.eq_s_b$esjava$1('\u0B9F\u0BCD\u0B95\u0BB3\u0BCD')) {
                            break lab4;
                        }
                        this.bra = this.cursor;
                        this.slice_from$esjava$1('\u0BB3\u0BCD');
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    this.ket = this.cursor;
                    if (!this.eq_s_b$esjava$1('\u0B95\u0BB3\u0BCD')) {
                        return false;
                    }
                    this.bra = this.cursor;
                    this.slice_del$esjava$0();
                } while (false);
                this.B_found_a_match = true;
                this.cursor = this.limit_backward;
                return true;
            }
        }, {
            key: 'r_remove_question_suffixes$esjava$0',
            value: function r_remove_question_suffixes$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                if (!this.r_has_min_length$esjava$0()) {
                    return false;
                }
                this.B_found_a_match = false;
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                v_1 = this.limit - this.cursor;
                lab0: do {
                    this.ket = this.cursor;
                    if (this.find_among_b$esjava$1(tamilStemmer.a_14) === 0) {
                        break lab0;
                    }
                    this.bra = this.cursor;
                    this.slice_from$esjava$1('\u0BCD');
                    this.B_found_a_match = true;
                } while (false);
                this.cursor = this.limit - v_1;
                this.cursor = this.limit_backward;
                v_2 = this.cursor;
                lab1: do {
                    if (!this.r_fix_endings$esjava$0()) {
                        break lab1;
                    }
                } while (false);
                this.cursor = v_2;
                return true;
            }
        }, {
            key: 'r_remove_command_suffixes$esjava$0',
            value: function r_remove_command_suffixes$esjava$0() {
                if (!this.r_has_min_length$esjava$0()) {
                    return false;
                }
                this.B_found_a_match = false;
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                this.ket = this.cursor;
                if (this.find_among_b$esjava$1(tamilStemmer.a_15) === 0) {
                    return false;
                }
                this.bra = this.cursor;
                this.slice_del$esjava$0();
                this.B_found_a_match = true;
                this.cursor = this.limit_backward;
                return true;
            }
        }, {
            key: 'r_remove_um$esjava$0',
            value: function r_remove_um$esjava$0() {
                var v_1 = void 0;
                this.B_found_a_match = false;
                if (!this.r_has_min_length$esjava$0()) {
                    return false;
                }
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                this.ket = this.cursor;
                if (!this.eq_s_b$esjava$1('\u0BC1\u0BAE\u0BCD')) {
                    return false;
                }
                this.bra = this.cursor;
                this.slice_from$esjava$1('\u0BCD');
                this.B_found_a_match = true;
                this.cursor = this.limit_backward;
                v_1 = this.cursor;
                lab0: do {
                    if (!this.r_fix_ending$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = v_1;
                return true;
            }
        }, {
            key: 'r_remove_common_word_endings$esjava$0',
            value: function r_remove_common_word_endings$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                this.B_found_a_match = false;
                if (!this.r_has_min_length$esjava$0()) {
                    return false;
                }
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                lab0: do {
                    v_1 = this.limit - this.cursor;
                    lab1: do {
                        v_2 = this.limit - this.cursor;
                        this.ket = this.cursor;
                        lab2: do {
                            v_3 = this.limit - this.cursor;
                            lab3: do {
                                if (!this.eq_s_b$esjava$1('\u0BC1\u0B9F\u0BA9\u0BCD')) {
                                    break lab3;
                                }
                                break lab2;
                            } while (false);
                            this.cursor = this.limit - v_3;
                            lab4: do {
                                if (!this.eq_s_b$esjava$1('\u0BBF\u0BB2\u0BCD\u0BB2\u0BC8')) {
                                    break lab4;
                                }
                                break lab2;
                            } while (false);
                            this.cursor = this.limit - v_3;
                            lab5: do {
                                if (!this.eq_s_b$esjava$1('\u0BBF\u0B9F\u0BAE\u0BCD')) {
                                    break lab5;
                                }
                                break lab2;
                            } while (false);
                            this.cursor = this.limit - v_3;
                            lab6: do {
                                if (!this.eq_s_b$esjava$1('\u0BBF\u0BA9\u0BCD\u0BB1\u0BBF')) {
                                    break lab6;
                                }
                                break lab2;
                            } while (false);
                            this.cursor = this.limit - v_3;
                            lab7: do {
                                if (!this.eq_s_b$esjava$1('\u0BBE\u0B95\u0BBF')) {
                                    break lab7;
                                }
                                break lab2;
                            } while (false);
                            this.cursor = this.limit - v_3;
                            lab8: do {
                                if (!this.eq_s_b$esjava$1('\u0BBE\u0B95\u0BBF\u0BAF')) {
                                    break lab8;
                                }
                                break lab2;
                            } while (false);
                            this.cursor = this.limit - v_3;
                            lab9: do {
                                if (!this.eq_s_b$esjava$1('\u0BC6\u0BA9\u0BCD\u0BB1\u0BC1')) {
                                    break lab9;
                                }
                                break lab2;
                            } while (false);
                            this.cursor = this.limit - v_3;
                            lab10: do {
                                if (!this.eq_s_b$esjava$1('\u0BC1\u0BB3\u0BCD\u0BB3')) {
                                    break lab10;
                                }
                                break lab2;
                            } while (false);
                            this.cursor = this.limit - v_3;
                            lab11: do {
                                if (!this.eq_s_b$esjava$1('\u0BC1\u0B9F\u0BC8\u0BAF')) {
                                    break lab11;
                                }
                                break lab2;
                            } while (false);
                            this.cursor = this.limit - v_3;
                            lab12: do {
                                if (!this.eq_s_b$esjava$1('\u0BC1\u0B9F\u0BC8')) {
                                    break lab12;
                                }
                                break lab2;
                            } while (false);
                            this.cursor = this.limit - v_3;
                            lab13: do {
                                if (!this.eq_s_b$esjava$1('\u0BC6\u0BA9\u0BC1\u0BAE\u0BCD')) {
                                    break lab13;
                                }
                                break lab2;
                            } while (false);
                            this.cursor = this.limit - v_3;
                            lab14: do {
                                if (!this.eq_s_b$esjava$1('\u0BB2\u0BCD\u0BB2')) {
                                    break lab14;
                                }
                                v_4 = this.limit - this.cursor;
                                {
                                    v_5 = this.limit - this.cursor;
                                    lab15: do {
                                        if (this.find_among_b$esjava$1(tamilStemmer.a_16) === 0) {
                                            break lab15;
                                        }
                                        break lab14;
                                    } while (false);
                                    this.cursor = this.limit - v_5;
                                }
                                this.cursor = this.limit - v_4;
                                break lab2;
                            } while (false);
                            this.cursor = this.limit - v_3;
                            lab16: do {
                                if (!this.eq_s_b$esjava$1('\u0BC6\u0BA9')) {
                                    break lab16;
                                }
                                break lab2;
                            } while (false);
                            this.cursor = this.limit - v_3;
                            if (!this.eq_s_b$esjava$1('\u0BBE\u0B95\u0BBF')) {
                                break lab1;
                            }
                        } while (false);
                        this.bra = this.cursor;
                        this.slice_from$esjava$1('\u0BCD');
                        this.B_found_a_match = true;
                        this.cursor = this.limit - v_2;
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    v_6 = this.limit - this.cursor;
                    this.ket = this.cursor;
                    if (this.find_among_b$esjava$1(tamilStemmer.a_17) === 0) {
                        return false;
                    }
                    this.bra = this.cursor;
                    this.slice_del$esjava$0();
                    this.B_found_a_match = true;
                    this.cursor = this.limit - v_6;
                } while (false);
                this.cursor = this.limit_backward;
                v_7 = this.cursor;
                lab17: do {
                    if (!this.r_fix_endings$esjava$0()) {
                        break lab17;
                    }
                } while (false);
                this.cursor = v_7;
                return true;
            }
        }, {
            key: 'r_remove_vetrumai_urupukal$esjava$0',
            value: function r_remove_vetrumai_urupukal$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                var v_8 = void 0;
                var v_9 = void 0;
                var v_10 = void 0;
                var v_11 = void 0;
                var v_12 = void 0;
                var v_13 = void 0;
                var v_14 = void 0;
                var v_15 = void 0;
                var v_16 = void 0;
                var v_17 = void 0;
                var v_18 = void 0;
                var v_19 = void 0;
                var v_20 = void 0;
                var v_21 = void 0;
                this.B_found_a_match = false;
                this.B_found_vetrumai_urupu = false;
                if (!this.r_has_min_length$esjava$0()) {
                    return false;
                }
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                lab0: do {
                    v_1 = this.limit - this.cursor;
                    lab1: do {
                        v_2 = this.limit - this.cursor;
                        this.ket = this.cursor;
                        if (!this.eq_s_b$esjava$1('\u0BA9\u0BC8')) {
                            break lab1;
                        }
                        this.bra = this.cursor;
                        this.slice_del$esjava$0();
                        this.cursor = this.limit - v_2;
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab2: do {
                        v_3 = this.limit - this.cursor;
                        this.ket = this.cursor;
                        lab3: do {
                            v_4 = this.limit - this.cursor;
                            lab4: do {
                                lab5: do {
                                    v_5 = this.limit - this.cursor;
                                    lab6: do {
                                        if (!this.eq_s_b$esjava$1('\u0BBF\u0BA9\u0BC8')) {
                                            break lab6;
                                        }
                                        break lab5;
                                    } while (false);
                                    this.cursor = this.limit - v_5;
                                    if (!this.eq_s_b$esjava$1('\u0BC8')) {
                                        break lab4;
                                    }
                                } while (false);
                                v_6 = this.limit - this.cursor;
                                {
                                    v_7 = this.limit - this.cursor;
                                    lab7: do {
                                        if (this.find_among_b$esjava$1(tamilStemmer.a_18) === 0) {
                                            break lab7;
                                        }
                                        break lab4;
                                    } while (false);
                                    this.cursor = this.limit - v_7;
                                }
                                this.cursor = this.limit - v_6;
                                break lab3;
                            } while (false);
                            this.cursor = this.limit - v_4;
                            if (!this.eq_s_b$esjava$1('\u0BC8')) {
                                break lab2;
                            }
                            v_8 = this.limit - this.cursor;
                            if (this.find_among_b$esjava$1(tamilStemmer.a_19) === 0) {
                                break lab2;
                            }
                            if (!this.eq_s_b$esjava$1('\u0BCD')) {
                                break lab2;
                            }
                            this.cursor = this.limit - v_8;
                        } while (false);
                        this.bra = this.cursor;
                        this.slice_from$esjava$1('\u0BCD');
                        this.cursor = this.limit - v_3;
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab8: do {
                        v_9 = this.limit - this.cursor;
                        this.ket = this.cursor;
                        lab9: do {
                            v_10 = this.limit - this.cursor;
                            lab10: do {
                                if (!this.eq_s_b$esjava$1('\u0BCA\u0B9F\u0BC1')) {
                                    break lab10;
                                }
                                break lab9;
                            } while (false);
                            this.cursor = this.limit - v_10;
                            lab11: do {
                                if (!this.eq_s_b$esjava$1('\u0BCB\u0B9F\u0BC1')) {
                                    break lab11;
                                }
                                break lab9;
                            } while (false);
                            this.cursor = this.limit - v_10;
                            lab12: do {
                                if (!this.eq_s_b$esjava$1('\u0BBF\u0BB2\u0BCD')) {
                                    break lab12;
                                }
                                break lab9;
                            } while (false);
                            this.cursor = this.limit - v_10;
                            lab13: do {
                                if (!this.eq_s_b$esjava$1('\u0BBF\u0BB1\u0BCD')) {
                                    break lab13;
                                }
                                break lab9;
                            } while (false);
                            this.cursor = this.limit - v_10;
                            lab14: do {
                                if (!this.eq_s_b$esjava$1('\u0BBF\u0BA9\u0BCD')) {
                                    break lab14;
                                }
                                v_11 = this.limit - this.cursor;
                                {
                                    v_12 = this.limit - this.cursor;
                                    lab15: do {
                                        if (!this.eq_s_b$esjava$1('\u0BAE')) {
                                            break lab15;
                                        }
                                        break lab14;
                                    } while (false);
                                    this.cursor = this.limit - v_12;
                                }
                                this.cursor = this.limit - v_11;
                                break lab9;
                            } while (false);
                            this.cursor = this.limit - v_10;
                            lab16: do {
                                if (!this.eq_s_b$esjava$1('\u0BBF\u0BA9\u0BCD\u0BB1\u0BC1')) {
                                    break lab16;
                                }
                                break lab9;
                            } while (false);
                            this.cursor = this.limit - v_10;
                            lab17: do {
                                if (!this.eq_s_b$esjava$1('\u0BBF\u0BB0\u0BC1\u0BA8\u0BCD\u0BA4\u0BC1')) {
                                    break lab17;
                                }
                                break lab9;
                            } while (false);
                            this.cursor = this.limit - v_10;
                            lab18: do {
                                if (!this.eq_s_b$esjava$1('\u0BB5\u0BBF\u0B9F')) {
                                    break lab18;
                                }
                                break lab9;
                            } while (false);
                            this.cursor = this.limit - v_10;
                            lab19: do {
                                if (!(this.I_length >= 7)) {
                                    break lab19;
                                }
                                if (!this.eq_s_b$esjava$1('\u0BBF\u0B9F\u0BAE\u0BCD')) {
                                    break lab19;
                                }
                                break lab9;
                            } while (false);
                            this.cursor = this.limit - v_10;
                            lab20: do {
                                if (!this.eq_s_b$esjava$1('\u0BBE\u0BB2\u0BCD')) {
                                    break lab20;
                                }
                                break lab9;
                            } while (false);
                            this.cursor = this.limit - v_10;
                            lab21: do {
                                if (!this.eq_s_b$esjava$1('\u0BC1\u0B9F\u0BC8')) {
                                    break lab21;
                                }
                                break lab9;
                            } while (false);
                            this.cursor = this.limit - v_10;
                            lab22: do {
                                if (!this.eq_s_b$esjava$1('\u0BBE\u0BAE\u0BB2\u0BCD')) {
                                    break lab22;
                                }
                                break lab9;
                            } while (false);
                            this.cursor = this.limit - v_10;
                            lab23: do {
                                if (!this.eq_s_b$esjava$1('\u0BB2\u0BCD')) {
                                    break lab23;
                                }
                                v_13 = this.limit - this.cursor;
                                {
                                    v_14 = this.limit - this.cursor;
                                    lab24: do {
                                        if (this.find_among_b$esjava$1(tamilStemmer.a_20) === 0) {
                                            break lab24;
                                        }
                                        break lab23;
                                    } while (false);
                                    this.cursor = this.limit - v_14;
                                }
                                this.cursor = this.limit - v_13;
                                break lab9;
                            } while (false);
                            this.cursor = this.limit - v_10;
                            if (!this.eq_s_b$esjava$1('\u0BC1\u0BB3\u0BCD')) {
                                break lab8;
                            }
                        } while (false);
                        this.bra = this.cursor;
                        this.slice_from$esjava$1('\u0BCD');
                        this.cursor = this.limit - v_9;
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab25: do {
                        v_15 = this.limit - this.cursor;
                        this.ket = this.cursor;
                        lab26: do {
                            v_16 = this.limit - this.cursor;
                            lab27: do {
                                if (!this.eq_s_b$esjava$1('\u0B95\u0BA3\u0BCD')) {
                                    break lab27;
                                }
                                break lab26;
                            } while (false);
                            this.cursor = this.limit - v_16;
                            lab28: do {
                                if (!this.eq_s_b$esjava$1('\u0BAE\u0BC1\u0BA9\u0BCD')) {
                                    break lab28;
                                }
                                break lab26;
                            } while (false);
                            this.cursor = this.limit - v_16;
                            lab29: do {
                                if (!this.eq_s_b$esjava$1('\u0BAE\u0BC7\u0BB2\u0BCD')) {
                                    break lab29;
                                }
                                break lab26;
                            } while (false);
                            this.cursor = this.limit - v_16;
                            lab30: do {
                                if (!this.eq_s_b$esjava$1('\u0BAE\u0BC7\u0BB1\u0BCD')) {
                                    break lab30;
                                }
                                break lab26;
                            } while (false);
                            this.cursor = this.limit - v_16;
                            lab31: do {
                                if (!this.eq_s_b$esjava$1('\u0B95\u0BC0\u0BB4\u0BCD')) {
                                    break lab31;
                                }
                                break lab26;
                            } while (false);
                            this.cursor = this.limit - v_16;
                            lab32: do {
                                if (!this.eq_s_b$esjava$1('\u0BAA\u0BBF\u0BA9\u0BCD')) {
                                    break lab32;
                                }
                                break lab26;
                            } while (false);
                            this.cursor = this.limit - v_16;
                            if (!this.eq_s_b$esjava$1('\u0BA4\u0BC1')) {
                                break lab25;
                            }
                            v_17 = this.limit - this.cursor;
                            {
                                v_18 = this.limit - this.cursor;
                                lab33: do {
                                    if (this.find_among_b$esjava$1(tamilStemmer.a_21) === 0) {
                                        break lab33;
                                    }
                                    break lab25;
                                } while (false);
                                this.cursor = this.limit - v_18;
                            }
                            this.cursor = this.limit - v_17;
                        } while (false);
                        this.bra = this.cursor;
                        this.slice_del$esjava$0();
                        this.cursor = this.limit - v_15;
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    v_19 = this.limit - this.cursor;
                    this.ket = this.cursor;
                    if (!this.eq_s_b$esjava$1('\u0BC0')) {
                        return false;
                    }
                    this.bra = this.cursor;
                    this.slice_from$esjava$1('\u0BBF');
                    this.cursor = this.limit - v_19;
                } while (false);
                this.B_found_a_match = true;
                this.B_found_vetrumai_urupu = true;
                v_20 = this.limit - this.cursor;
                lab34: do {
                    this.ket = this.cursor;
                    if (!this.eq_s_b$esjava$1('\u0BBF\u0BA9\u0BCD')) {
                        break lab34;
                    }
                    this.bra = this.cursor;
                    this.slice_from$esjava$1('\u0BCD');
                } while (false);
                this.cursor = this.limit - v_20;
                this.cursor = this.limit_backward;
                v_21 = this.cursor;
                lab35: do {
                    if (!this.r_fix_endings$esjava$0()) {
                        break lab35;
                    }
                } while (false);
                this.cursor = v_21;
                return true;
            }
        }, {
            key: 'r_remove_tense_suffixes$esjava$0',
            value: function r_remove_tense_suffixes$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                this.B_found_a_match = true;
                replab0: while (true) {
                    v_1 = this.cursor;
                    lab1: do {
                        if (!this.B_found_a_match) {
                            break lab1;
                        }
                        v_2 = this.cursor;
                        lab2: do {
                            if (!this.r_remove_tense_suffix$esjava$0()) {
                                break lab2;
                            }
                        } while (false);
                        this.cursor = v_2;
                        continue replab0;
                    } while (false);
                    this.cursor = v_1;
                    break replab0;
                }
                return true;
            }
        }, {
            key: 'r_remove_tense_suffix$esjava$0',
            value: function r_remove_tense_suffix$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                var v_8 = void 0;
                var v_9 = void 0;
                var v_10 = void 0;
                var v_11 = void 0;
                var v_12 = void 0;
                var v_13 = void 0;
                var v_14 = void 0;
                var v_15 = void 0;
                var v_16 = void 0;
                var v_17 = void 0;
                var v_18 = void 0;
                this.B_found_a_match = false;
                if (!this.r_has_min_length$esjava$0()) {
                    return false;
                }
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                v_1 = this.limit - this.cursor;
                lab0: do {
                    lab1: do {
                        v_2 = this.limit - this.cursor;
                        lab2: do {
                            v_3 = this.limit - this.cursor;
                            this.ket = this.cursor;
                            if (this.find_among_b$esjava$1(tamilStemmer.a_22) === 0) {
                                break lab2;
                            }
                            this.bra = this.cursor;
                            this.slice_del$esjava$0();
                            this.B_found_a_match = true;
                            this.cursor = this.limit - v_3;
                            break lab1;
                        } while (false);
                        this.cursor = this.limit - v_2;
                        lab3: do {
                            v_4 = this.limit - this.cursor;
                            this.ket = this.cursor;
                            lab4: do {
                                v_5 = this.limit - this.cursor;
                                lab5: do {
                                    if (!this.eq_s_b$esjava$1('\u0BAE\u0BBE\u0BB0\u0BCD')) {
                                        break lab5;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab6: do {
                                    if (!this.eq_s_b$esjava$1('\u0BAE\u0BBF\u0BA9\u0BCD')) {
                                        break lab6;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab7: do {
                                    if (!this.eq_s_b$esjava$1('\u0BA9\u0BA9\u0BCD')) {
                                        break lab7;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab8: do {
                                    if (!this.eq_s_b$esjava$1('\u0BA9\u0BBE\u0BA9\u0BCD')) {
                                        break lab8;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab9: do {
                                    if (!this.eq_s_b$esjava$1('\u0BA9\u0BBE\u0BB3\u0BCD')) {
                                        break lab9;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab10: do {
                                    if (!this.eq_s_b$esjava$1('\u0BA9\u0BBE\u0BB0\u0BCD')) {
                                        break lab10;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab11: do {
                                    if (!this.eq_s_b$esjava$1('\u0BB5\u0BA9\u0BCD')) {
                                        break lab11;
                                    }
                                    v_6 = this.limit - this.cursor;
                                    {
                                        v_7 = this.limit - this.cursor;
                                        lab12: do {
                                            if (this.find_among_b$esjava$1(tamilStemmer.a_23) === 0) {
                                                break lab12;
                                            }
                                            break lab11;
                                        } while (false);
                                        this.cursor = this.limit - v_7;
                                    }
                                    this.cursor = this.limit - v_6;
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab13: do {
                                    if (!this.eq_s_b$esjava$1('\u0BA9\u0BB3\u0BCD')) {
                                        break lab13;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab14: do {
                                    if (!this.eq_s_b$esjava$1('\u0BB5\u0BB3\u0BCD')) {
                                        break lab14;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab15: do {
                                    if (!this.eq_s_b$esjava$1('\u0BA9\u0BB0\u0BCD')) {
                                        break lab15;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab16: do {
                                    if (!this.eq_s_b$esjava$1('\u0BB5\u0BB0\u0BCD')) {
                                        break lab16;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab17: do {
                                    if (!this.eq_s_b$esjava$1('\u0BA9')) {
                                        break lab17;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab18: do {
                                    if (!this.eq_s_b$esjava$1('\u0BAA')) {
                                        break lab18;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab19: do {
                                    if (!this.eq_s_b$esjava$1('\u0B95')) {
                                        break lab19;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab20: do {
                                    if (!this.eq_s_b$esjava$1('\u0BA4')) {
                                        break lab20;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab21: do {
                                    if (!this.eq_s_b$esjava$1('\u0BAF')) {
                                        break lab21;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab22: do {
                                    if (!this.eq_s_b$esjava$1('\u0BAA\u0BA9\u0BCD')) {
                                        break lab22;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab23: do {
                                    if (!this.eq_s_b$esjava$1('\u0BAA\u0BB3\u0BCD')) {
                                        break lab23;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab24: do {
                                    if (!this.eq_s_b$esjava$1('\u0BAA\u0BB0\u0BCD')) {
                                        break lab24;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab25: do {
                                    if (!this.eq_s_b$esjava$1('\u0BA4\u0BC1')) {
                                        break lab25;
                                    }
                                    v_8 = this.limit - this.cursor;
                                    {
                                        v_9 = this.limit - this.cursor;
                                        lab26: do {
                                            if (this.find_among_b$esjava$1(tamilStemmer.a_24) === 0) {
                                                break lab26;
                                            }
                                            break lab25;
                                        } while (false);
                                        this.cursor = this.limit - v_9;
                                    }
                                    this.cursor = this.limit - v_8;
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab27: do {
                                    if (!this.eq_s_b$esjava$1('\u0BBF\u0BB1\u0BCD\u0BB1\u0BC1')) {
                                        break lab27;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab28: do {
                                    if (!this.eq_s_b$esjava$1('\u0BAA\u0BAE\u0BCD')) {
                                        break lab28;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab29: do {
                                    if (!this.eq_s_b$esjava$1('\u0BA9\u0BAE\u0BCD')) {
                                        break lab29;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab30: do {
                                    if (!this.eq_s_b$esjava$1('\u0BA4\u0BC1\u0BAE\u0BCD')) {
                                        break lab30;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab31: do {
                                    if (!this.eq_s_b$esjava$1('\u0BB1\u0BC1\u0BAE\u0BCD')) {
                                        break lab31;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab32: do {
                                    if (!this.eq_s_b$esjava$1('\u0B95\u0BC1\u0BAE\u0BCD')) {
                                        break lab32;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab33: do {
                                    if (!this.eq_s_b$esjava$1('\u0BA9\u0BC6\u0BA9\u0BCD')) {
                                        break lab33;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab34: do {
                                    if (!this.eq_s_b$esjava$1('\u0BA9\u0BC8')) {
                                        break lab34;
                                    }
                                    break lab4;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                if (!this.eq_s_b$esjava$1('\u0BB5\u0BC8')) {
                                    break lab3;
                                }
                            } while (false);
                            this.bra = this.cursor;
                            this.slice_del$esjava$0();
                            this.B_found_a_match = true;
                            this.cursor = this.limit - v_4;
                            break lab1;
                        } while (false);
                        this.cursor = this.limit - v_2;
                        lab35: do {
                            v_10 = this.limit - this.cursor;
                            this.ket = this.cursor;
                            lab36: do {
                                v_11 = this.limit - this.cursor;
                                lab37: do {
                                    if (!this.eq_s_b$esjava$1('\u0BBE\u0BA9\u0BCD')) {
                                        break lab37;
                                    }
                                    v_12 = this.limit - this.cursor;
                                    {
                                        v_13 = this.limit - this.cursor;
                                        lab38: do {
                                            if (!this.eq_s_b$esjava$1('\u0B9A')) {
                                                break lab38;
                                            }
                                            break lab37;
                                        } while (false);
                                        this.cursor = this.limit - v_13;
                                    }
                                    this.cursor = this.limit - v_12;
                                    break lab36;
                                } while (false);
                                this.cursor = this.limit - v_11;
                                lab39: do {
                                    if (!this.eq_s_b$esjava$1('\u0BBE\u0BB3\u0BCD')) {
                                        break lab39;
                                    }
                                    break lab36;
                                } while (false);
                                this.cursor = this.limit - v_11;
                                lab40: do {
                                    if (!this.eq_s_b$esjava$1('\u0BBE\u0BB0\u0BCD')) {
                                        break lab40;
                                    }
                                    break lab36;
                                } while (false);
                                this.cursor = this.limit - v_11;
                                lab41: do {
                                    if (!this.eq_s_b$esjava$1('\u0BC7\u0BA9\u0BCD')) {
                                        break lab41;
                                    }
                                    break lab36;
                                } while (false);
                                this.cursor = this.limit - v_11;
                                lab42: do {
                                    if (!this.eq_s_b$esjava$1('\u0BBE')) {
                                        break lab42;
                                    }
                                    break lab36;
                                } while (false);
                                this.cursor = this.limit - v_11;
                                lab43: do {
                                    if (!this.eq_s_b$esjava$1('\u0BBE\u0BAE\u0BCD')) {
                                        break lab43;
                                    }
                                    break lab36;
                                } while (false);
                                this.cursor = this.limit - v_11;
                                lab44: do {
                                    if (!this.eq_s_b$esjava$1('\u0BC6\u0BAE\u0BCD')) {
                                        break lab44;
                                    }
                                    break lab36;
                                } while (false);
                                this.cursor = this.limit - v_11;
                                lab45: do {
                                    if (!this.eq_s_b$esjava$1('\u0BC7\u0BAE\u0BCD')) {
                                        break lab45;
                                    }
                                    break lab36;
                                } while (false);
                                this.cursor = this.limit - v_11;
                                lab46: do {
                                    if (!this.eq_s_b$esjava$1('\u0BCB\u0BAE\u0BCD')) {
                                        break lab46;
                                    }
                                    break lab36;
                                } while (false);
                                this.cursor = this.limit - v_11;
                                lab47: do {
                                    if (!this.eq_s_b$esjava$1('\u0B95\u0BC1\u0BAE\u0BCD')) {
                                        break lab47;
                                    }
                                    break lab36;
                                } while (false);
                                this.cursor = this.limit - v_11;
                                lab48: do {
                                    if (!this.eq_s_b$esjava$1('\u0BA4\u0BC1\u0BAE\u0BCD')) {
                                        break lab48;
                                    }
                                    break lab36;
                                } while (false);
                                this.cursor = this.limit - v_11;
                                lab49: do {
                                    if (!this.eq_s_b$esjava$1('\u0B9F\u0BC1\u0BAE\u0BCD')) {
                                        break lab49;
                                    }
                                    break lab36;
                                } while (false);
                                this.cursor = this.limit - v_11;
                                lab50: do {
                                    if (!this.eq_s_b$esjava$1('\u0BB1\u0BC1\u0BAE\u0BCD')) {
                                        break lab50;
                                    }
                                    break lab36;
                                } while (false);
                                this.cursor = this.limit - v_11;
                                lab51: do {
                                    if (!this.eq_s_b$esjava$1('\u0BBE\u0BAF\u0BCD')) {
                                        break lab51;
                                    }
                                    break lab36;
                                } while (false);
                                this.cursor = this.limit - v_11;
                                lab52: do {
                                    if (!this.eq_s_b$esjava$1('\u0BA9\u0BC6\u0BA9\u0BCD')) {
                                        break lab52;
                                    }
                                    break lab36;
                                } while (false);
                                this.cursor = this.limit - v_11;
                                lab53: do {
                                    if (!this.eq_s_b$esjava$1('\u0BA9\u0BBF\u0BB0\u0BCD')) {
                                        break lab53;
                                    }
                                    break lab36;
                                } while (false);
                                this.cursor = this.limit - v_11;
                                lab54: do {
                                    if (!this.eq_s_b$esjava$1('\u0BC0\u0BB0\u0BCD')) {
                                        break lab54;
                                    }
                                    break lab36;
                                } while (false);
                                this.cursor = this.limit - v_11;
                                if (!this.eq_s_b$esjava$1('\u0BC0\u0BAF\u0BB0\u0BCD')) {
                                    break lab35;
                                }
                            } while (false);
                            this.bra = this.cursor;
                            this.slice_from$esjava$1('\u0BCD');
                            this.B_found_a_match = true;
                            this.cursor = this.limit - v_10;
                            break lab1;
                        } while (false);
                        this.cursor = this.limit - v_2;
                        v_14 = this.limit - this.cursor;
                        this.ket = this.cursor;
                        lab55: do {
                            v_15 = this.limit - this.cursor;
                            lab56: do {
                                if (!this.eq_s_b$esjava$1('\u0B95\u0BC1')) {
                                    break lab56;
                                }
                                break lab55;
                            } while (false);
                            this.cursor = this.limit - v_15;
                            if (!this.eq_s_b$esjava$1('\u0BA4\u0BC1')) {
                                break lab0;
                            }
                        } while (false);
                        v_16 = this.limit - this.cursor;
                        if (!this.eq_s_b$esjava$1('\u0BCD')) {
                            break lab0;
                        }
                        this.cursor = this.limit - v_16;
                        this.bra = this.cursor;
                        this.slice_del$esjava$0();
                        this.B_found_a_match = true;
                        this.cursor = this.limit - v_14;
                    } while (false);
                } while (false);
                this.cursor = this.limit - v_1;
                v_17 = this.limit - this.cursor;
                lab57: do {
                    this.ket = this.cursor;
                    if (this.find_among_b$esjava$1(tamilStemmer.a_25) === 0) {
                        break lab57;
                    }
                    this.bra = this.cursor;
                    this.slice_del$esjava$0();
                    this.B_found_a_match = true;
                } while (false);
                this.cursor = this.limit - v_17;
                this.cursor = this.limit_backward;
                v_18 = this.cursor;
                lab58: do {
                    if (!this.r_fix_endings$esjava$0()) {
                        break lab58;
                    }
                } while (false);
                this.cursor = v_18;
                return true;
            }
        }, {
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                var v_8 = void 0;
                var v_9 = void 0;
                var v_10 = void 0;
                this.B_found_vetrumai_urupu = false;
                v_1 = this.cursor;
                lab0: do {
                    if (!this.r_fix_ending$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = v_1;
                if (!this.r_has_min_length$esjava$0()) {
                    return false;
                }
                v_2 = this.cursor;
                lab1: do {
                    if (!this.r_remove_question_prefixes$esjava$0()) {
                        break lab1;
                    }
                } while (false);
                this.cursor = v_2;
                v_3 = this.cursor;
                lab2: do {
                    if (!this.r_remove_pronoun_prefixes$esjava$0()) {
                        break lab2;
                    }
                } while (false);
                this.cursor = v_3;
                v_4 = this.cursor;
                lab3: do {
                    if (!this.r_remove_question_suffixes$esjava$0()) {
                        break lab3;
                    }
                } while (false);
                this.cursor = v_4;
                v_5 = this.cursor;
                lab4: do {
                    if (!this.r_remove_um$esjava$0()) {
                        break lab4;
                    }
                } while (false);
                this.cursor = v_5;
                v_6 = this.cursor;
                lab5: do {
                    if (!this.r_remove_common_word_endings$esjava$0()) {
                        break lab5;
                    }
                } while (false);
                this.cursor = v_6;
                v_7 = this.cursor;
                lab6: do {
                    if (!this.r_remove_vetrumai_urupukal$esjava$0()) {
                        break lab6;
                    }
                } while (false);
                this.cursor = v_7;
                v_8 = this.cursor;
                lab7: do {
                    if (!this.r_remove_plural_suffix$esjava$0()) {
                        break lab7;
                    }
                } while (false);
                this.cursor = v_8;
                v_9 = this.cursor;
                lab8: do {
                    if (!this.r_remove_command_suffixes$esjava$0()) {
                        break lab8;
                    }
                } while (false);
                this.cursor = v_9;
                v_10 = this.cursor;
                lab9: do {
                    if (!this.r_remove_tense_suffixes$esjava$0()) {
                        break lab9;
                    }
                } while (false);
                this.cursor = v_10;
                return true;
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get49;

                for (var _len48 = arguments.length, args = Array(_len48), _key48 = 0; _key48 < _len48; _key48++) {
                    args[_key48] = arguments[_key48];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get49 = _get(Object.getPrototypeOf(tamilStemmer.prototype), 'stem', this)).call.apply(_get49, [this].concat(args));
            }
        }, {
            key: 'I_length',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_length') ? this._$esjava$I_length : this._$esjava$I_length = 0;
            },
            set: function set(v) {
                this._$esjava$I_length = v;
            }
        }, {
            key: 'B_found_wrong_ending',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$B_found_wrong_ending') ? this._$esjava$B_found_wrong_ending : this._$esjava$B_found_wrong_ending = false;
            },
            set: function set(v) {
                this._$esjava$B_found_wrong_ending = v;
            }
        }, {
            key: 'B_found_vetrumai_urupu',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$B_found_vetrumai_urupu') ? this._$esjava$B_found_vetrumai_urupu : this._$esjava$B_found_vetrumai_urupu = false;
            },
            set: function set(v) {
                this._$esjava$B_found_vetrumai_urupu = v;
            }
        }, {
            key: 'B_found_a_match',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$B_found_a_match') ? this._$esjava$B_found_a_match : this._$esjava$B_found_a_match = false;
            },
            set: function set(v) {
                this._$esjava$B_found_a_match = v;
            }
        }], [{
            key: 'a_0',
            get: function get() {
                delete tamilStemmer.a_0;
                return tamilStemmer.a_0 = [new Among('\u0B95', -1, -1), new Among('\u0B99', -1, -1), new Among('\u0B9A', -1, -1), new Among('\u0B9E', -1, -1), new Among('\u0BA4', -1, -1), new Among('\u0BA8', -1, -1), new Among('\u0BAA', -1, -1), new Among('\u0BAE', -1, -1), new Among('\u0BAF', -1, -1), new Among('\u0BB5', -1, -1)];
            }
        }, {
            key: 'a_1',
            get: function get() {
                delete tamilStemmer.a_1;
                return tamilStemmer.a_1 = [new Among('\u0BA8\u0BCD\u0BA4', -1, -1), new Among('\u0BA8\u0BCD\u0BA4\u0BCD', -1, -1), new Among('\u0BA8\u0BCD', -1, -1)];
            }
        }, {
            key: 'a_2',
            get: function get() {
                delete tamilStemmer.a_2;
                return tamilStemmer.a_2 = [new Among('\u0BBF', -1, -1), new Among('\u0BC0', -1, -1), new Among('\u0BC8', -1, -1)];
            }
        }, {
            key: 'a_3',
            get: function get() {
                delete tamilStemmer.a_3;
                return tamilStemmer.a_3 = [new Among('\u0B95', -1, -1), new Among('\u0B9A', -1, -1), new Among('\u0B9F', -1, -1), new Among('\u0BA4', -1, -1), new Among('\u0BAA', -1, -1), new Among('\u0BB1', -1, -1)];
            }
        }, {
            key: 'a_4',
            get: function get() {
                delete tamilStemmer.a_4;
                return tamilStemmer.a_4 = [new Among('\u0B95', -1, -1), new Among('\u0B9A', -1, -1), new Among('\u0B9F', -1, -1), new Among('\u0BA4', -1, -1), new Among('\u0BAA', -1, -1), new Among('\u0BB1', -1, -1)];
            }
        }, {
            key: 'a_5',
            get: function get() {
                delete tamilStemmer.a_5;
                return tamilStemmer.a_5 = [new Among('\u0B95', -1, -1), new Among('\u0B9A', -1, -1), new Among('\u0B9F', -1, -1), new Among('\u0BA4', -1, -1), new Among('\u0BAA', -1, -1), new Among('\u0BB1', -1, -1)];
            }
        }, {
            key: 'a_6',
            get: function get() {
                delete tamilStemmer.a_6;
                return tamilStemmer.a_6 = [new Among('\u0BAF', -1, -1), new Among('\u0BB0', -1, -1), new Among('\u0BB2', -1, -1), new Among('\u0BB3', -1, -1), new Among('\u0BB4', -1, -1), new Among('\u0BB5', -1, -1)];
            }
        }, {
            key: 'a_7',
            get: function get() {
                delete tamilStemmer.a_7;
                return tamilStemmer.a_7 = [new Among('\u0B99', -1, -1), new Among('\u0B9E', -1, -1), new Among('\u0BA3', -1, -1), new Among('\u0BA8', -1, -1), new Among('\u0BA9', -1, -1), new Among('\u0BAE', -1, -1)];
            }
        }, {
            key: 'a_8',
            get: function get() {
                delete tamilStemmer.a_8;
                return tamilStemmer.a_8 = [new Among('\u0BAF', -1, -1), new Among('\u0BB5', -1, -1), new Among('\u0BB5\u0BCD', -1, -1)];
            }
        }, {
            key: 'a_9',
            get: function get() {
                delete tamilStemmer.a_9;
                return tamilStemmer.a_9 = [new Among('\u0BBE', -1, -1), new Among('\u0BBF', -1, -1), new Among('\u0BC0', -1, -1), new Among('\u0BC1', -1, -1), new Among('\u0BC2', -1, -1), new Among('\u0BC6', -1, -1), new Among('\u0BC7', -1, -1), new Among('\u0BC8', -1, -1)];
            }
        }, {
            key: 'a_10',
            get: function get() {
                delete tamilStemmer.a_10;
                return tamilStemmer.a_10 = [new Among('\u0BBE', -1, -1), new Among('\u0BBF', -1, -1), new Among('\u0BC0', -1, -1), new Among('\u0BC1', -1, -1), new Among('\u0BC2', -1, -1), new Among('\u0BC6', -1, -1), new Among('\u0BC7', -1, -1), new Among('\u0BC8', -1, -1)];
            }
        }, {
            key: 'a_11',
            get: function get() {
                delete tamilStemmer.a_11;
                return tamilStemmer.a_11 = [new Among('\u0B85', -1, -1), new Among('\u0B87', -1, -1), new Among('\u0B89', -1, -1)];
            }
        }, {
            key: 'a_12',
            get: function get() {
                delete tamilStemmer.a_12;
                return tamilStemmer.a_12 = [new Among('\u0B95', -1, -1), new Among('\u0B99', -1, -1), new Among('\u0B9A', -1, -1), new Among('\u0B9E', -1, -1), new Among('\u0BA4', -1, -1), new Among('\u0BA8', -1, -1), new Among('\u0BAA', -1, -1), new Among('\u0BAE', -1, -1), new Among('\u0BAF', -1, -1), new Among('\u0BB5', -1, -1)];
            }
        }, {
            key: 'a_13',
            get: function get() {
                delete tamilStemmer.a_13;
                return tamilStemmer.a_13 = [new Among('\u0B95', -1, -1), new Among('\u0B9A', -1, -1), new Among('\u0B9F', -1, -1), new Among('\u0BA4', -1, -1), new Among('\u0BAA', -1, -1), new Among('\u0BB1', -1, -1)];
            }
        }, {
            key: 'a_14',
            get: function get() {
                delete tamilStemmer.a_14;
                return tamilStemmer.a_14 = [new Among('\u0BBE', -1, -1), new Among('\u0BC7', -1, -1), new Among('\u0BCB', -1, -1)];
            }
        }, {
            key: 'a_15',
            get: function get() {
                delete tamilStemmer.a_15;
                return tamilStemmer.a_15 = [new Among('\u0BAA\u0BBF', -1, -1), new Among('\u0BB5\u0BBF', -1, -1)];
            }
        }, {
            key: 'a_16',
            get: function get() {
                delete tamilStemmer.a_16;
                return tamilStemmer.a_16 = [new Among('\u0BBE', -1, -1), new Among('\u0BBF', -1, -1), new Among('\u0BC0', -1, -1), new Among('\u0BC1', -1, -1), new Among('\u0BC2', -1, -1), new Among('\u0BC6', -1, -1), new Among('\u0BC7', -1, -1), new Among('\u0BC8', -1, -1)];
            }
        }, {
            key: 'a_17',
            get: function get() {
                delete tamilStemmer.a_17;
                return tamilStemmer.a_17 = [new Among('\u0BAA\u0B9F\u0BCD\u0B9F', -1, -1), new Among('\u0BAA\u0B9F\u0BCD\u0B9F\u0BA3', -1, -1), new Among('\u0BA4\u0BBE\u0BA9', -1, -1), new Among('\u0BAA\u0B9F\u0BBF\u0BA4\u0BBE\u0BA9', 2, -1), new Among('\u0B95\u0BC1\u0BB0\u0BBF\u0BAF', -1, -1), new Among('\u0BAA\u0B9F\u0BBF', -1, -1), new Among('\u0BAA\u0BB1\u0BCD\u0BB1\u0BBF', -1, -1), new Among('\u0BAA\u0B9F\u0BC1', -1, -1), new Among('\u0BB5\u0BBF\u0B9F\u0BC1', -1, -1), new Among('\u0BAA\u0B9F\u0BCD\u0B9F\u0BC1', -1, -1), new Among('\u0BB5\u0BBF\u0B9F\u0BCD\u0B9F\u0BC1', -1, -1), new Among('\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1', -1, -1), new Among('\u0BC6\u0BB2\u0BCD\u0BB2\u0BBE\u0BAE\u0BCD', -1, -1)];
            }
        }, {
            key: 'a_18',
            get: function get() {
                delete tamilStemmer.a_18;
                return tamilStemmer.a_18 = [new Among('\u0B95', -1, -1), new Among('\u0B9A', -1, -1), new Among('\u0B9F', -1, -1), new Among('\u0BA4', -1, -1), new Among('\u0BAA', -1, -1), new Among('\u0BB1', -1, -1)];
            }
        }, {
            key: 'a_19',
            get: function get() {
                delete tamilStemmer.a_19;
                return tamilStemmer.a_19 = [new Among('\u0B95', -1, -1), new Among('\u0B9A', -1, -1), new Among('\u0B9F', -1, -1), new Among('\u0BA4', -1, -1), new Among('\u0BAA', -1, -1), new Among('\u0BB1', -1, -1)];
            }
        }, {
            key: 'a_20',
            get: function get() {
                delete tamilStemmer.a_20;
                return tamilStemmer.a_20 = [new Among('\u0BBE', -1, -1), new Among('\u0BBF', -1, -1), new Among('\u0BC0', -1, -1), new Among('\u0BC1', -1, -1), new Among('\u0BC2', -1, -1), new Among('\u0BC6', -1, -1), new Among('\u0BC7', -1, -1), new Among('\u0BC8', -1, -1)];
            }
        }, {
            key: 'a_21',
            get: function get() {
                delete tamilStemmer.a_21;
                return tamilStemmer.a_21 = [new Among('\u0BBE', -1, -1), new Among('\u0BBF', -1, -1), new Among('\u0BC0', -1, -1), new Among('\u0BC1', -1, -1), new Among('\u0BC2', -1, -1), new Among('\u0BC6', -1, -1), new Among('\u0BC7', -1, -1), new Among('\u0BC8', -1, -1)];
            }
        }, {
            key: 'a_22',
            get: function get() {
                delete tamilStemmer.a_22;
                return tamilStemmer.a_22 = [new Among('\u0BAA\u0B9F\u0BC1', -1, -1), new Among('\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BCD', -1, -1)];
            }
        }, {
            key: 'a_23',
            get: function get() {
                delete tamilStemmer.a_23;
                return tamilStemmer.a_23 = [new Among('\u0B85', -1, -1), new Among('\u0B86', -1, -1), new Among('\u0B87', -1, -1), new Among('\u0B88', -1, -1), new Among('\u0B89', -1, -1), new Among('\u0B8A', -1, -1), new Among('\u0B8E', -1, -1), new Among('\u0B8F', -1, -1), new Among('\u0B90', -1, -1), new Among('\u0B92', -1, -1), new Among('\u0B93', -1, -1), new Among('\u0B94', -1, -1)];
            }
        }, {
            key: 'a_24',
            get: function get() {
                delete tamilStemmer.a_24;
                return tamilStemmer.a_24 = [new Among('\u0BBE', -1, -1), new Among('\u0BBF', -1, -1), new Among('\u0BC0', -1, -1), new Among('\u0BC1', -1, -1), new Among('\u0BC2', -1, -1), new Among('\u0BC6', -1, -1), new Among('\u0BC7', -1, -1), new Among('\u0BC8', -1, -1)];
            }
        }, {
            key: 'a_25',
            get: function get() {
                delete tamilStemmer.a_25;
                return tamilStemmer.a_25 = [new Among('\u0B95\u0BBF\u0BB1', -1, -1), new Among('\u0B95\u0BBF\u0BA9\u0BCD\u0BB1', -1, -1), new Among('\u0BBE\u0BA8\u0BBF\u0BA9\u0BCD\u0BB1', -1, -1), new Among('\u0B95\u0BBF\u0BB1\u0BCD', -1, -1), new Among('\u0B95\u0BBF\u0BA9\u0BCD\u0BB1\u0BCD', -1, -1), new Among('\u0BBE\u0BA8\u0BBF\u0BA9\u0BCD\u0BB1\u0BCD', -1, -1)];
            }
        }]);

        return tamilStemmer;
    }(SnowballStemmer);

    var turkishStemmer = function (_SnowballStemmer24) {
        _inherits(turkishStemmer, _SnowballStemmer24);

        function turkishStemmer() {
            _classCallCheck(this, turkishStemmer);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(turkishStemmer).apply(this, arguments));
        }

        _createClass(turkishStemmer, [{
            key: 'r_check_vowel_harmony$esjava$0',
            value: function r_check_vowel_harmony$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                var v_8 = void 0;
                var v_9 = void 0;
                var v_10 = void 0;
                var v_11 = void 0;
                v_1 = this.limit - this.cursor;
                golab0: while (true) {
                    v_2 = this.limit - this.cursor;
                    lab1: do {
                        if (!this.in_grouping_b$esjava$3(turkishStemmer.g_vowel, 97, 305)) {
                            break lab1;
                        }
                        this.cursor = this.limit - v_2;
                        break golab0;
                    } while (false);
                    this.cursor = this.limit - v_2;
                    if (this.cursor <= this.limit_backward) {
                        return false;
                    }
                    this.cursor--;
                }
                lab2: do {
                    v_3 = this.limit - this.cursor;
                    lab3: do {
                        if (!this.eq_s_b$esjava$1("a")) {
                            break lab3;
                        }
                        golab4: while (true) {
                            v_4 = this.limit - this.cursor;
                            lab5: do {
                                if (!this.in_grouping_b$esjava$3(turkishStemmer.g_vowel1, 97, 305)) {
                                    break lab5;
                                }
                                this.cursor = this.limit - v_4;
                                break golab4;
                            } while (false);
                            this.cursor = this.limit - v_4;
                            if (this.cursor <= this.limit_backward) {
                                break lab3;
                            }
                            this.cursor--;
                        }
                        break lab2;
                    } while (false);
                    this.cursor = this.limit - v_3;
                    lab6: do {
                        if (!this.eq_s_b$esjava$1("e")) {
                            break lab6;
                        }
                        golab7: while (true) {
                            v_5 = this.limit - this.cursor;
                            lab8: do {
                                if (!this.in_grouping_b$esjava$3(turkishStemmer.g_vowel2, 101, 252)) {
                                    break lab8;
                                }
                                this.cursor = this.limit - v_5;
                                break golab7;
                            } while (false);
                            this.cursor = this.limit - v_5;
                            if (this.cursor <= this.limit_backward) {
                                break lab6;
                            }
                            this.cursor--;
                        }
                        break lab2;
                    } while (false);
                    this.cursor = this.limit - v_3;
                    lab9: do {
                        if (!this.eq_s_b$esjava$1('\u0131')) {
                            break lab9;
                        }
                        golab10: while (true) {
                            v_6 = this.limit - this.cursor;
                            lab11: do {
                                if (!this.in_grouping_b$esjava$3(turkishStemmer.g_vowel3, 97, 305)) {
                                    break lab11;
                                }
                                this.cursor = this.limit - v_6;
                                break golab10;
                            } while (false);
                            this.cursor = this.limit - v_6;
                            if (this.cursor <= this.limit_backward) {
                                break lab9;
                            }
                            this.cursor--;
                        }
                        break lab2;
                    } while (false);
                    this.cursor = this.limit - v_3;
                    lab12: do {
                        if (!this.eq_s_b$esjava$1("i")) {
                            break lab12;
                        }
                        golab13: while (true) {
                            v_7 = this.limit - this.cursor;
                            lab14: do {
                                if (!this.in_grouping_b$esjava$3(turkishStemmer.g_vowel4, 101, 105)) {
                                    break lab14;
                                }
                                this.cursor = this.limit - v_7;
                                break golab13;
                            } while (false);
                            this.cursor = this.limit - v_7;
                            if (this.cursor <= this.limit_backward) {
                                break lab12;
                            }
                            this.cursor--;
                        }
                        break lab2;
                    } while (false);
                    this.cursor = this.limit - v_3;
                    lab15: do {
                        if (!this.eq_s_b$esjava$1("o")) {
                            break lab15;
                        }
                        golab16: while (true) {
                            v_8 = this.limit - this.cursor;
                            lab17: do {
                                if (!this.in_grouping_b$esjava$3(turkishStemmer.g_vowel5, 111, 117)) {
                                    break lab17;
                                }
                                this.cursor = this.limit - v_8;
                                break golab16;
                            } while (false);
                            this.cursor = this.limit - v_8;
                            if (this.cursor <= this.limit_backward) {
                                break lab15;
                            }
                            this.cursor--;
                        }
                        break lab2;
                    } while (false);
                    this.cursor = this.limit - v_3;
                    lab18: do {
                        if (!this.eq_s_b$esjava$1('\u00F6')) {
                            break lab18;
                        }
                        golab19: while (true) {
                            v_9 = this.limit - this.cursor;
                            lab20: do {
                                if (!this.in_grouping_b$esjava$3(turkishStemmer.g_vowel6, 246, 252)) {
                                    break lab20;
                                }
                                this.cursor = this.limit - v_9;
                                break golab19;
                            } while (false);
                            this.cursor = this.limit - v_9;
                            if (this.cursor <= this.limit_backward) {
                                break lab18;
                            }
                            this.cursor--;
                        }
                        break lab2;
                    } while (false);
                    this.cursor = this.limit - v_3;
                    lab21: do {
                        if (!this.eq_s_b$esjava$1("u")) {
                            break lab21;
                        }
                        golab22: while (true) {
                            v_10 = this.limit - this.cursor;
                            lab23: do {
                                if (!this.in_grouping_b$esjava$3(turkishStemmer.g_vowel5, 111, 117)) {
                                    break lab23;
                                }
                                this.cursor = this.limit - v_10;
                                break golab22;
                            } while (false);
                            this.cursor = this.limit - v_10;
                            if (this.cursor <= this.limit_backward) {
                                break lab21;
                            }
                            this.cursor--;
                        }
                        break lab2;
                    } while (false);
                    this.cursor = this.limit - v_3;
                    if (!this.eq_s_b$esjava$1('\u00FC')) {
                        return false;
                    }
                    golab24: while (true) {
                        v_11 = this.limit - this.cursor;
                        lab25: do {
                            if (!this.in_grouping_b$esjava$3(turkishStemmer.g_vowel6, 246, 252)) {
                                break lab25;
                            }
                            this.cursor = this.limit - v_11;
                            break golab24;
                        } while (false);
                        this.cursor = this.limit - v_11;
                        if (this.cursor <= this.limit_backward) {
                            return false;
                        }
                        this.cursor--;
                    }
                } while (false);
                this.cursor = this.limit - v_1;
                return true;
            }
        }, {
            key: 'r_mark_suffix_with_optional_n_consonant$esjava$0',
            value: function r_mark_suffix_with_optional_n_consonant$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                lab0: do {
                    v_1 = this.limit - this.cursor;
                    lab1: do {
                        if (!this.eq_s_b$esjava$1("n")) {
                            break lab1;
                        }
                        v_2 = this.limit - this.cursor;
                        if (!this.in_grouping_b$esjava$3(turkishStemmer.g_vowel, 97, 305)) {
                            break lab1;
                        }
                        this.cursor = this.limit - v_2;
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    {
                        v_3 = this.limit - this.cursor;
                        lab2: do {
                            v_4 = this.limit - this.cursor;
                            if (!this.eq_s_b$esjava$1("n")) {
                                break lab2;
                            }
                            this.cursor = this.limit - v_4;
                            return false;
                        } while (false);
                        this.cursor = this.limit - v_3;
                    }
                    v_5 = this.limit - this.cursor;
                    if (this.cursor <= this.limit_backward) {
                        return false;
                    }
                    this.cursor--;
                    if (!this.in_grouping_b$esjava$3(turkishStemmer.g_vowel, 97, 305)) {
                        return false;
                    }
                    this.cursor = this.limit - v_5;
                } while (false);
                return true;
            }
        }, {
            key: 'r_mark_suffix_with_optional_s_consonant$esjava$0',
            value: function r_mark_suffix_with_optional_s_consonant$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                lab0: do {
                    v_1 = this.limit - this.cursor;
                    lab1: do {
                        if (!this.eq_s_b$esjava$1("s")) {
                            break lab1;
                        }
                        v_2 = this.limit - this.cursor;
                        if (!this.in_grouping_b$esjava$3(turkishStemmer.g_vowel, 97, 305)) {
                            break lab1;
                        }
                        this.cursor = this.limit - v_2;
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    {
                        v_3 = this.limit - this.cursor;
                        lab2: do {
                            v_4 = this.limit - this.cursor;
                            if (!this.eq_s_b$esjava$1("s")) {
                                break lab2;
                            }
                            this.cursor = this.limit - v_4;
                            return false;
                        } while (false);
                        this.cursor = this.limit - v_3;
                    }
                    v_5 = this.limit - this.cursor;
                    if (this.cursor <= this.limit_backward) {
                        return false;
                    }
                    this.cursor--;
                    if (!this.in_grouping_b$esjava$3(turkishStemmer.g_vowel, 97, 305)) {
                        return false;
                    }
                    this.cursor = this.limit - v_5;
                } while (false);
                return true;
            }
        }, {
            key: 'r_mark_suffix_with_optional_y_consonant$esjava$0',
            value: function r_mark_suffix_with_optional_y_consonant$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                lab0: do {
                    v_1 = this.limit - this.cursor;
                    lab1: do {
                        if (!this.eq_s_b$esjava$1("y")) {
                            break lab1;
                        }
                        v_2 = this.limit - this.cursor;
                        if (!this.in_grouping_b$esjava$3(turkishStemmer.g_vowel, 97, 305)) {
                            break lab1;
                        }
                        this.cursor = this.limit - v_2;
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    {
                        v_3 = this.limit - this.cursor;
                        lab2: do {
                            v_4 = this.limit - this.cursor;
                            if (!this.eq_s_b$esjava$1("y")) {
                                break lab2;
                            }
                            this.cursor = this.limit - v_4;
                            return false;
                        } while (false);
                        this.cursor = this.limit - v_3;
                    }
                    v_5 = this.limit - this.cursor;
                    if (this.cursor <= this.limit_backward) {
                        return false;
                    }
                    this.cursor--;
                    if (!this.in_grouping_b$esjava$3(turkishStemmer.g_vowel, 97, 305)) {
                        return false;
                    }
                    this.cursor = this.limit - v_5;
                } while (false);
                return true;
            }
        }, {
            key: 'r_mark_suffix_with_optional_U_vowel$esjava$0',
            value: function r_mark_suffix_with_optional_U_vowel$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                lab0: do {
                    v_1 = this.limit - this.cursor;
                    lab1: do {
                        if (!this.in_grouping_b$esjava$3(turkishStemmer.g_U, 105, 305)) {
                            break lab1;
                        }
                        v_2 = this.limit - this.cursor;
                        if (!this.out_grouping_b$esjava$3(turkishStemmer.g_vowel, 97, 305)) {
                            break lab1;
                        }
                        this.cursor = this.limit - v_2;
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    {
                        v_3 = this.limit - this.cursor;
                        lab2: do {
                            v_4 = this.limit - this.cursor;
                            if (!this.in_grouping_b$esjava$3(turkishStemmer.g_U, 105, 305)) {
                                break lab2;
                            }
                            this.cursor = this.limit - v_4;
                            return false;
                        } while (false);
                        this.cursor = this.limit - v_3;
                    }
                    v_5 = this.limit - this.cursor;
                    if (this.cursor <= this.limit_backward) {
                        return false;
                    }
                    this.cursor--;
                    if (!this.out_grouping_b$esjava$3(turkishStemmer.g_vowel, 97, 305)) {
                        return false;
                    }
                    this.cursor = this.limit - v_5;
                } while (false);
                return true;
            }
        }, {
            key: 'r_mark_possessives$esjava$0',
            value: function r_mark_possessives$esjava$0() {
                if (this.find_among_b$esjava$1(turkishStemmer.a_0) === 0) {
                    return false;
                }
                if (!this.r_mark_suffix_with_optional_U_vowel$esjava$0()) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_sU$esjava$0',
            value: function r_mark_sU$esjava$0() {
                if (!this.r_check_vowel_harmony$esjava$0()) {
                    return false;
                }
                if (!this.in_grouping_b$esjava$3(turkishStemmer.g_U, 105, 305)) {
                    return false;
                }
                if (!this.r_mark_suffix_with_optional_s_consonant$esjava$0()) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_lArI$esjava$0',
            value: function r_mark_lArI$esjava$0() {
                if (this.find_among_b$esjava$1(turkishStemmer.a_1) === 0) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_yU$esjava$0',
            value: function r_mark_yU$esjava$0() {
                if (!this.r_check_vowel_harmony$esjava$0()) {
                    return false;
                }
                if (!this.in_grouping_b$esjava$3(turkishStemmer.g_U, 105, 305)) {
                    return false;
                }
                if (!this.r_mark_suffix_with_optional_y_consonant$esjava$0()) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_nU$esjava$0',
            value: function r_mark_nU$esjava$0() {
                if (!this.r_check_vowel_harmony$esjava$0()) {
                    return false;
                }
                if (this.find_among_b$esjava$1(turkishStemmer.a_2) === 0) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_nUn$esjava$0',
            value: function r_mark_nUn$esjava$0() {
                if (!this.r_check_vowel_harmony$esjava$0()) {
                    return false;
                }
                if (this.find_among_b$esjava$1(turkishStemmer.a_3) === 0) {
                    return false;
                }
                if (!this.r_mark_suffix_with_optional_n_consonant$esjava$0()) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_yA$esjava$0',
            value: function r_mark_yA$esjava$0() {
                if (!this.r_check_vowel_harmony$esjava$0()) {
                    return false;
                }
                if (this.find_among_b$esjava$1(turkishStemmer.a_4) === 0) {
                    return false;
                }
                if (!this.r_mark_suffix_with_optional_y_consonant$esjava$0()) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_nA$esjava$0',
            value: function r_mark_nA$esjava$0() {
                if (!this.r_check_vowel_harmony$esjava$0()) {
                    return false;
                }
                if (this.find_among_b$esjava$1(turkishStemmer.a_5) === 0) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_DA$esjava$0',
            value: function r_mark_DA$esjava$0() {
                if (!this.r_check_vowel_harmony$esjava$0()) {
                    return false;
                }
                if (this.find_among_b$esjava$1(turkishStemmer.a_6) === 0) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_ndA$esjava$0',
            value: function r_mark_ndA$esjava$0() {
                if (!this.r_check_vowel_harmony$esjava$0()) {
                    return false;
                }
                if (this.find_among_b$esjava$1(turkishStemmer.a_7) === 0) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_DAn$esjava$0',
            value: function r_mark_DAn$esjava$0() {
                if (!this.r_check_vowel_harmony$esjava$0()) {
                    return false;
                }
                if (this.find_among_b$esjava$1(turkishStemmer.a_8) === 0) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_ndAn$esjava$0',
            value: function r_mark_ndAn$esjava$0() {
                if (!this.r_check_vowel_harmony$esjava$0()) {
                    return false;
                }
                if (this.find_among_b$esjava$1(turkishStemmer.a_9) === 0) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_ylA$esjava$0',
            value: function r_mark_ylA$esjava$0() {
                if (!this.r_check_vowel_harmony$esjava$0()) {
                    return false;
                }
                if (this.find_among_b$esjava$1(turkishStemmer.a_10) === 0) {
                    return false;
                }
                if (!this.r_mark_suffix_with_optional_y_consonant$esjava$0()) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_ki$esjava$0',
            value: function r_mark_ki$esjava$0() {
                if (!this.eq_s_b$esjava$1("ki")) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_ncA$esjava$0',
            value: function r_mark_ncA$esjava$0() {
                if (!this.r_check_vowel_harmony$esjava$0()) {
                    return false;
                }
                if (this.find_among_b$esjava$1(turkishStemmer.a_11) === 0) {
                    return false;
                }
                if (!this.r_mark_suffix_with_optional_n_consonant$esjava$0()) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_yUm$esjava$0',
            value: function r_mark_yUm$esjava$0() {
                if (!this.r_check_vowel_harmony$esjava$0()) {
                    return false;
                }
                if (this.find_among_b$esjava$1(turkishStemmer.a_12) === 0) {
                    return false;
                }
                if (!this.r_mark_suffix_with_optional_y_consonant$esjava$0()) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_sUn$esjava$0',
            value: function r_mark_sUn$esjava$0() {
                if (!this.r_check_vowel_harmony$esjava$0()) {
                    return false;
                }
                if (this.find_among_b$esjava$1(turkishStemmer.a_13) === 0) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_yUz$esjava$0',
            value: function r_mark_yUz$esjava$0() {
                if (!this.r_check_vowel_harmony$esjava$0()) {
                    return false;
                }
                if (this.find_among_b$esjava$1(turkishStemmer.a_14) === 0) {
                    return false;
                }
                if (!this.r_mark_suffix_with_optional_y_consonant$esjava$0()) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_sUnUz$esjava$0',
            value: function r_mark_sUnUz$esjava$0() {
                if (this.find_among_b$esjava$1(turkishStemmer.a_15) === 0) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_lAr$esjava$0',
            value: function r_mark_lAr$esjava$0() {
                if (!this.r_check_vowel_harmony$esjava$0()) {
                    return false;
                }
                if (this.find_among_b$esjava$1(turkishStemmer.a_16) === 0) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_nUz$esjava$0',
            value: function r_mark_nUz$esjava$0() {
                if (!this.r_check_vowel_harmony$esjava$0()) {
                    return false;
                }
                if (this.find_among_b$esjava$1(turkishStemmer.a_17) === 0) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_DUr$esjava$0',
            value: function r_mark_DUr$esjava$0() {
                if (!this.r_check_vowel_harmony$esjava$0()) {
                    return false;
                }
                if (this.find_among_b$esjava$1(turkishStemmer.a_18) === 0) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_cAsInA$esjava$0',
            value: function r_mark_cAsInA$esjava$0() {
                if (this.find_among_b$esjava$1(turkishStemmer.a_19) === 0) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_yDU$esjava$0',
            value: function r_mark_yDU$esjava$0() {
                if (!this.r_check_vowel_harmony$esjava$0()) {
                    return false;
                }
                if (this.find_among_b$esjava$1(turkishStemmer.a_20) === 0) {
                    return false;
                }
                if (!this.r_mark_suffix_with_optional_y_consonant$esjava$0()) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_ysA$esjava$0',
            value: function r_mark_ysA$esjava$0() {
                if (this.find_among_b$esjava$1(turkishStemmer.a_21) === 0) {
                    return false;
                }
                if (!this.r_mark_suffix_with_optional_y_consonant$esjava$0()) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_ymUs_$esjava$0',
            value: function r_mark_ymUs_$esjava$0() {
                if (!this.r_check_vowel_harmony$esjava$0()) {
                    return false;
                }
                if (this.find_among_b$esjava$1(turkishStemmer.a_22) === 0) {
                    return false;
                }
                if (!this.r_mark_suffix_with_optional_y_consonant$esjava$0()) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_mark_yken$esjava$0',
            value: function r_mark_yken$esjava$0() {
                if (!this.eq_s_b$esjava$1("ken")) {
                    return false;
                }
                if (!this.r_mark_suffix_with_optional_y_consonant$esjava$0()) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'r_stem_nominal_verb_suffixes$esjava$0',
            value: function r_stem_nominal_verb_suffixes$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                var v_8 = void 0;
                var v_9 = void 0;
                var v_10 = void 0;
                this.ket = this.cursor;
                this.B_continue_stemming_noun_suffixes = true;
                lab0: do {
                    v_1 = this.limit - this.cursor;
                    lab1: do {
                        lab2: do {
                            v_2 = this.limit - this.cursor;
                            lab3: do {
                                if (!this.r_mark_ymUs_$esjava$0()) {
                                    break lab3;
                                }
                                break lab2;
                            } while (false);
                            this.cursor = this.limit - v_2;
                            lab4: do {
                                if (!this.r_mark_yDU$esjava$0()) {
                                    break lab4;
                                }
                                break lab2;
                            } while (false);
                            this.cursor = this.limit - v_2;
                            lab5: do {
                                if (!this.r_mark_ysA$esjava$0()) {
                                    break lab5;
                                }
                                break lab2;
                            } while (false);
                            this.cursor = this.limit - v_2;
                            if (!this.r_mark_yken$esjava$0()) {
                                break lab1;
                            }
                        } while (false);
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab6: do {
                        if (!this.r_mark_cAsInA$esjava$0()) {
                            break lab6;
                        }
                        lab7: do {
                            v_3 = this.limit - this.cursor;
                            lab8: do {
                                if (!this.r_mark_sUnUz$esjava$0()) {
                                    break lab8;
                                }
                                break lab7;
                            } while (false);
                            this.cursor = this.limit - v_3;
                            lab9: do {
                                if (!this.r_mark_lAr$esjava$0()) {
                                    break lab9;
                                }
                                break lab7;
                            } while (false);
                            this.cursor = this.limit - v_3;
                            lab10: do {
                                if (!this.r_mark_yUm$esjava$0()) {
                                    break lab10;
                                }
                                break lab7;
                            } while (false);
                            this.cursor = this.limit - v_3;
                            lab11: do {
                                if (!this.r_mark_sUn$esjava$0()) {
                                    break lab11;
                                }
                                break lab7;
                            } while (false);
                            this.cursor = this.limit - v_3;
                            lab12: do {
                                if (!this.r_mark_yUz$esjava$0()) {
                                    break lab12;
                                }
                                break lab7;
                            } while (false);
                            this.cursor = this.limit - v_3;
                        } while (false);
                        if (!this.r_mark_ymUs_$esjava$0()) {
                            break lab6;
                        }
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab13: do {
                        if (!this.r_mark_lAr$esjava$0()) {
                            break lab13;
                        }
                        this.bra = this.cursor;
                        this.slice_del$esjava$0();
                        v_4 = this.limit - this.cursor;
                        lab14: do {
                            this.ket = this.cursor;
                            lab15: do {
                                v_5 = this.limit - this.cursor;
                                lab16: do {
                                    if (!this.r_mark_DUr$esjava$0()) {
                                        break lab16;
                                    }
                                    break lab15;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab17: do {
                                    if (!this.r_mark_yDU$esjava$0()) {
                                        break lab17;
                                    }
                                    break lab15;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                lab18: do {
                                    if (!this.r_mark_ysA$esjava$0()) {
                                        break lab18;
                                    }
                                    break lab15;
                                } while (false);
                                this.cursor = this.limit - v_5;
                                if (!this.r_mark_ymUs_$esjava$0()) {
                                    this.cursor = this.limit - v_4;
                                    break lab14;
                                }
                            } while (false);
                        } while (false);
                        this.B_continue_stemming_noun_suffixes = false;
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab19: do {
                        if (!this.r_mark_nUz$esjava$0()) {
                            break lab19;
                        }
                        lab20: do {
                            v_6 = this.limit - this.cursor;
                            lab21: do {
                                if (!this.r_mark_yDU$esjava$0()) {
                                    break lab21;
                                }
                                break lab20;
                            } while (false);
                            this.cursor = this.limit - v_6;
                            if (!this.r_mark_ysA$esjava$0()) {
                                break lab19;
                            }
                        } while (false);
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab22: do {
                        lab23: do {
                            v_7 = this.limit - this.cursor;
                            lab24: do {
                                if (!this.r_mark_sUnUz$esjava$0()) {
                                    break lab24;
                                }
                                break lab23;
                            } while (false);
                            this.cursor = this.limit - v_7;
                            lab25: do {
                                if (!this.r_mark_yUz$esjava$0()) {
                                    break lab25;
                                }
                                break lab23;
                            } while (false);
                            this.cursor = this.limit - v_7;
                            lab26: do {
                                if (!this.r_mark_sUn$esjava$0()) {
                                    break lab26;
                                }
                                break lab23;
                            } while (false);
                            this.cursor = this.limit - v_7;
                            if (!this.r_mark_yUm$esjava$0()) {
                                break lab22;
                            }
                        } while (false);
                        this.bra = this.cursor;
                        this.slice_del$esjava$0();
                        v_8 = this.limit - this.cursor;
                        lab27: do {
                            this.ket = this.cursor;
                            if (!this.r_mark_ymUs_$esjava$0()) {
                                this.cursor = this.limit - v_8;
                                break lab27;
                            }
                        } while (false);
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    if (!this.r_mark_DUr$esjava$0()) {
                        return false;
                    }
                    this.bra = this.cursor;
                    this.slice_del$esjava$0();
                    v_9 = this.limit - this.cursor;
                    lab28: do {
                        this.ket = this.cursor;
                        lab29: do {
                            v_10 = this.limit - this.cursor;
                            lab30: do {
                                if (!this.r_mark_sUnUz$esjava$0()) {
                                    break lab30;
                                }
                                break lab29;
                            } while (false);
                            this.cursor = this.limit - v_10;
                            lab31: do {
                                if (!this.r_mark_lAr$esjava$0()) {
                                    break lab31;
                                }
                                break lab29;
                            } while (false);
                            this.cursor = this.limit - v_10;
                            lab32: do {
                                if (!this.r_mark_yUm$esjava$0()) {
                                    break lab32;
                                }
                                break lab29;
                            } while (false);
                            this.cursor = this.limit - v_10;
                            lab33: do {
                                if (!this.r_mark_sUn$esjava$0()) {
                                    break lab33;
                                }
                                break lab29;
                            } while (false);
                            this.cursor = this.limit - v_10;
                            lab34: do {
                                if (!this.r_mark_yUz$esjava$0()) {
                                    break lab34;
                                }
                                break lab29;
                            } while (false);
                            this.cursor = this.limit - v_10;
                        } while (false);
                        if (!this.r_mark_ymUs_$esjava$0()) {
                            this.cursor = this.limit - v_9;
                            break lab28;
                        }
                    } while (false);
                } while (false);
                this.bra = this.cursor;
                this.slice_del$esjava$0();
                return true;
            }
        }, {
            key: 'r_stem_suffix_chain_before_ki$esjava$0',
            value: function r_stem_suffix_chain_before_ki$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                var v_8 = void 0;
                var v_9 = void 0;
                var v_10 = void 0;
                var v_11 = void 0;
                this.ket = this.cursor;
                if (!this.r_mark_ki$esjava$0()) {
                    return false;
                }
                lab0: do {
                    v_1 = this.limit - this.cursor;
                    lab1: do {
                        if (!this.r_mark_DA$esjava$0()) {
                            break lab1;
                        }
                        this.bra = this.cursor;
                        this.slice_del$esjava$0();
                        v_2 = this.limit - this.cursor;
                        lab2: do {
                            this.ket = this.cursor;
                            lab3: do {
                                v_3 = this.limit - this.cursor;
                                lab4: do {
                                    if (!this.r_mark_lAr$esjava$0()) {
                                        break lab4;
                                    }
                                    this.bra = this.cursor;
                                    this.slice_del$esjava$0();
                                    v_4 = this.limit - this.cursor;
                                    lab5: do {
                                        if (!this.r_stem_suffix_chain_before_ki$esjava$0()) {
                                            this.cursor = this.limit - v_4;
                                            break lab5;
                                        }
                                    } while (false);
                                    break lab3;
                                } while (false);
                                this.cursor = this.limit - v_3;
                                if (!this.r_mark_possessives$esjava$0()) {
                                    this.cursor = this.limit - v_2;
                                    break lab2;
                                }
                                this.bra = this.cursor;
                                this.slice_del$esjava$0();
                                v_5 = this.limit - this.cursor;
                                lab6: do {
                                    this.ket = this.cursor;
                                    if (!this.r_mark_lAr$esjava$0()) {
                                        this.cursor = this.limit - v_5;
                                        break lab6;
                                    }
                                    this.bra = this.cursor;
                                    this.slice_del$esjava$0();
                                    if (!this.r_stem_suffix_chain_before_ki$esjava$0()) {
                                        this.cursor = this.limit - v_5;
                                        break lab6;
                                    }
                                } while (false);
                            } while (false);
                        } while (false);
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab7: do {
                        if (!this.r_mark_nUn$esjava$0()) {
                            break lab7;
                        }
                        this.bra = this.cursor;
                        this.slice_del$esjava$0();
                        v_6 = this.limit - this.cursor;
                        lab8: do {
                            this.ket = this.cursor;
                            lab9: do {
                                v_7 = this.limit - this.cursor;
                                lab10: do {
                                    if (!this.r_mark_lArI$esjava$0()) {
                                        break lab10;
                                    }
                                    this.bra = this.cursor;
                                    this.slice_del$esjava$0();
                                    break lab9;
                                } while (false);
                                this.cursor = this.limit - v_7;
                                lab11: do {
                                    this.ket = this.cursor;
                                    lab12: do {
                                        v_8 = this.limit - this.cursor;
                                        lab13: do {
                                            if (!this.r_mark_possessives$esjava$0()) {
                                                break lab13;
                                            }
                                            break lab12;
                                        } while (false);
                                        this.cursor = this.limit - v_8;
                                        if (!this.r_mark_sU$esjava$0()) {
                                            break lab11;
                                        }
                                    } while (false);
                                    this.bra = this.cursor;
                                    this.slice_del$esjava$0();
                                    v_9 = this.limit - this.cursor;
                                    lab14: do {
                                        this.ket = this.cursor;
                                        if (!this.r_mark_lAr$esjava$0()) {
                                            this.cursor = this.limit - v_9;
                                            break lab14;
                                        }
                                        this.bra = this.cursor;
                                        this.slice_del$esjava$0();
                                        if (!this.r_stem_suffix_chain_before_ki$esjava$0()) {
                                            this.cursor = this.limit - v_9;
                                            break lab14;
                                        }
                                    } while (false);
                                    break lab9;
                                } while (false);
                                this.cursor = this.limit - v_7;
                                if (!this.r_stem_suffix_chain_before_ki$esjava$0()) {
                                    this.cursor = this.limit - v_6;
                                    break lab8;
                                }
                            } while (false);
                        } while (false);
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    if (!this.r_mark_ndA$esjava$0()) {
                        return false;
                    }
                    lab15: do {
                        v_10 = this.limit - this.cursor;
                        lab16: do {
                            if (!this.r_mark_lArI$esjava$0()) {
                                break lab16;
                            }
                            this.bra = this.cursor;
                            this.slice_del$esjava$0();
                            break lab15;
                        } while (false);
                        this.cursor = this.limit - v_10;
                        lab17: do {
                            if (!this.r_mark_sU$esjava$0()) {
                                break lab17;
                            }
                            this.bra = this.cursor;
                            this.slice_del$esjava$0();
                            v_11 = this.limit - this.cursor;
                            lab18: do {
                                this.ket = this.cursor;
                                if (!this.r_mark_lAr$esjava$0()) {
                                    this.cursor = this.limit - v_11;
                                    break lab18;
                                }
                                this.bra = this.cursor;
                                this.slice_del$esjava$0();
                                if (!this.r_stem_suffix_chain_before_ki$esjava$0()) {
                                    this.cursor = this.limit - v_11;
                                    break lab18;
                                }
                            } while (false);
                            break lab15;
                        } while (false);
                        this.cursor = this.limit - v_10;
                        if (!this.r_stem_suffix_chain_before_ki$esjava$0()) {
                            return false;
                        }
                    } while (false);
                } while (false);
                return true;
            }
        }, {
            key: 'r_stem_noun_suffixes$esjava$0',
            value: function r_stem_noun_suffixes$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                var v_8 = void 0;
                var v_9 = void 0;
                var v_10 = void 0;
                var v_11 = void 0;
                var v_12 = void 0;
                var v_13 = void 0;
                var v_14 = void 0;
                var v_15 = void 0;
                var v_16 = void 0;
                var v_17 = void 0;
                var v_18 = void 0;
                var v_19 = void 0;
                var v_20 = void 0;
                var v_21 = void 0;
                var v_22 = void 0;
                var v_23 = void 0;
                var v_24 = void 0;
                var v_25 = void 0;
                var v_26 = void 0;
                var v_27 = void 0;
                lab0: do {
                    v_1 = this.limit - this.cursor;
                    lab1: do {
                        this.ket = this.cursor;
                        if (!this.r_mark_lAr$esjava$0()) {
                            break lab1;
                        }
                        this.bra = this.cursor;
                        this.slice_del$esjava$0();
                        v_2 = this.limit - this.cursor;
                        lab2: do {
                            if (!this.r_stem_suffix_chain_before_ki$esjava$0()) {
                                this.cursor = this.limit - v_2;
                                break lab2;
                            }
                        } while (false);
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab3: do {
                        this.ket = this.cursor;
                        if (!this.r_mark_ncA$esjava$0()) {
                            break lab3;
                        }
                        this.bra = this.cursor;
                        this.slice_del$esjava$0();
                        v_3 = this.limit - this.cursor;
                        lab4: do {
                            lab5: do {
                                v_4 = this.limit - this.cursor;
                                lab6: do {
                                    this.ket = this.cursor;
                                    if (!this.r_mark_lArI$esjava$0()) {
                                        break lab6;
                                    }
                                    this.bra = this.cursor;
                                    this.slice_del$esjava$0();
                                    break lab5;
                                } while (false);
                                this.cursor = this.limit - v_4;
                                lab7: do {
                                    this.ket = this.cursor;
                                    lab8: do {
                                        v_5 = this.limit - this.cursor;
                                        lab9: do {
                                            if (!this.r_mark_possessives$esjava$0()) {
                                                break lab9;
                                            }
                                            break lab8;
                                        } while (false);
                                        this.cursor = this.limit - v_5;
                                        if (!this.r_mark_sU$esjava$0()) {
                                            break lab7;
                                        }
                                    } while (false);
                                    this.bra = this.cursor;
                                    this.slice_del$esjava$0();
                                    v_6 = this.limit - this.cursor;
                                    lab10: do {
                                        this.ket = this.cursor;
                                        if (!this.r_mark_lAr$esjava$0()) {
                                            this.cursor = this.limit - v_6;
                                            break lab10;
                                        }
                                        this.bra = this.cursor;
                                        this.slice_del$esjava$0();
                                        if (!this.r_stem_suffix_chain_before_ki$esjava$0()) {
                                            this.cursor = this.limit - v_6;
                                            break lab10;
                                        }
                                    } while (false);
                                    break lab5;
                                } while (false);
                                this.cursor = this.limit - v_4;
                                this.ket = this.cursor;
                                if (!this.r_mark_lAr$esjava$0()) {
                                    this.cursor = this.limit - v_3;
                                    break lab4;
                                }
                                this.bra = this.cursor;
                                this.slice_del$esjava$0();
                                if (!this.r_stem_suffix_chain_before_ki$esjava$0()) {
                                    this.cursor = this.limit - v_3;
                                    break lab4;
                                }
                            } while (false);
                        } while (false);
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab11: do {
                        this.ket = this.cursor;
                        lab12: do {
                            v_7 = this.limit - this.cursor;
                            lab13: do {
                                if (!this.r_mark_ndA$esjava$0()) {
                                    break lab13;
                                }
                                break lab12;
                            } while (false);
                            this.cursor = this.limit - v_7;
                            if (!this.r_mark_nA$esjava$0()) {
                                break lab11;
                            }
                        } while (false);
                        lab14: do {
                            v_8 = this.limit - this.cursor;
                            lab15: do {
                                if (!this.r_mark_lArI$esjava$0()) {
                                    break lab15;
                                }
                                this.bra = this.cursor;
                                this.slice_del$esjava$0();
                                break lab14;
                            } while (false);
                            this.cursor = this.limit - v_8;
                            lab16: do {
                                if (!this.r_mark_sU$esjava$0()) {
                                    break lab16;
                                }
                                this.bra = this.cursor;
                                this.slice_del$esjava$0();
                                v_9 = this.limit - this.cursor;
                                lab17: do {
                                    this.ket = this.cursor;
                                    if (!this.r_mark_lAr$esjava$0()) {
                                        this.cursor = this.limit - v_9;
                                        break lab17;
                                    }
                                    this.bra = this.cursor;
                                    this.slice_del$esjava$0();
                                    if (!this.r_stem_suffix_chain_before_ki$esjava$0()) {
                                        this.cursor = this.limit - v_9;
                                        break lab17;
                                    }
                                } while (false);
                                break lab14;
                            } while (false);
                            this.cursor = this.limit - v_8;
                            if (!this.r_stem_suffix_chain_before_ki$esjava$0()) {
                                break lab11;
                            }
                        } while (false);
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab18: do {
                        this.ket = this.cursor;
                        lab19: do {
                            v_10 = this.limit - this.cursor;
                            lab20: do {
                                if (!this.r_mark_ndAn$esjava$0()) {
                                    break lab20;
                                }
                                break lab19;
                            } while (false);
                            this.cursor = this.limit - v_10;
                            if (!this.r_mark_nU$esjava$0()) {
                                break lab18;
                            }
                        } while (false);
                        lab21: do {
                            v_11 = this.limit - this.cursor;
                            lab22: do {
                                if (!this.r_mark_sU$esjava$0()) {
                                    break lab22;
                                }
                                this.bra = this.cursor;
                                this.slice_del$esjava$0();
                                v_12 = this.limit - this.cursor;
                                lab23: do {
                                    this.ket = this.cursor;
                                    if (!this.r_mark_lAr$esjava$0()) {
                                        this.cursor = this.limit - v_12;
                                        break lab23;
                                    }
                                    this.bra = this.cursor;
                                    this.slice_del$esjava$0();
                                    if (!this.r_stem_suffix_chain_before_ki$esjava$0()) {
                                        this.cursor = this.limit - v_12;
                                        break lab23;
                                    }
                                } while (false);
                                break lab21;
                            } while (false);
                            this.cursor = this.limit - v_11;
                            if (!this.r_mark_lArI$esjava$0()) {
                                break lab18;
                            }
                        } while (false);
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab24: do {
                        this.ket = this.cursor;
                        if (!this.r_mark_DAn$esjava$0()) {
                            break lab24;
                        }
                        this.bra = this.cursor;
                        this.slice_del$esjava$0();
                        v_13 = this.limit - this.cursor;
                        lab25: do {
                            this.ket = this.cursor;
                            lab26: do {
                                v_14 = this.limit - this.cursor;
                                lab27: do {
                                    if (!this.r_mark_possessives$esjava$0()) {
                                        break lab27;
                                    }
                                    this.bra = this.cursor;
                                    this.slice_del$esjava$0();
                                    v_15 = this.limit - this.cursor;
                                    lab28: do {
                                        this.ket = this.cursor;
                                        if (!this.r_mark_lAr$esjava$0()) {
                                            this.cursor = this.limit - v_15;
                                            break lab28;
                                        }
                                        this.bra = this.cursor;
                                        this.slice_del$esjava$0();
                                        if (!this.r_stem_suffix_chain_before_ki$esjava$0()) {
                                            this.cursor = this.limit - v_15;
                                            break lab28;
                                        }
                                    } while (false);
                                    break lab26;
                                } while (false);
                                this.cursor = this.limit - v_14;
                                lab29: do {
                                    if (!this.r_mark_lAr$esjava$0()) {
                                        break lab29;
                                    }
                                    this.bra = this.cursor;
                                    this.slice_del$esjava$0();
                                    v_16 = this.limit - this.cursor;
                                    lab30: do {
                                        if (!this.r_stem_suffix_chain_before_ki$esjava$0()) {
                                            this.cursor = this.limit - v_16;
                                            break lab30;
                                        }
                                    } while (false);
                                    break lab26;
                                } while (false);
                                this.cursor = this.limit - v_14;
                                if (!this.r_stem_suffix_chain_before_ki$esjava$0()) {
                                    this.cursor = this.limit - v_13;
                                    break lab25;
                                }
                            } while (false);
                        } while (false);
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab31: do {
                        this.ket = this.cursor;
                        lab32: do {
                            v_17 = this.limit - this.cursor;
                            lab33: do {
                                if (!this.r_mark_nUn$esjava$0()) {
                                    break lab33;
                                }
                                break lab32;
                            } while (false);
                            this.cursor = this.limit - v_17;
                            if (!this.r_mark_ylA$esjava$0()) {
                                break lab31;
                            }
                        } while (false);
                        this.bra = this.cursor;
                        this.slice_del$esjava$0();
                        v_18 = this.limit - this.cursor;
                        lab34: do {
                            lab35: do {
                                v_19 = this.limit - this.cursor;
                                lab36: do {
                                    this.ket = this.cursor;
                                    if (!this.r_mark_lAr$esjava$0()) {
                                        break lab36;
                                    }
                                    this.bra = this.cursor;
                                    this.slice_del$esjava$0();
                                    if (!this.r_stem_suffix_chain_before_ki$esjava$0()) {
                                        break lab36;
                                    }
                                    break lab35;
                                } while (false);
                                this.cursor = this.limit - v_19;
                                lab37: do {
                                    this.ket = this.cursor;
                                    lab38: do {
                                        v_20 = this.limit - this.cursor;
                                        lab39: do {
                                            if (!this.r_mark_possessives$esjava$0()) {
                                                break lab39;
                                            }
                                            break lab38;
                                        } while (false);
                                        this.cursor = this.limit - v_20;
                                        if (!this.r_mark_sU$esjava$0()) {
                                            break lab37;
                                        }
                                    } while (false);
                                    this.bra = this.cursor;
                                    this.slice_del$esjava$0();
                                    v_21 = this.limit - this.cursor;
                                    lab40: do {
                                        this.ket = this.cursor;
                                        if (!this.r_mark_lAr$esjava$0()) {
                                            this.cursor = this.limit - v_21;
                                            break lab40;
                                        }
                                        this.bra = this.cursor;
                                        this.slice_del$esjava$0();
                                        if (!this.r_stem_suffix_chain_before_ki$esjava$0()) {
                                            this.cursor = this.limit - v_21;
                                            break lab40;
                                        }
                                    } while (false);
                                    break lab35;
                                } while (false);
                                this.cursor = this.limit - v_19;
                                if (!this.r_stem_suffix_chain_before_ki$esjava$0()) {
                                    this.cursor = this.limit - v_18;
                                    break lab34;
                                }
                            } while (false);
                        } while (false);
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab41: do {
                        this.ket = this.cursor;
                        if (!this.r_mark_lArI$esjava$0()) {
                            break lab41;
                        }
                        this.bra = this.cursor;
                        this.slice_del$esjava$0();
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab42: do {
                        if (!this.r_stem_suffix_chain_before_ki$esjava$0()) {
                            break lab42;
                        }
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    lab43: do {
                        this.ket = this.cursor;
                        lab44: do {
                            v_22 = this.limit - this.cursor;
                            lab45: do {
                                if (!this.r_mark_DA$esjava$0()) {
                                    break lab45;
                                }
                                break lab44;
                            } while (false);
                            this.cursor = this.limit - v_22;
                            lab46: do {
                                if (!this.r_mark_yU$esjava$0()) {
                                    break lab46;
                                }
                                break lab44;
                            } while (false);
                            this.cursor = this.limit - v_22;
                            if (!this.r_mark_yA$esjava$0()) {
                                break lab43;
                            }
                        } while (false);
                        this.bra = this.cursor;
                        this.slice_del$esjava$0();
                        v_23 = this.limit - this.cursor;
                        lab47: do {
                            this.ket = this.cursor;
                            lab48: do {
                                v_24 = this.limit - this.cursor;
                                lab49: do {
                                    if (!this.r_mark_possessives$esjava$0()) {
                                        break lab49;
                                    }
                                    this.bra = this.cursor;
                                    this.slice_del$esjava$0();
                                    v_25 = this.limit - this.cursor;
                                    lab50: do {
                                        this.ket = this.cursor;
                                        if (!this.r_mark_lAr$esjava$0()) {
                                            this.cursor = this.limit - v_25;
                                            break lab50;
                                        }
                                    } while (false);
                                    break lab48;
                                } while (false);
                                this.cursor = this.limit - v_24;
                                if (!this.r_mark_lAr$esjava$0()) {
                                    this.cursor = this.limit - v_23;
                                    break lab47;
                                }
                            } while (false);
                            this.bra = this.cursor;
                            this.slice_del$esjava$0();
                            this.ket = this.cursor;
                            if (!this.r_stem_suffix_chain_before_ki$esjava$0()) {
                                this.cursor = this.limit - v_23;
                                break lab47;
                            }
                        } while (false);
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_1;
                    this.ket = this.cursor;
                    lab51: do {
                        v_26 = this.limit - this.cursor;
                        lab52: do {
                            if (!this.r_mark_possessives$esjava$0()) {
                                break lab52;
                            }
                            break lab51;
                        } while (false);
                        this.cursor = this.limit - v_26;
                        if (!this.r_mark_sU$esjava$0()) {
                            return false;
                        }
                    } while (false);
                    this.bra = this.cursor;
                    this.slice_del$esjava$0();
                    v_27 = this.limit - this.cursor;
                    lab53: do {
                        this.ket = this.cursor;
                        if (!this.r_mark_lAr$esjava$0()) {
                            this.cursor = this.limit - v_27;
                            break lab53;
                        }
                        this.bra = this.cursor;
                        this.slice_del$esjava$0();
                        if (!this.r_stem_suffix_chain_before_ki$esjava$0()) {
                            this.cursor = this.limit - v_27;
                            break lab53;
                        }
                    } while (false);
                } while (false);
                return true;
            }
        }, {
            key: 'r_post_process_last_consonants$esjava$0',
            value: function r_post_process_last_consonants$esjava$0() {
                var among_var = void 0;
                this.ket = this.cursor;
                among_var = this.find_among_b$esjava$1(turkishStemmer.a_23);
                if (among_var === 0) {
                    return false;
                }
                this.bra = this.cursor;
                switch (among_var) {
                    case 0:
                        return false;
                    case 1:
                        this.slice_from$esjava$1("p");
                        break;
                    case 2:
                        this.slice_from$esjava$1('\u00E7');
                        break;
                    case 3:
                        this.slice_from$esjava$1("t");
                        break;
                    case 4:
                        this.slice_from$esjava$1("k");
                        break;
                }
                return true;
            }
        }, {
            key: 'r_append_U_to_stems_ending_with_d_or_g$esjava$0',
            value: function r_append_U_to_stems_ending_with_d_or_g$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                var v_4 = void 0;
                var v_5 = void 0;
                var v_6 = void 0;
                var v_7 = void 0;
                var v_8 = void 0;
                var v_9 = void 0;
                var v_10 = void 0;
                var v_11 = void 0;
                var v_12 = void 0;
                var v_13 = void 0;
                var v_14 = void 0;
                var v_15 = void 0;
                v_1 = this.limit - this.cursor;
                lab0: do {
                    v_2 = this.limit - this.cursor;
                    lab1: do {
                        if (!this.eq_s_b$esjava$1("d")) {
                            break lab1;
                        }
                        break lab0;
                    } while (false);
                    this.cursor = this.limit - v_2;
                    if (!this.eq_s_b$esjava$1("g")) {
                        return false;
                    }
                } while (false);
                this.cursor = this.limit - v_1;
                lab2: do {
                    v_3 = this.limit - this.cursor;
                    lab3: do {
                        v_4 = this.limit - this.cursor;
                        golab4: while (true) {
                            v_5 = this.limit - this.cursor;
                            lab5: do {
                                if (!this.in_grouping_b$esjava$3(turkishStemmer.g_vowel, 97, 305)) {
                                    break lab5;
                                }
                                this.cursor = this.limit - v_5;
                                break golab4;
                            } while (false);
                            this.cursor = this.limit - v_5;
                            if (this.cursor <= this.limit_backward) {
                                break lab3;
                            }
                            this.cursor--;
                        }
                        lab6: do {
                            v_6 = this.limit - this.cursor;
                            lab7: do {
                                if (!this.eq_s_b$esjava$1("a")) {
                                    break lab7;
                                }
                                break lab6;
                            } while (false);
                            this.cursor = this.limit - v_6;
                            if (!this.eq_s_b$esjava$1('\u0131')) {
                                break lab3;
                            }
                        } while (false);
                        this.cursor = this.limit - v_4;
                        {
                            var c = this.cursor;
                            this.insert$esjava$3(this.cursor, this.cursor, '\u0131');
                            this.cursor = c;
                        }
                        break lab2;
                    } while (false);
                    this.cursor = this.limit - v_3;
                    lab8: do {
                        v_7 = this.limit - this.cursor;
                        golab9: while (true) {
                            v_8 = this.limit - this.cursor;
                            lab10: do {
                                if (!this.in_grouping_b$esjava$3(turkishStemmer.g_vowel, 97, 305)) {
                                    break lab10;
                                }
                                this.cursor = this.limit - v_8;
                                break golab9;
                            } while (false);
                            this.cursor = this.limit - v_8;
                            if (this.cursor <= this.limit_backward) {
                                break lab8;
                            }
                            this.cursor--;
                        }
                        lab11: do {
                            v_9 = this.limit - this.cursor;
                            lab12: do {
                                if (!this.eq_s_b$esjava$1("e")) {
                                    break lab12;
                                }
                                break lab11;
                            } while (false);
                            this.cursor = this.limit - v_9;
                            if (!this.eq_s_b$esjava$1("i")) {
                                break lab8;
                            }
                        } while (false);
                        this.cursor = this.limit - v_7;
                        {
                            var _c3 = this.cursor;
                            this.insert$esjava$3(this.cursor, this.cursor, "i");
                            this.cursor = _c3;
                        }
                        break lab2;
                    } while (false);
                    this.cursor = this.limit - v_3;
                    lab13: do {
                        v_10 = this.limit - this.cursor;
                        golab14: while (true) {
                            v_11 = this.limit - this.cursor;
                            lab15: do {
                                if (!this.in_grouping_b$esjava$3(turkishStemmer.g_vowel, 97, 305)) {
                                    break lab15;
                                }
                                this.cursor = this.limit - v_11;
                                break golab14;
                            } while (false);
                            this.cursor = this.limit - v_11;
                            if (this.cursor <= this.limit_backward) {
                                break lab13;
                            }
                            this.cursor--;
                        }
                        lab16: do {
                            v_12 = this.limit - this.cursor;
                            lab17: do {
                                if (!this.eq_s_b$esjava$1("o")) {
                                    break lab17;
                                }
                                break lab16;
                            } while (false);
                            this.cursor = this.limit - v_12;
                            if (!this.eq_s_b$esjava$1("u")) {
                                break lab13;
                            }
                        } while (false);
                        this.cursor = this.limit - v_10;
                        {
                            var _c4 = this.cursor;
                            this.insert$esjava$3(this.cursor, this.cursor, "u");
                            this.cursor = _c4;
                        }
                        break lab2;
                    } while (false);
                    this.cursor = this.limit - v_3;
                    v_13 = this.limit - this.cursor;
                    golab18: while (true) {
                        v_14 = this.limit - this.cursor;
                        lab19: do {
                            if (!this.in_grouping_b$esjava$3(turkishStemmer.g_vowel, 97, 305)) {
                                break lab19;
                            }
                            this.cursor = this.limit - v_14;
                            break golab18;
                        } while (false);
                        this.cursor = this.limit - v_14;
                        if (this.cursor <= this.limit_backward) {
                            return false;
                        }
                        this.cursor--;
                    }
                    lab20: do {
                        v_15 = this.limit - this.cursor;
                        lab21: do {
                            if (!this.eq_s_b$esjava$1('\u00F6')) {
                                break lab21;
                            }
                            break lab20;
                        } while (false);
                        this.cursor = this.limit - v_15;
                        if (!this.eq_s_b$esjava$1('\u00FC')) {
                            return false;
                        }
                    } while (false);
                    this.cursor = this.limit - v_13;
                    {
                        var _c5 = this.cursor;
                        this.insert$esjava$3(this.cursor, this.cursor, '\u00FC');
                        this.cursor = _c5;
                    }
                } while (false);
                return true;
            }
        }, {
            key: 'r_more_than_one_syllable_word$esjava$0',
            value: function r_more_than_one_syllable_word$esjava$0() {
                var v_1 = void 0;
                var v_3 = void 0;
                v_1 = this.cursor;
                {
                    var v_2 = 2;
                    replab0: while (true) {
                        v_3 = this.cursor;
                        lab1: do {
                            golab2: while (true) {
                                lab3: do {
                                    if (!this.in_grouping$esjava$3(turkishStemmer.g_vowel, 97, 305)) {
                                        break lab3;
                                    }
                                    break golab2;
                                } while (false);
                                if (this.cursor >= this.limit) {
                                    break lab1;
                                }
                                this.cursor++;
                            }
                            v_2--;
                            continue replab0;
                        } while (false);
                        this.cursor = v_3;
                        break replab0;
                    }
                    if (v_2 > 0) {
                        return false;
                    }
                }
                this.cursor = v_1;
                return true;
            }
        }, {
            key: 'r_is_reserved_word$esjava$0',
            value: function r_is_reserved_word$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_4 = void 0;
                lab0: do {
                    v_1 = this.cursor;
                    lab1: do {
                        v_2 = this.cursor;
                        golab2: while (true) {
                            lab3: do {
                                if (!this.eq_s$esjava$1("ad")) {
                                    break lab3;
                                }
                                break golab2;
                            } while (false);
                            if (this.cursor >= this.limit) {
                                break lab1;
                            }
                            this.cursor++;
                        }
                        this.I_strlen = 2;
                        if (!(this.I_strlen === this.limit)) {
                            break lab1;
                        }
                        this.cursor = v_2;
                        break lab0;
                    } while (false);
                    this.cursor = v_1;
                    v_4 = this.cursor;
                    golab4: while (true) {
                        lab5: do {
                            if (!this.eq_s$esjava$1("soyad")) {
                                break lab5;
                            }
                            break golab4;
                        } while (false);
                        if (this.cursor >= this.limit) {
                            return false;
                        }
                        this.cursor++;
                    }
                    this.I_strlen = 5;
                    if (!(this.I_strlen === this.limit)) {
                        return false;
                    }
                    this.cursor = v_4;
                } while (false);
                return true;
            }
        }, {
            key: 'r_postlude$esjava$0',
            value: function r_postlude$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                var v_3 = void 0;
                {
                    v_1 = this.cursor;
                    lab0: do {
                        if (!this.r_is_reserved_word$esjava$0()) {
                            break lab0;
                        }
                        return false;
                    } while (false);
                    this.cursor = v_1;
                }
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                v_2 = this.limit - this.cursor;
                lab1: do {
                    if (!this.r_append_U_to_stems_ending_with_d_or_g$esjava$0()) {
                        break lab1;
                    }
                } while (false);
                this.cursor = this.limit - v_2;
                v_3 = this.limit - this.cursor;
                lab2: do {
                    if (!this.r_post_process_last_consonants$esjava$0()) {
                        break lab2;
                    }
                } while (false);
                this.cursor = this.limit - v_3;
                this.cursor = this.limit_backward;
                return true;
            }
        }, {
            key: 'stem$esjava$0',
            value: function stem$esjava$0() {
                var v_1 = void 0;
                var v_2 = void 0;
                if (!this.r_more_than_one_syllable_word$esjava$0()) {
                    return false;
                }
                this.limit_backward = this.cursor;
                this.cursor = this.limit;
                v_1 = this.limit - this.cursor;
                lab0: do {
                    if (!this.r_stem_nominal_verb_suffixes$esjava$0()) {
                        break lab0;
                    }
                } while (false);
                this.cursor = this.limit - v_1;
                if (!this.B_continue_stemming_noun_suffixes) {
                    return false;
                }
                v_2 = this.limit - this.cursor;
                lab1: do {
                    if (!this.r_stem_noun_suffixes$esjava$0()) {
                        break lab1;
                    }
                } while (false);
                this.cursor = this.limit - v_2;
                this.cursor = this.limit_backward;
                if (!this.r_postlude$esjava$0()) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'stem',
            value: function stem() {
                var _get50;

                for (var _len49 = arguments.length, args = Array(_len49), _key49 = 0; _key49 < _len49; _key49++) {
                    args[_key49] = arguments[_key49];
                }

                switch (args.length) {
                    case 0:
                        return this.stem$esjava$0.apply(this, args);
                }
                return (_get50 = _get(Object.getPrototypeOf(turkishStemmer.prototype), 'stem', this)).call.apply(_get50, [this].concat(args));
            }
        }, {
            key: 'B_continue_stemming_noun_suffixes',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$B_continue_stemming_noun_suffixes') ? this._$esjava$B_continue_stemming_noun_suffixes : this._$esjava$B_continue_stemming_noun_suffixes = false;
            },
            set: function set(v) {
                this._$esjava$B_continue_stemming_noun_suffixes = v;
            }
        }, {
            key: 'I_strlen',
            get: function get() {
                return Object.prototype.hasOwnProperty.call(this, '_$esjava$I_strlen') ? this._$esjava$I_strlen : this._$esjava$I_strlen = 0;
            },
            set: function set(v) {
                this._$esjava$I_strlen = v;
            }
        }], [{
            key: 'a_0',
            get: function get() {
                delete turkishStemmer.a_0;
                return turkishStemmer.a_0 = [new Among("m", -1, -1), new Among("n", -1, -1), new Among("miz", -1, -1), new Among("niz", -1, -1), new Among("muz", -1, -1), new Among("nuz", -1, -1), new Among('m\u00FCz', -1, -1), new Among('n\u00FCz', -1, -1), new Among('m\u0131z', -1, -1), new Among('n\u0131z', -1, -1)];
            }
        }, {
            key: 'a_1',
            get: function get() {
                delete turkishStemmer.a_1;
                return turkishStemmer.a_1 = [new Among("leri", -1, -1), new Among('lar\u0131', -1, -1)];
            }
        }, {
            key: 'a_2',
            get: function get() {
                delete turkishStemmer.a_2;
                return turkishStemmer.a_2 = [new Among("ni", -1, -1), new Among("nu", -1, -1), new Among('n\u00FC', -1, -1), new Among('n\u0131', -1, -1)];
            }
        }, {
            key: 'a_3',
            get: function get() {
                delete turkishStemmer.a_3;
                return turkishStemmer.a_3 = [new Among("in", -1, -1), new Among("un", -1, -1), new Among('\u00FCn', -1, -1), new Among('\u0131n', -1, -1)];
            }
        }, {
            key: 'a_4',
            get: function get() {
                delete turkishStemmer.a_4;
                return turkishStemmer.a_4 = [new Among("a", -1, -1), new Among("e", -1, -1)];
            }
        }, {
            key: 'a_5',
            get: function get() {
                delete turkishStemmer.a_5;
                return turkishStemmer.a_5 = [new Among("na", -1, -1), new Among("ne", -1, -1)];
            }
        }, {
            key: 'a_6',
            get: function get() {
                delete turkishStemmer.a_6;
                return turkishStemmer.a_6 = [new Among("da", -1, -1), new Among("ta", -1, -1), new Among("de", -1, -1), new Among("te", -1, -1)];
            }
        }, {
            key: 'a_7',
            get: function get() {
                delete turkishStemmer.a_7;
                return turkishStemmer.a_7 = [new Among("nda", -1, -1), new Among("nde", -1, -1)];
            }
        }, {
            key: 'a_8',
            get: function get() {
                delete turkishStemmer.a_8;
                return turkishStemmer.a_8 = [new Among("dan", -1, -1), new Among("tan", -1, -1), new Among("den", -1, -1), new Among("ten", -1, -1)];
            }
        }, {
            key: 'a_9',
            get: function get() {
                delete turkishStemmer.a_9;
                return turkishStemmer.a_9 = [new Among("ndan", -1, -1), new Among("nden", -1, -1)];
            }
        }, {
            key: 'a_10',
            get: function get() {
                delete turkishStemmer.a_10;
                return turkishStemmer.a_10 = [new Among("la", -1, -1), new Among("le", -1, -1)];
            }
        }, {
            key: 'a_11',
            get: function get() {
                delete turkishStemmer.a_11;
                return turkishStemmer.a_11 = [new Among("ca", -1, -1), new Among("ce", -1, -1)];
            }
        }, {
            key: 'a_12',
            get: function get() {
                delete turkishStemmer.a_12;
                return turkishStemmer.a_12 = [new Among("im", -1, -1), new Among("um", -1, -1), new Among('\u00FCm', -1, -1), new Among('\u0131m', -1, -1)];
            }
        }, {
            key: 'a_13',
            get: function get() {
                delete turkishStemmer.a_13;
                return turkishStemmer.a_13 = [new Among("sin", -1, -1), new Among("sun", -1, -1), new Among('s\u00FCn', -1, -1), new Among('s\u0131n', -1, -1)];
            }
        }, {
            key: 'a_14',
            get: function get() {
                delete turkishStemmer.a_14;
                return turkishStemmer.a_14 = [new Among("iz", -1, -1), new Among("uz", -1, -1), new Among('\u00FCz', -1, -1), new Among('\u0131z', -1, -1)];
            }
        }, {
            key: 'a_15',
            get: function get() {
                delete turkishStemmer.a_15;
                return turkishStemmer.a_15 = [new Among("siniz", -1, -1), new Among("sunuz", -1, -1), new Among('s\u00FCn\u00FCz', -1, -1), new Among('s\u0131n\u0131z', -1, -1)];
            }
        }, {
            key: 'a_16',
            get: function get() {
                delete turkishStemmer.a_16;
                return turkishStemmer.a_16 = [new Among("lar", -1, -1), new Among("ler", -1, -1)];
            }
        }, {
            key: 'a_17',
            get: function get() {
                delete turkishStemmer.a_17;
                return turkishStemmer.a_17 = [new Among("niz", -1, -1), new Among("nuz", -1, -1), new Among('n\u00FCz', -1, -1), new Among('n\u0131z', -1, -1)];
            }
        }, {
            key: 'a_18',
            get: function get() {
                delete turkishStemmer.a_18;
                return turkishStemmer.a_18 = [new Among("dir", -1, -1), new Among("tir", -1, -1), new Among("dur", -1, -1), new Among("tur", -1, -1), new Among('d\u00FCr', -1, -1), new Among('t\u00FCr', -1, -1), new Among('d\u0131r', -1, -1), new Among('t\u0131r', -1, -1)];
            }
        }, {
            key: 'a_19',
            get: function get() {
                delete turkishStemmer.a_19;
                return turkishStemmer.a_19 = [new Among('cas\u0131na', -1, -1), new Among("cesine", -1, -1)];
            }
        }, {
            key: 'a_20',
            get: function get() {
                delete turkishStemmer.a_20;
                return turkishStemmer.a_20 = [new Among("di", -1, -1), new Among("ti", -1, -1), new Among("dik", -1, -1), new Among("tik", -1, -1), new Among("duk", -1, -1), new Among("tuk", -1, -1), new Among('d\u00FCk', -1, -1), new Among('t\u00FCk', -1, -1), new Among('d\u0131k', -1, -1), new Among('t\u0131k', -1, -1), new Among("dim", -1, -1), new Among("tim", -1, -1), new Among("dum", -1, -1), new Among("tum", -1, -1), new Among('d\u00FCm', -1, -1), new Among('t\u00FCm', -1, -1), new Among('d\u0131m', -1, -1), new Among('t\u0131m', -1, -1), new Among("din", -1, -1), new Among("tin", -1, -1), new Among("dun", -1, -1), new Among("tun", -1, -1), new Among('d\u00FCn', -1, -1), new Among('t\u00FCn', -1, -1), new Among('d\u0131n', -1, -1), new Among('t\u0131n', -1, -1), new Among("du", -1, -1), new Among("tu", -1, -1), new Among('d\u00FC', -1, -1), new Among('t\u00FC', -1, -1), new Among('d\u0131', -1, -1), new Among('t\u0131', -1, -1)];
            }
        }, {
            key: 'a_21',
            get: function get() {
                delete turkishStemmer.a_21;
                return turkishStemmer.a_21 = [new Among("sa", -1, -1), new Among("se", -1, -1), new Among("sak", -1, -1), new Among("sek", -1, -1), new Among("sam", -1, -1), new Among("sem", -1, -1), new Among("san", -1, -1), new Among("sen", -1, -1)];
            }
        }, {
            key: 'a_22',
            get: function get() {
                delete turkishStemmer.a_22;
                return turkishStemmer.a_22 = [new Among('mi\u015F', -1, -1), new Among('mu\u015F', -1, -1), new Among('m\u00FC\u015F', -1, -1), new Among('m\u0131\u015F', -1, -1)];
            }
        }, {
            key: 'a_23',
            get: function get() {
                delete turkishStemmer.a_23;
                return turkishStemmer.a_23 = [new Among("b", -1, 1), new Among("c", -1, 2), new Among("d", -1, 3), new Among('\u011F', -1, 4)];
            }
        }, {
            key: 'g_vowel',
            get: function get() {
                delete turkishStemmer.g_vowel;
                return turkishStemmer.g_vowel = [17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 8, 0, 0, 0, 0, 0, 0, 1];
            }
        }, {
            key: 'g_U',
            get: function get() {
                delete turkishStemmer.g_U;
                return turkishStemmer.g_U = [1, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 1];
            }
        }, {
            key: 'g_vowel1',
            get: function get() {
                delete turkishStemmer.g_vowel1;
                return turkishStemmer.g_vowel1 = [1, 64, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
            }
        }, {
            key: 'g_vowel2',
            get: function get() {
                delete turkishStemmer.g_vowel2;
                return turkishStemmer.g_vowel2 = [17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 130];
            }
        }, {
            key: 'g_vowel3',
            get: function get() {
                delete turkishStemmer.g_vowel3;
                return turkishStemmer.g_vowel3 = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
            }
        }, {
            key: 'g_vowel4',
            get: function get() {
                delete turkishStemmer.g_vowel4;
                return turkishStemmer.g_vowel4 = [17];
            }
        }, {
            key: 'g_vowel5',
            get: function get() {
                delete turkishStemmer.g_vowel5;
                return turkishStemmer.g_vowel5 = [65];
            }
        }, {
            key: 'g_vowel6',
            get: function get() {
                delete turkishStemmer.g_vowel6;
                return turkishStemmer.g_vowel6 = [65];
            }
        }]);

        return turkishStemmer;
    }(SnowballStemmer);

    function newStemmer(lng) {
        var stemMap = {

            arabic: arabicStemmer,

            armenian: armenianStemmer,

            basque: basqueStemmer,

            catalan: catalanStemmer,

            czech: czechStemmer,

            danish: danishStemmer,

            dutch: dutchStemmer,

            english: englishStemmer,

            finnish: finnishStemmer,

            french: frenchStemmer,

            german: germanStemmer,

            hungarian: hungarianStemmer,

            italian: italianStemmer,

            irish: irishStemmer,

            norwegian: norwegianStemmer,

            porter: porterStemmer,

            portuguese: portugueseStemmer,

            romanian: romanianStemmer,

            russian: russianStemmer,

            spanish: spanishStemmer,

            slovene: sloveneStemmer,

            swedish: swedishStemmer,

            tamil: tamilStemmer,

            turkish: turkishStemmer

        };
        var stemmer = new stemMap[lng.toLowerCase()]();
        return {
            stem: function stem(word) {
                stemmer.setCurrent(word);
                stemmer.stem();
                return stemmer.getCurrent();
            }
        };
    }
    function algorithms() {
        return ['arabic', 'armenian', 'basque', 'catalan', 'czech', 'danish', 'dutch', 'english', 'finnish', 'french', 'german', 'hungarian', 'italian', 'irish', 'norwegian', 'porter', 'portuguese', 'romanian', 'russian', 'spanish', 'slovene', 'swedish', 'tamil', 'turkish'];
    }
});

