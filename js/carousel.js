/**
 * Created with Sublime.
 * Desc:
 * Author: wangxinyu
 * Date: 15-10-27
 * Time: 19:40 pm.
 */
/**
 * usage:
 * var carousel = new Carousel(obj);
 * 
 * obj should like this:
 * obj = {
 *     width: "1180px",
 *	   height: "98px",
 *	   url: "carousel.json",
 *	   duration: 3000
 * }
 */
(function(window) {
	 function Carousel(options) {
		var option = options;

		this.get = function(property) {
			return option[property];
		};

		this.set = function(property, value) {
			option[property] = value;
		};

		this.init();
	};

	Carousel.prototype = {
		/**
		 * create carousel-list modle and carousel-pager modle and put them in the '#carousel-wrapper'.
		 * reqest json file to load images.
		 */
		init: function() {
			var _this = this;
			_this.createFrame();
			_this.load(_this.get("url"));
		},

		createFrame: function() {
			var _this = this;
			var UL_FRAME = document.createElement("ul"),
			    OL_FRAME = document.createElement("ol");
			var _self = document.getElementById("carousel-wrapper");

			_this.addClass(UL_FRAME, "carousel-list");
			_this.addClass(OL_FRAME, "carousel-pager");

			_this.set("pageUl", UL_FRAME);
			_this.set("pageOl", OL_FRAME);

			_self.appendChild(UL_FRAME);
			_self.appendChild(OL_FRAME);

			_self.style.width = _this.get("width");
			_self.style.height = _this.get("height");
		},

		load: function(url) {
			var _this = this;
			var xhr = null;

			if (typeof XMLHttpRequest == "undefined") {
				try {
					xhr = new ActiveXObject("Msxml2.XMLHTTP.6.0");
				} catch (e) {}
				try {
					xhr = new ActiveXObject("Msxml2.XMLHTTP.3.0");
				} catch (e) {}
				try {
					xhr = new ActiveXObject("Msxml2.XMLHTTP");
				} catch (e) {}
			} else {
				xhr = new XMLHttpRequest();
			}

			xhr.onreadystatechange = function() {
				if(xhr){
					if (xhr.readyState == 4 && xhr.status == 200) {
						var content = JSON.parse(xhr.responseText);
						_this.ready(content);
					}
				} else {
					alert("DO NOT SUPPORT!");
				}
			};

			xhr.open("GET", url, true);
			xhr.send();
		},

		/**
		 * put image datas in the carousel-list model. 
		 * createTogglePager in the carousel-pager model.
		 */
		ready: function(data) {
			var _this = this;
			var len = data.length;

			_this.set("num", len);	

			_this.appendImg(data, len);
			_this.createTogglePager(data, len);
		},

		appendImg: function(data, len) {
			var _this = this;
			var pageUl = _this.get("pageUl");
			var list = document.createDocumentFragment();

			for (var i = 0; i < len; i++) {
				var listLi = document.createElement("li");

				var listA = document.createElement("a");
		    	listA.href = data[i].href;
				
				var listImg = document.createElement("img");
				listImg.src = data[i].url;
				listImg.alt = data[i].alt;
				
				listA.appendChild(listImg);
				listLi.appendChild(listA);
				list.appendChild(listLi);
			}

		    
		    pageUl.appendChild(list);
		},
		
		createTogglePager: function(data, len) {
			var _this = this;
			var pageOl = _this.get("pageOl");
			var pager = document.createDocumentFragment();

		    for (var i = 0; i < len; i++) {
		    	var pageLi = document.createElement("li");

	            if (i === 0) {
	            	_this.addClass(pageLi, "page-number");
	            	_this.addClass(pageLi, "page-active");
	            } else {
	            	_this.addClass(pageLi, "page-number");
	            }
				
				pageLi.innerHTML = i + 1;

				pager.appendChild(pageLi);
		    }
		    
		    pageOl.appendChild(pager);

	        _this.bindClickEvent(pageOl, len);
	        _this.moveTo(pageOl, 0);
		},

		bindClickEvent: function(pageOl, len) {
			var _this = this;

	        pageOl.onclick = function (evt) {
	        	var evt = window.event || evt;
	        	var target = evt.target || evt.srcElement;

	        	if (target.nodeName.toLowerCase() === "li") {

	        		for (var i = 0; i < len; i++) {
	        			var tmp = pageOl.querySelectorAll("li")[i];
	        			
	        			if (tmp === target) {
	        				if (!_this.hasClass(tmp, "page-active")) {
	        					_this.clearActive(pageOl, len);
	        					_this.addClass(tmp, "page-active");
	        					_this.moveTo(pageOl, i);
	        				}
	        			}
	        		}
	        	}
	        };
		},

		/**
		 * move to the 'idx'-th image, and change the active-pager.
		 */
		moveTo: function(pageOl, idx) {
			var _this = this;
			var i = idx;
			var pageUl = _this.get("pageUl"),
			    len = _this.get("num");
			var pageOlList = pageOl.querySelectorAll("li");

			var t = i * (-98);

			if (pageOl.timer) {
				clearInterval(pageOl.timer);
			}

			// pageUl.style.top = t + "px";
			_this.transition(pageUl, t);

			pageOl.timer = setInterval(function() {
				var t = i * (-98);
				
				// pageUl.style.top = t + "px";
				_this.transition(pageUl, t);

				_this.clearActive(pageOl, len);
				_this.addClass(pageOlList[i], "page-active");
				i++;

				if (i === len) {
					i = 0;
				}
			}, _this.get("duration"));
		},

		transition: function(elem, final_y) {
			var _this = this;
			var ypos = parseInt(_this.getStyle(elem, "top"));
			var dist = 0;

			// when page is not activated, cancel animation
			if (document.hidden || document.msHidden || document.webkitHidden) {
				cancelAnimationFrame(elem.movement);
			}

			// make sure there is value of top
			if (!elem.style.top) {
				elem.style.top = "0px";
			}

			// simulation 'transition' effect, like 'ease-in-out'
			if (ypos === final_y) {
				cancelAnimationFrame(elem.movement);
				return true;
			}
			if (ypos < final_y) {
				dist = Math.ceil((final_y - ypos)/10);
				ypos = ypos + dist;
			}
			if (ypos > final_y) {
				dist = Math.ceil((ypos - final_y)/10);
				ypos = ypos - dist;
			}

			elem.style.top = ypos + "px";
			
			elem.movement = requestAnimationFrame(function() {
				_this.transition(elem, final_y);
			});
		},

        clearActive: function(pageOl, len) {
			var _this = this;
			var pageOlList = pageOl.querySelectorAll("li");

			for (var j = 0; j < len; j++) {
	            if (_this.hasClass(pageOlList[j], "page-active")) {
	            	_this.removeClass(pageOlList[j], "page-active");
	            }
			}
		},

		addClass: function(elem, newClass) {
			if (elem.classList) {
	            elem.classList.add(newClass);
			} else {
		        if (!elem.className) {
					elem.className = newClass;
				} else {
					newClassName = elem.className + " " + newClass;
					elem.className = newClassName;
				}
			}
		},

		removeClass: function(elem, oldClass) {
			if (elem.classList) {
	            elem.classList.remove(oldClass);
			} else {
				elem.className = elem.className.replace(new RegExp('(^|\\b)' + oldClass.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
			}
		},

		hasClass: function(elem, className) {
			if (elem.classList) {
				return elem.classList.contains(className);
			} else {
				return (" " + elem.className + " ").indexOf(" " + className + " ") > -1;
			}
		},

		getStyle: function(elem, style) {
			return elem.currentStyle? elem.currentStyle[style] : window.getComputedStyle(elem, false)[style];
		}
	};

	window.Carousel = window.Carousel || Carousel;
})(window);