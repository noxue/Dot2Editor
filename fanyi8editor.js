!(function (obj, $) {

	/**
	 * 初始化操作
	 */
	function init($editor) {
		$editor.setTheme('ace/theme/xcode');
		$editor.getSession().setMode('ace/mode/markdown');
		$editor.renderer.setShowPrintMargin(false);
		$editor.setHighlightGutterLine(false);
		$editor.setFontSize(16);
		// ace.require("ace/ext/language_tools");
		$editor.setOptions({
			wrap: "free", //自动换行
			// enableBasicAutocompletion: true,
			enableSnippets: true,
			// enableLiveAutocompletion: true
		});

		addCommands($editor);
		$editor.setHighlightActiveLine(false);
		$editor.focus();
	}


	//绑定快捷命令
	function addCommands($editor) {
		$editor.commands.addCommand({
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
	}


	function paste(editor, obj) {


		window.document.getElementById(obj).addEventListener("paste", function (e) {
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
					editor.editor.setReadOnly(true);

					uploadImg(editor, blob);
				}
			}
		}, false);
	}



	//记录图片上传状态，限制同时只能上传一个图片
	var uploadStatus = false;

	function uploadImg(editor, file) {
		uploadStatus = true;
		var animateHtml = '<div class="fanyi8editor_upload_image_loader"></div>';
		$("body").append($(animateHtml));

		var formData = new FormData();
		formData.append("file", file);
		$.ajax({
			url: "/upload.php",
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
					if(res.isImage) {
						editor.editor.insert("![" + res.alt + "](" + res.src + ")");
					}else{
						editor.editor.insert("[" + res.alt + "](" + res.src + ")");
					}
				} else {
					alert(res);
				}
				editor.editor.setReadOnly(false);
				uploadStatus = false;
				$(".fanyi8editor_upload_image_loader").remove();
			},
			error: function (responseStr) {
				console.log("error");
				editor.editor.setReadOnly(false);
				uploadStatus = false;
				$(".fanyi8editor_upload_image_loader").remove();
			}
		});
	}


	/**
	 * 改变文字大小
	 */
	function ChangeFontSize($editor) {
		obj.document.addEventListener('DOMContentLoaded', function (event) {
			// chrome 浏览器直接加上下面这个样式就行了，但是ff不识别
			obj.document.body.style.zoom = 'reset';
			obj.document.addEventListener('keydown', function (event) {
				if ((event.ctrlKey === true || event.metaKey === true)) {
					var i = 0;
					var stop = false; //是否阻止事件
					if (event.which === 107 || event.which === 189) { //+
						i++;
						stop = true;
					} else if (event.which === 109 || event.which === 187) { //-
						i--;
						stop = true;
					}

					$editor.setFontSize($editor.getFontSize() + i);

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
				if (!(event.ctrlKey === true || event.metaKey === true)) return;

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
				$editor.setFontSize($editor.getFontSize() + i);

				event.preventDefault();
			}

			EventUtil.addHandler(obj.document, 'mousewheel', handleMouseWheel);
			EventUtil.addHandler(obj.document, 'DOMMouseScroll', handleMouseWheel);

		}, false);
	}


	/**
	 * 加载编辑器依赖的 ace 和 markd
	 */
	function loadScript() {
		var tmp_node = 'script_fanyi8_' + uuid();
		obj.document.write('<script id="' + tmp_node + '"></script>')
		var thisNode = $("#" + tmp_node).prev("script");
		$('#' + tmp_node).remove();

		$(thisNode).before($('<script src="./js/marked.min.js"></script>'));
		$(thisNode).before($('<script src="./js/ace/ace.js"></script>'));
	}


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


	obj.FanYi8Editor = {

		opts: {},
		editor: null,
		editorNode:null,
		Create: function (selector, opts) {

			//加载必须的js
			loadScript();
			var that = this;
			this.opts = opts || {};
			var id = "fanyi8editor-" + uuid();
			this.editorNode = window.document.getElementById(id);
			$(selector).attr("id", id);
			this.editor = ace.edit(id);
			init(that.editor);
			initDragToUpload(that);
			ChangeFontSize(that.editor);
			paste(that, id);

			that.editor.on("change", function (e) {
				$("#preview").html(marked(that.editor.getValue()));
			});

		}
	};



	/**
	 * 拖拽上传
	 */
	function initDragToUpload(editor) {
		var obj = document.getElementById("editor");
		obj.addEventListener("dragenter", handler, false);
		obj.addEventListener("dragover", handler, false);
		obj.addEventListener("drop", upload, false);
		function upload(e) {
			var e = e || window.event;
			handler(e);
			var files = e.dataTransfer.files;

			for (var i = 0, il = files.length; i < il; i++) {
				//如果是文件夹，就不处理
				if(files[i].size == 0) continue;
				uploadImg(editor, files[i]);
			}
		}

		function handler(e) {
			var e = e || window.event;
			e.preventDefault ? e.preventDefault() : e.returnValue = false;
			e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;


		}
	}

})(window, $);