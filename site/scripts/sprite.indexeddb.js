(function(window, undefined) {
var idb = sprite.indexeddb = { };

idb.initted = false;
idb.init = function() {
	window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
	window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

	var initReq = indexedDB.open('SpriteDB');
	initReq.onerror = function(ev) {
		alert('error initting db');
	};
	initReq.onsuccess = function(ev) {
		idb.db = initReq.result;
		idb.initted = true;
	};
	initReq.onupgradeneeded = function(ev) {
		var db = ev.target.result;
		var store = db.createObjectStore('sprites', { keyPath: 'id', autoIncrement: true });
		store.createIndex('name', 'name', { unique: false });
	};
};

var getStore = function() {
	if (!idb.initted) {
		console.error("Can't retrieve sprites before db initialized");
		return;
	}

	var trans = idb.db.transaction(["sprites"], "readwrite");
	return trans.objectStore("sprites");
};

idb.getSprites = function (success) {
	var store = getStore();
	var data = [];
	store.openCursor().onsuccess = function (ev) {
		var cursor = ev.target.result;
		if (cursor) {
			data.push(cursor.value);
			cursor.continue();
		} 
		else {
			success(data);
		}
	};
};

idb.getSprite = function (id, success, error) {
	var store = getStore();
	var req = store.get(id);
	req.onsuccess = function(resp) {
		if (success) {
			success.call(undefined, resp.target.result);
		}
	};
	req.onerror = error || $.noop;
};

idb.saveSprite = function (sp, success, error) {
	var store = getStore();
	var req = store.put(sp);
	req.onsuccess = function(resp) {
		if (success) {
			success.call(undefined, resp.target.result);
		}
	};
	req.onerror = error || $.noop;
};

idb.deleteSprite = function(id, success, error) {
	var store = getStore();
	var req = store.delete(id);
	req.onsuccess = success || $.noop;
	req.onerror = error || $.noop;
};
})(window);