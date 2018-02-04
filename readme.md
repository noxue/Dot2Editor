## 简介

找了挺多markdown编辑器，发现太臃肿了，添加功能不是太方便(主要是看不懂那么高大上的代码)，没发现一个支持粘贴上传图片和拖拽的。索性自己搞一个，由于作者只是一个后端程序员，js功底有限，所以只是实现了基本的功能，保证基本够用。此外就是js代码足够简单，基本后端程序员都可以看懂。


![](http://www.noxue.com/template/wekei_sim_1703_color/images/logo.png)


## 目前功能

* 剪贴板粘贴上传图片
* 拖拽上传文件
* 语法高亮

## 使用文档

`Alt+1~6` 对应 h1~h6 

`Alt+B` 加粗选中的内容

`Alt+I` 插入图片（I表示`img`标签）

`Alt+A` 插入链接（A表示`a`标签）

`Alt+H` 插入横线（H表示`hr`标签）

`Alt+L` 插入线条（L表示`Line`,和`hr`的区别是，线条上方的文字会变成h2）

`Alt+T` 插入表格（T 表示`Table`）

# 开发者

## 创建编辑器

```
<div style="width:100%; height:100%;" id="editor">
    <textarea name="content" cols="30" rows="10"></textarea>
</div>

<script src="https://cdn.staticfile.org/jquery/3.2.1/jquery.min.js"></script>
<script src="http://127.0.0.10/fanyi8editor.js"></script>
<script>
	var editor = new FanYi8Editor("#editor", {
	    //如果不配置upload，则不能上传图片
		upload: {
			//上传地址
			url: "/upload.php",

			//自定义的文件提交的名称，后端根据这个获取文件
			name: "image",

			//自定义的键值对json，或者一个函数返回这样的json，通过post一起提交
			//配置函数的区别是，每次提交都会调用函数，如果参数值是每次都会变化的，就用函数，比如七牛上传的时候要获取token）
            //kvs: {
            //  k1: "v1",
            //  k2: "v2"
            //}
		}
	});

</script>
```

* 必须在引入 fanyi8editor.js 之前引入jquery
* textarea不是必须，如果你需要使用普通的post提交的话，就可以加上textarea，markdown内容会自动更新到textarea里面。textarea的初始值也会自动设置到编辑器。


## 编辑器公开函数

### getMarkdown()
获取编辑器种的markdown内容

### setMarkdown(markdownContent)
把内容设置到编辑器

### getHtml()
获取编辑器解析后的html代码

### markdown转html显示处理

请参考view.html的源代码

# 其他

若有任何疑问，请到不学网提问 <http://www.noxue.com/f-wenda-1.html>

作者：刘荣飞
QQ:30670835
