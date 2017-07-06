import functmpl from "functmpl";
import fs from "fs";
import path from "path";

/** @type {Object} 基本变量 */
let base = {Math, Date, String, Boolean, Number, RegExp, Array, Object};
for(let k in base) {
	base[k] = Object.freeze(Object.create(base[k]));
}

let readdir = dir => new Promise((resolve,reject) => fs.readdir(dir, (err, files) => err ? reject(err) : resolve(files)));
let readFile = p => new Promise((resolve,reject) => fs.readFile(p, "utf8", (err, data) => err ? reject(err) : resolve(data)));
let exists = dirname => new Promise(resolve => fs.exists(dirname, resolve));

function loadModule(path) {
	let x = require(path);
	return x;
}

async function mkdirs (dirname) {
	let exist  = await exists(dirname);
	if (exist) {return true;}
	let p = path.dirname(dirname);
	if (p === dirname) {return false;}
	if (!await mkdirs(p)) {return false;}
	return await new Promise(resolve => fs.mkdir(dirname, e => resolve(Boolean(e))));
}



async function setFuncDir(dir) {
	if (this.loading) {return false;}
	this.loading = true;
	if (this.funcDir === dir) {return true;}
	let files = await readdir(this.funcDir = dir);
	this.func = Promise.all(files.map(f => loadModule(path.join(dir, f))));
	this.loading = false;
	return true;
}
async function create() {
	let f = functmpl();
	f.use(this.func);
	f.use(functmpl.func);
	return f;
}



/**
 * 更新页面
 * @param {Object} {data} 页面数据
 * @param {String} {view} 视图
 * @param {String} {theme} 主题
 * @param {String} {page} 页面位置
 * @param {String} {viewName} 视图名称
 */
async function update({data, view, theme = this.theme, page, viewName}) {
	let viewDir = path.join(this.viewDir, String(theme), String(viewName) + ".ftl");
	page = (page && typeof page === "string") ? path.join(this.pageDir, page) : "";
	let template = this.create();
	if (view) {
		await template.setTemplate(view);
		template.filename = viewDir;
	} else {
		await template.loadFile(viewDir);
	}
	data = await template.parse(this.global, data, this.vari, base, {view:{path:path.join(this.viewPath, theme)}});
	//
	if (page) {
		let pagePath = path.dirname(page);
		 if (await mkdirs(pagePath) || await exists(pagePath)) {
		 	await new Promise((resolve, reject) => fs.writeFile(page, data, err => err ? reject(err) : resolve()));
		 }
	}
	return data;
}


export default async function pageTmpl({theme = 'default', funcDir = "./func", viewDir = './view/', viewPath = '/view/', pageDir = './page', }) {
	let ret = {}
	let cfg = Object.create(ret);

	cfg.funcDir = "";
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
	await ret.setFuncDir(funcDir);
	return ret;
}
