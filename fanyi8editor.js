!(function (obj, $) {

  /**
   * 初始化操作
   */
  function init($editor) {
    $editor.setTheme('ace/theme/chrome');
    $editor.getSession().setMode('ace/mode/markdown');
    $editor.renderer.setShowPrintMargin(false);
    $editor.setFontSize(16);
    $editor.setOption("wrap", "free");

    $editor.setHighlightActiveLine(true);
    $editor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: false,
      enableLiveAutocompletion: true
    });

    $editor.commands.addCommand({
      name: 'myCommand',
      bindKey: {
        win: 'Ctrl-M',
        mac: 'Command-M'
      },
      exec: function (editor) {
        console.log(editor.getValue());
      },
      readOnly: false // 如果不需要使用只读模式，这里设置false
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


  var ace_editor = null;

  //加载必须的js
  loadScript();

  obj.FanYi8Editor = {
    /**
     * {
     *  selector:"fanyi8editor" //必须是id
     * }
     */
    Create: function (opts) {
      
      opts = opts || {};
      ace_editor = ace.edit(opts.selector);
      init(ace_editor);
      ChangeFontSize(ace_editor);


      $("#mdeditor").keyup(function () {
        $("#preview").html(marked(ace_editor.getValue()));
        console.log(ace_editor.getValue());
      });

      $("#theme").change(function () {
        ace_editor.setTheme("ace/theme/" + $(this).children('option:selected').val());
      });

    },
  };

})(window, $);