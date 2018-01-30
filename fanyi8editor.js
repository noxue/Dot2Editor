!(function ($) {

	//加载必须的js
	loadScript();

	window.FanYi8Editor = function (selector, opts) {

		//下面是绑定到对象中的方法
		this.addCommand = addCommand;

		//添加一个菜单
		this.addMenu = addMenu;

		//保存配置信息
		var config = opts || {};

		//ace编辑器实例
		var editor = null;

		//是否全屏预览
		var isFullPrev = false;

		//是否开启编辑，当预览效果的时候隐藏编辑区域。
		var isFullEdit = false;


		//编辑器id
		var editor_id = "fanyi8editor-" + uuid();
		//给编辑器设置唯一id，用于后面获取编辑器中的其他元素
		$(selector + " .fanyi8editor").attr("id", editor_id);

		//因为ace编辑器要求指定id来创建，考虑到同一个网页可能多个编辑器，所以就用唯一标识符来表示当前的编辑器
		var ace_editor_id = "ace_editor-" + uuid();
		//给ace编辑器设置唯一的id属性
		$(selector + " .editor-content").attr("id", ace_editor_id);

		//编辑器节点（原生js获取的dom节点）
		var editorNode = window.document.getElementById(ace_editor_id);

		//初始化编辑器
		initEditor();

		/**
		 * 初始化操作
		 */
		function initEditor() {
			//创建ace编辑器实例
			editor = ace.edit(ace_editor_id);
			editor.setTheme('ace/theme/xcode');
			editor.getSession().setMode('ace/mode/markdown');
			editor.renderer.setShowPrintMargin(false);
			editor.setHighlightGutterLine(false);
			editor.setFontSize(16);
			editor.setOptions({
				wrap: "free", //自动换行
			});

			//阻止控制台的警告信息
			editor.$blockScrolling = Infinity;

			//让选中的行不高亮
			editor.setHighlightActiveLine(false);

			//一开始让编辑器获取焦点
			editor.focus();

			editor.on("change", function (e) {
				$(selector + " .preview").html(marked(editor.getValue()));
			});

			//绑定滚动鼠标和Alt + - 改变文字大小
			bindChangeFontSize();

			//如果配置了上传文件，就绑定拖拽和粘贴上传文件
			if (config.upload) {
				bindDrag();
				bindPaste();
			}

			//绑定默认的命令，比如Alt+s保存
			bindCommands();

			//添加默认的菜单
			addMenus();
		}

		//绑定快捷命令
		function addCommand(command) {
			editor.commands.addCommand(command);
		}

		//添加菜单
		function addMenu(menu){

		}

		/**
		 * 添加所有的默认菜单
		 */
		function addMenus(){
			addMenu();
		}

		function bindCommands() {
			addCommand({
				name: 'parse',
				bindKey: {
					win: 'Ctrl-S',
					mac: 'Command-S'
				},
				exec: function (editor) {
					console.log(editor.getValue());
				},
				readOnly: false // 如果不需要使用只读模式，这里设置false
			});

			//加粗
			addCommand({
				name: 'bold',
				bindKey: {
					win: 'Alt-B',
					mac: 'Alt-B'
				},
				exec: function (editor) {
					var v = editor.getSelectedText();
					if (v == "") {
						var p = editor.getCursorPosition();
						editor.insert("****");
						p.column += 2;
						editor.moveCursorToPosition(p);
					} else {
						editor.insert("**" + v + "**");
					}
				},
				readOnly: true // 如果不需要使用只读模式，这里设置false
			});

			//调用函数开始绑定h1-h6
			h(1);
			//绑定h1-h6的快捷键
			function h(i) {
				addCommand({
					name: 'H' + i,
					bindKey: {
						win: 'Alt-' + i,
						mac: 'Alt-' + i
					},
					exec: function (editor) {
						//移到行首
						editor.navigateLineStart();
						editor.insert(repeat("#", i) + " ");
						//移到行尾
						editor.navigateLineEnd();
					},
					readOnly: true // 如果不需要使用只读模式，这里设置false
				});
				//如果定不等于6，就调用自身。这里用循环变量有问题，所以采用递归的方式
				if (i < 7)
					h(i + 1);
			}


			//a标签
			addCommand({
				name: 'a',
				bindKey: {
					win: 'Alt-A',
					mac: 'Alt-A'
				},
				exec: function (editor) {
					var p = editor.getCursorPosition();
					var v = editor.getSelectedText();
					if (v == "") {
						editor.insert("[]()");
						p.column += 1;
						editor.moveCursorToPosition(p);
					} else {
						//删除原有内容，然后添加组合的内容
						editor.remove();
						//获取最新的位置
						p = editor.getCursorPosition();
						//计算输入链接的坐标位置
						p.column += (3 + v.length);
						editor.insert("[" + v + "]()");
						//让光标移动到填写链接的地方
						editor.moveCursorToPosition(p);
					}
				},
				readOnly: true // 如果不需要使用只读模式，这里设置false
			});

			//img
			addCommand({
				name: 'img',
				bindKey: {
					win: 'Alt-I',
					mac: 'Alt-I'
				},
				exec: function (editor) {
					var p = editor.getCursorPosition();
					editor.insert("![]()");
					p.column += 4;
					editor.moveCursorToPosition(p);
				},
				readOnly: true // 如果不需要使用只读模式，这里设置false
			});


			//hr
			addCommand({
				name: 'hr',
				bindKey: {
					win: 'Alt-H',
					mac: 'Alt-H'
				},
				exec: function (editor) {
					var p = editor.getCursorPosition();
					editor.insert("***");
					p.column += 3;
					editor.moveCursorToPosition(p);
				},
				readOnly: true // 如果不需要使用只读模式，这里设置false
			});

			//line
			addCommand({
				name: 'line',
				bindKey: {
					win: 'Alt-L',
					mac: 'Alt-L'
				},
				exec: function (editor) {
					var p = editor.getCursorPosition();
					editor.insert("---");
					p.column += 3;
					editor.moveCursorToPosition(p);
				},
				readOnly: true // 如果不需要使用只读模式，这里设置false
			});

			addCommand({
				name: 'edit',
				bindKey: {
					win: 'Alt-E',
					mac: 'Alt-E'
				},
				exec: function (editor) {
					if(!isFullEdit){ //如果不是，就全屏编辑
						$("#"+editor_id + " .editor-column").css("width","100%");
						$("#"+editor_id + " .preview-column").hide();
						isFullEdit = true;
					} else {
						$("#"+editor_id + " .editor-column").css("width","50%");
						$("#"+editor_id + " .preview-column").show(500);
						isFullEdit = false;
					}
					editor.resize();
				},
				readOnly: false // 如果不需要使用只读模式，这里设置false
			});

			addCommand({
				name: 'preview',
				bindKey: {
					win: 'Alt-P',
					mac: 'Alt-P'
				},
				exec: function (editor) {
					if(!isFullPrev){ //如果不是，就全屏预览
						$("#"+editor_id + " .preview-column").css("width","100%");
						$("#"+editor_id + " .editor-column").hide();

						(function(){
							$("#"+editor_id + " .preview-column>.close-preview").css("display","block").click(function(){
								$(this).css("display","none");
								$("#"+editor_id + " .preview-column").css("width","50%");
								$("#"+editor_id + " .editor-column").show(200);
								isFullPrev = false;
								editor.focus();
							});
						})();
						isFullPrev = true;
					}
					editor.resize();
				},
				readOnly: false // 如果不需要使用只读模式，这里设置false
			});

			//table
			addCommand({
				name: 'table',
				bindKey: {
					win: 'Alt-T',
					mac: 'Alt-T'
				},
				exec: function (editor) {
					var str = window.prompt("请输入行和列，用空格隔开，例如：3 5  就表示生成一个3行5列的表格");
					if (!str) {
						return;
					}

					var arr = str.split(/\s+/);
					if (arr.length < 2) {
						alert("请输入正确的行和列数据");
						return;
					}
					var row = arr[0];
					var column = arr[1];

					editor.insert("|" + repeat("|", column - 2) + "\n" +
						"-|-" + repeat("|-", column - 2) + "\n" +
						"|" + repeat("|", column - 2) + "\n"
						+ repeat("|" + repeat("|", column - 2) + "\n", row - 2));
				},
				readOnly: true // 如果不需要使用只读模式，这里设置false
			});

		}

		/**
		 * 绑定粘贴图片上传事件
		 */
		function bindPaste() {
			//ace编辑器绑定粘贴事件，实现粘贴上传图片
			window.document.getElementById(ace_editor_id).addEventListener("paste", function (e) {
				var cbd = e.clipboardData;
				var ua = window.navigator.userAgent;

				// 如果是 Safari 直接 return
				if (!(e.clipboardData && e.clipboardData.items)) {
					return;
				}

				// Mac平台下Chrome49版本以下 复制Finder中的文件的Bug Hack掉
				if (cbd.items && cbd.items.length === 2 && cbd.items[0].kind === "string" && cbd.items[1].kind === "file" &&
					cbd.types && cbd.types.length === 2 && cbd.types[0] === "text/plain" && cbd.types[1] === "Files" &&
					ua.match(/Macintosh/i) && Number(ua.match(/Chrome\/(\d{2})/i)[1]) < 49) {
					return;
				}

				//如果在上传图片，不处理。
				if (uploadStatus) {
					return;
				}

				for (var i = 0; i < cbd.items.length; i++) {
					var item = cbd.items[i];
					if (item.kind == "file") {
						var blob = item.getAsFile();
						if (blob.size === 0) {
							return;
						}
						// blob 就是从剪切板获得的文件 可以进行上传或其他操作
						editor.setReadOnly(true);
						uploadImg(blob);
					}
				}
			}, false);
		}

		//记录图片上传状态，限制同时只能上传一个图片
		var uploadStatus = false;

		/**
		 * ajax方式上传图片
		 * @param file 文件的内容
		 */
		function uploadImg(file) {
			uploadStatus = true;
			var animateHtml = '<div class="fanyi8editor_upload_image_loader"></div>';
			$("body").append($(animateHtml));

			var formData = new FormData();
			formData.append(config.upload.name, file);

			if (config.upload.kvs) {

				var kvs = config.upload.kvs;

				//如果是一个函数，就调用并获取返回值，配置一个函数的区别是，每次都会调用
				if (typeof kvs === "function") {
					kvs = kvs();

					//如果函数返回false，那就不需要上传
					if (kvs == false) {
						return;
					}
				}

				//如果配置是合法的json对象
				if (isJSON(kvs)) {
					for (var k in kvs) {
						formData.append(k, kvs[k]);
					}
				} else {  //不合法,不上传
					alert("上传文件配置中的内容必须是json对象");
					return;
				}
			}

			//上传文件
			$.ajax({
				url: config.upload.url,
				type: 'POST',
				data: formData,
				// 告诉jQuery不要去处理发送的数据
				processData: false,
				// 告诉jQuery不要去设置Content-Type请求头
				contentType: false,
				beforeSend: function () {
					if (window.console)
						console.log("正在进行，请稍候");
				},
				success: function (res) {
					if (res.code == 0) {
						if (res.isImage) {
							editor.insert("![" + res.alt + "](" + res.src + ")");
						} else {
							editor.insert("[" + res.alt + "](" + res.src + ")");
						}
					} else {
						alert(res);
					}
					editor.setReadOnly(false);
					uploadStatus = false;
					$(".fanyi8editor_upload_image_loader").remove();
				},
				error: function (responseStr) {
					console.log("error");
					editor.setReadOnly(false);
					uploadStatus = false;
					$(".fanyi8editor_upload_image_loader").remove();
				}
			});
		}


		/**
		 * 改变文字大小
		 */
		function bindChangeFontSize() {
			window.document.addEventListener('DOMContentLoaded', function (event) {
				// chrome 浏览器直接加上下面这个样式就行了，但是ff不识别
				window.document.body.style.zoom = 'reset';
				window.document.addEventListener('keydown', function (event) {
					if ((event.AltKey === true || event.metaKey === true)) {
						var i = 0;
						var stop = false; //是否阻止事件
						if (event.which === 107 || event.which === 189) { //+
							i++;
							stop = true;
						} else if (event.which === 109 || event.which === 187) { //-
							i--;
							stop = true;
						}

						editor.setFontSize(editor.getFontSize() + i);

						//不是改变字体，就不阻止事件，否则复制粘贴之类的快捷键无法使用
						if (stop) event.preventDefault();
					}
				}, false);

				var EventUtil = {
					addHandler: function (element, type, handler) {
						if (element.addEventListener) {
							element.addEventListener(type, handler, false);
						} else if (element.attachEvent) {
							element.attachEvent('on' + type, handler);
						} else {
							element['on' + type] = handler;
						}
					},
					getEvent: function (event) {
						return event ? event : window.event;
					},
					stopPropagation: function (event) {
						event = event || window.event;
						if (event.stopPropagation) {
							event.stopPropagation();
						} else {
							event.cancelBubble = true;
						}
					}
				};

				function handleMouseWheel(event) {
					if (!(event.AltKey === true || event.metaKey === true)) return;

					EventUtil.stopPropagation(event);
					event = EventUtil.getEvent(event);
					var value = event.wheelDelta || -event.detail;
					var delta = Math.max(-1, Math.min(1, value));
					var i = 0;

					if (delta > 0) { //+
						i++;
					} else { //-
						i--;
					}
					editor.setFontSize(editor.getFontSize() + i);

					event.preventDefault();
				}

				EventUtil.addHandler(window.document, 'mousewheel', handleMouseWheel);
				EventUtil.addHandler(window.document, 'DOMMouseScroll', handleMouseWheel);

			}, false);
		}


		/**
		 * 拖拽上传
		 */
		function bindDrag() {
			var obj = document.getElementById(editor_id);
			obj.addEventListener("dragenter", handler, false);
			obj.addEventListener("dragover", handler, false);
			obj.addEventListener("drop", upload, false);
			function upload(e) {
				var e = e || window.event;
				handler(e);
				var files = e.dataTransfer.files;

				for (var i = 0, il = files.length; i < il; i++) {
					//如果是文件夹，就不处理
					if (files[i].size == 0) continue;
					uploadImg(files[i]);
				}
			}

			function handler(e) {
				var e = e || window.event;
				e.preventDefault ? e.preventDefault() : e.returnValue = false;
				e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
			}
		}

	};


	/**
	 * 加载编辑器依赖的 ace 和 markd
	 */
	function loadScript() {
		var tmp_node = 'script_fanyi8_' + uuid();
		window.document.write('<script id="' + tmp_node + '"></script>')
		var thisNode = $("#" + tmp_node).prev("script");
		$('#' + tmp_node).remove();

		$(thisNode).before($('<script src="./js/marked.min.js"></script>'));
		$(thisNode).before($('<script src="./js/ace/ace.js"></script>'));
	}


	//下面放一些工具函数


	function uuid() {
		var s = [];
		var hexDigits = "0123456789abcdef";
		for (var i = 0; i < 36; i++) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		}
		s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
		s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
		s[8] = s[13] = s[18] = s[23] = "-";

		var uuid = s.join("");
		return uuid;
	}

	//判断是否是json对象
	function isJSON(obj) {
		var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
		return isjson;
	}

	function repeat(target, n) {
		return (new Array(n + 1)).join(target);
	}
})($);
