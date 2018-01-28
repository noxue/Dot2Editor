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

      for (var i = 0; i < cbd.items.length; i++) {
        var item = cbd.items[i];
        if (item.kind == "file") {
          var blob = item.getAsFile();
          if (blob.size === 0) {
            return;
          }
          // blob 就是从剪切板获得的文件 可以进行上传或其他操作

          console.log(cbd);
          editor.setReadOnly(true);
          var animateHtml = "<div class='wrapper'><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>";
          $("body").append($(animateHtml));
          uploadImgFromPaste(editor,blob,"image/png");
          $(".wrapper").remove();

        }
      }
    }, false);
  }


  function uploadImgFromPaste(editor,file, type) {

		var formData = new FormData();
		formData.append("file",file);
		$.ajax({
			url : "/upload.php",
			type : 'POST',
			data : formData,
      // 告诉jQuery不要去处理发送的数据
			processData : false,
      // 告诉jQuery不要去设置Content-Type请求头
			contentType : false,
			beforeSend:function(){
				console.log("正在进行，请稍候");
			},
			success : function(responseStr) {
			  console.log(responseStr);
				editor.insert("![]("+responseStr+")");
				editor.setReadOnly(false);
			},
			error : function(responseStr) {
				console.log("error");
			}
		});


		return; 
    var formData = new FormData();  
    formData.append('file', file);  
    formData.append('submission-type', type);   
    var xhr = new XMLHttpRequest();  
    xhr.open('POST', '/upload.php');  
    xhr.onload = function () {    
      if (xhr.readyState === 4) {      
        if (xhr.status === 200) {   
          console.log(xhr.responseText);
          return;     
          var data = JSON.parse(xhr.responseText),
            tarBox = document.getElementById('tar_box');        
          if (isChrome) {          
            var img = document.createElement('img');          
            img.className = 'my_img';          
            img.src = data.store_path;          
            document.body.appendChild(img);        
          } else {          
            var imgList = document.querySelectorAll('#tar_box img'),
                          len = imgList.length,
                          i;          
            for (i = 0; i < len; i++) {            
              if (imgList[i].className !== 'my_img') {              
                imgList[i].className = 'my_img';              
                imgList[i].src = data.store_path;            
              }          
            }        
          }       
        } else {        
          console.log(xhr.statusText);      
        }    
      };  
    };  
    xhr.onerror = function (e) {    
      console.log(xhr.statusText);  
    }  
    xhr.send(formData);
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

          console.log(event)

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
    var tmp_node = 'script_fanyi8_' + Math.ceil(Math.random() * 1000000 + 1000000);
    obj.document.write('<script id="' + tmp_node + '"></script>')
    var thisNode = $("#" + tmp_node).prev("script");
    $('#' + tmp_node).remove();

    console.log($(thisNode).attr("src"));

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























  window.ace_editor = null;

  //加载必须的js
  loadScript();

  obj.FanYi8Editor = {

    opts:{},
    Create: function (selector,opts) {

      this.opts = opts || {};

      var id = "fanyi8editor-" + uuid();

      $(selector).attr("id", id)

      ace_editor = ace.edit(id);

      init(ace_editor);
      ChangeFontSize(ace_editor);

      ace_editor.on("change", function (e) {
        $("#preview").html(marked(ace_editor.getValue()));
      });

      $("#theme").change(function () {
        ace_editor.setTheme("ace/theme/" + $(this).children('option:selected').val());
      });

      paste(ace_editor, id);

    },
  };

})(window, $);