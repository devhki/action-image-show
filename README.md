# Image show action

Simple lightbox written in es6 and used via JSPM

## Usage


**JSON (data-)**

```
[
	{
		"ref" : <string|ref>,
		"urls" : {
			"view" : <string|url>,
			"download" : <string|url>
		},
		"title" : <string>,
		"description" : <string>,
		"meta" : [
			<string> : <string>,
			...
		]
	}
]
```

**HTML**

Initing module

```
<div class="a-image-show" data-image-show="<json>"></div>
```

Links

```
<a href="#" data-image-show-ref="<string|ref>">This link will open a image-show<a>
```
