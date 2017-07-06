"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

let mkdirs = (() => {
	var _ref = _asyncToGenerator(function* (dirname) {
		let exists = yield exists(dirname);
		if (exists) {
			return true;
		}
		let p = _path2.default.dirname(dirname);
		if (p == dirname) {
			return false;
		}
		if (!(yield mkdirs(p))) {
			return false;
		}
		return yield new Promise(function (resolve) {
			return _fs2.default.mkdir(dirname, function (e) {
				return resolve(Boolean(e));
			});
		});
	});

	return function mkdirs(_x) {
		return _ref.apply(this, arguments);
	};
})();

let setFuncDir = (() => {
	var _ref2 = _asyncToGenerator(function* (dir) {
		if (this.loading) return false;
		this.loading = true;
		if (this.funcDir == dir) return true;
		let files = yield readdir(this.funcDir = dir);
		this.func = Promise.all(files.map(function (f) {
			return loadModule(_path2.default.join(dir, f));
		}));
		this.loading = false;
		return true;
	});

	return function setFuncDir(_x2) {
		return _ref2.apply(this, arguments);
	};
})();

let create = (() => {
	var _ref3 = _asyncToGenerator(function* () {
		let f = (0, _functmpl2.default)();
		f.use(this.func);
		f.use(_functmpl2.default.func);
		return f;
	});

	return function create() {
		return _ref3.apply(this, arguments);
	};
})();

/**
 * 更新页面
 * @param {Object} {data} 页面数据
 * @param {String} {view} 视图
 * @param {String} {theme} 主题
 * @param {String} {page} 页面位置
 * @param {String} {viewName} 视图名称
 */


let update = (() => {
	var _ref4 = _asyncToGenerator(function* ({ data, view, theme = this.theme, page, viewName }) {
		let viewDir = _path2.default.join(this.viewDir, String(theme), String(viewName) + ".ftl");
		page = page && typeof page == "string" ? _path2.default.join(this.pageDir, page) : "";
		let template = this.create();
		if (view) {
			yield template.setTemplate(view);
			template.filename = viewDir;
		} else {
			yield template.loadFile(viewDir);
		}
		data = yield f.parse(this.global, data, this.vari, base, { site: Object.create(config.site), view: { path: _path2.default.join(this.viewPath, theme) } });
		//
		if (page) {
			let pagePath = _path2.default.dirname(page);
			if ((yield mkdirs(pagePath)) || (yield exists(pagePath))) {
				yield new Promise(function (resolve, reject) {
					return _fs2.default.writeFile(page, data, function (err) {
						return err ? reject(err) : resolve();
					});
				});
			}
		}
		return data;
	});

	return function update(_x3) {
		return _ref4.apply(this, arguments);
	};
})();

var _functmpl = require("functmpl");

var _functmpl2 = _interopRequireDefault(_functmpl);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/** @type {Object} 基本变量 */
let base = { Math, Date, String, Boolean, Number, RegExp, Array, Object };
for (let k in base) {
	base[k] = Object.freeze(Object.create(base[k]));
}

let readdir = dir => new Promise((resolve, reject) => _fs2.default.readdir(dir, (err, files) => err ? reject(err) : resolve(files)));
let readFile = p => new Promise((resolve, reject) => _fs2.default.readFile(p, "utf8", (err, data) => err ? reject(err) : resolve(data)));
let exists = dirname => new Promise(resolve => _fs2.default.exists(dirname, resolve));

function loadModule(path) {
	let x = require(path);
	return x;
}

exports.default = (() => {
	var _ref5 = _asyncToGenerator(function* ({ dir, theme = 'default', viewDir = './view/', viewPath = '/view/', pageDir = './page' }) {
		let ret = {};
		let cfg = Object.create(ret);

		cfg.funcDir;
		cfg.loading = false;
		cfg.func = [];

		ret.vari = {};
		ret.global = {};

		ret.theme = theme;
		ret.viewPath = viewPath;
		ret.viewDir = viewDir;
		ret.pageDir = pageDir;

		ret.setFuncDir = setFuncDir.bind(cfg);
		ret.create = create.bind(cfg);
		ret.update = update.bind(cfg);
		yield ret.setFuncDir(dir);
		return ret;
	});

	function pageTmpl(_x4) {
		return _ref5.apply(this, arguments);
	}

	return pageTmpl;
})();