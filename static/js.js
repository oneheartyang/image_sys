var isNotupload = true;
/*创建canvas画布*/
var stage = new createjs.Stage("demoCanvas"); //创建画布
var bg = new createjs.Bitmap(bg_data_0); //创建背景图


var bg_w = 937;			//大月亮宽
var bg_h = 937;			//大月亮高

//设置背景图位置
bg.regX = 0,     // 沿X轴负方向的偏移量
    bg.regY = 0, // 沿Y轴负方向的偏移量
    bg.x = 65,   // 绘制源点 X坐标
    bg.y = 50;   // 绘制源点 Y坐标
// bg.alpha = 0.5

var bg_center_x = bg.x + bg_w/2;			//大月亮中心位置
var bg_center_y = bg.y + bg_h/2;			//大月亮中心位置
bg.scaleX = 0.6;  //X轴放大(拉伸)
bg.scaleY = 0.6;  // Y周倾斜角度 DEG

bg_center_x *= bg.scaleX;
bg_center_y *= bg.scaleY;

//stage.addChild(bg); //放置背景图到canvas画布
stage.update();
createjs.Ticker.setFPS(5);
createjs.Ticker.addEventListener("tick", tick);

function tick(event) {
    stage.update(event);
}

/*上传图片*/
document.getElementById('inputimg').onchange = function () {
    console.log('onchange')
    var fileObj = document.getElementById('inputimg').files[0];
    if (document.getElementById('inputimg').files.length === 0) {
        return;
    }

    var oFile = document.getElementById('inputimg').files[0];

    //var oFile =json.url;
    if (!rFilter.test(oFile.type)) {
        alert("You must select a valid image file!");
        return;
    }
    oFReader.readAsDataURL(oFile);
};

/*上传图片的初始位置 放大倍数及旋转角度*/
var elePos = {
    x: 400,
    y: 300,
    s: 1,
    a: 0,
    w: 100,
    h: 100
}
var scale = 1,
    angle = 0,
    gestureArea = document.getElementById('gesture-area'); //手势区域
var stageplay = 1;

/*调整图片位置*/
interact(gestureArea).gesturable({
    onstart: function (event) {

    },
    onmove: function (event) {
        console.log("onmove")
        if (typeof imgthis == 'undefined') {
            return;
        }
        scale = scale * (1 + event.ds);
        angle += event.da;
        x = (parseFloat(elePos.x) || 0) + event.dx, y = (parseFloat(elePos.y) || 0) + event.dy;
        elePos.x = x;
        elePos.y = y;
        elePos.s = scale;
        elePos.a = angle;
        imgthis.scaleX = elePos.s, imgthis.scaleY = elePos.s, imgthis.rotation = elePos.a, imgthis.x = elePos.x, imgthis.y = elePos.y;

        stage.update();
    },
    onend: function (event) {
    }
}).draggable({
    onmove: dragMoveListener
});


function dragMoveListener(event) {
    return
    if (typeof imgthis == 'undefined') {
        return
    }
    x = (parseFloat(elePos.x) || 0) + event.dx, y = (parseFloat(elePos.y) || 0) + event.dy;
    s = (parseFloat(elePos.s) || 1), a = (parseFloat(elePos.a) || 0);
    imgthis.scaleX = elePos.s, imgthis.scaleY = elePos.s, imgthis.rotation = elePos.a, imgthis.x = elePos.x, imgthis.y = elePos.y;
    elePos.x = x;
    elePos.y = y;
    console.log('*************' + elePos.x)
    console.log('*************' + elePos.y)
    stage.update();
}

// 上传图片
var imgthis;
var oFReader = new FileReader(),
    rFilter = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;
oFReader.onload = function (oFREvent) {
	
	alertMsg("图片上传并合成中，请稍后...");
	
	
    stage.removeChild(imgthis);

    var data = {"imgDatadahe": oFREvent.target.result};
    var ajax = new XMLHttpRequest();
    ajax.open("POST", "/uploadImage", true);
    ajax.send(postDataFormat(data));
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4) {
            if (ajax.status >= 200 && ajax.status < 300 || ajax.status == 304) {
                var obj = JSON.parse(ajax.responseText);
                // console.log(obj.fileURL);
                // alertMsg("上传成功");

                imgthis = new createjs.Bitmap(obj.png_base64_data);
                var image = new Image();
                image.src = obj.png_base64_data;

                setTimeout(function () {

                    console.log('img width:' + image.width + '  img height:' + image.height)
                    var imgWidth = image.width;
                    var imgHeight = image.height;

                    var imgFaceWidth = imgWidth * elePos.w / 100;
                    var imgFaceHeight = imgHeight * elePos.h / 100;
                    // var sizescale = 448 / imgFaceWidth / 2;
                    var sizescale = 448 / imgFaceWidth;
                    scale = sizescale;
                    console.log('imgWidth:' + imgWidth + ';elePos.w:' + elePos.w + ';scale:' + sizescale);

                    /*图片初始位置*/
                    var moon_scale_x = sizescale;
                    var moon_scale_y = sizescale;

                    var moon_w = imgWidth * moon_scale_x;
                    var moon_h = imgHeight * moon_scale_y;

                    var fx = bg_center_x - moon_w/2;
                    var fy = bg_center_y - moon_h/2;

                    /*注：上传图片，放大缩小倍数需要除以2；设计稿中头像左上角，距内容区左上角距离，依然也需要除以2（横坐标除以2，纵坐标除以2）*/

                    console.log(fx, fy);
                    elePos.s = sizescale;
                    elePos.x = fx;
                    elePos.y = fy;

                    imgthis.scaleX = sizescale,
                        // imgthis.alpha = 0.4,
                        imgthis.scaleY = sizescale,
                        imgthis.rotation = elePos.a,
                        imgthis.x = fx, imgthis.y = fy;

                    stage.swapChildren(imgthis, bg);
                    stage.addChild(imgthis);

                    // stage.swapChildren(bg, imgthis);
                    stage.update();
                }, 200)

            }
            else {
                alertMsg("请求服务失败");
            }
        }
    }

};

// 生成图片
document.getElementById('make_sure_send').onclick = function () {
    var getCanvas = document.getElementById('demoCanvas');
    var context = getCanvas.getContext('2d');
    var inputimg = document.getElementById('inputimg').value;
    console.log(inputimg)
    if (inputimg != '') {

        // var imgDatadahe = getCanvas.toDataURL().replace("image/png", "image/octet-stream");
        var imgDatadahe = getCanvas.toDataURL()
        console.log('imgDatadahe：' + imgDatadahe)
        // document.getElementById('show').src = imgDatadahe;
        console.log('imgDatadahe：' + imgDatadahe);

        var data = {"imgDatadahe": imgDatadahe};
        // var formData = new FormData();
        // formData.append('file', imgDatadahe);
        var ajax = new XMLHttpRequest();
        ajax.open("POST", "/send_data", true);
        ajax.send(postDataFormat(data));
        ajax.onreadystatechange = function () {
			console.log(ajax.readyState);
			alertMsg("1234566777");
            if (ajax.readyState == 4) {
                if (ajax.status >= 200 && ajax.status < 300 || ajax.status == 304) {
                    alertMsg("上传成功");
                }
				else
				{
					alertMsg("上传失败，请检查接口");
				}
            }
        }

    } else {
        alertMsg('请上传图片');
    }

}

function postDataFormat(obj) {
    if (typeof obj != "object") {
        alert("输入的参数必须是对象");
        return;
    }

    // 支持有FormData的浏览器（Firefox 4+ , Safari 5+, Chrome和Android 3+版的Webkit）
    if (typeof FormData == "function") {
        var data = new FormData();
        for (var attr in obj) {
            data.append(attr, obj[attr]);
        }
        return data;
    }
    else {
        // 不支持FormData的浏览器的处理
        var arr = new Array();
        var i = 0;
        for (var attr in obj) {
            arr[i] = encodeURIComponent(attr) + "=" + encodeURIComponent(obj[attr]);
            i++;
        }
        return arr.join("&");
    }
}

function isAndroid() {
    var u = navigator.userAgent;
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
    return isAndroid;
}

function change_bg(bg_item) {
    //stage.removeChild(bg);
     stage.removeAllChildren()
    var bg_data = ""
    if (bg_item == 1) {
        bg_data = bg_data_1
    }
    else if (bg_item == 2) {
        bg_data = bg_data_2
    }
    else if (bg_item == 3) {
        bg_data = bg_data_3
    }
    else if (bg_item == 4) {
        bg_data = bg_data_4
    }
	 else if (bg_item == 5) {
        bg_data = bg_data_5
    }
    else if (bg_item == 6) {
        bg_data = bg_data_6
    }
    else if (bg_item == 7) {
        bg_data = bg_data_7
    }
	 else if (bg_item == 8) {
        bg_data = bg_data_8
    }


    var bg = new createjs.Bitmap(bg_data); //创建背景图

    var bg_image = new Image();

    var bg_x = "", bg_y = ""


    bg_image.src = bg_data;

    bg_image.onload = function () {
        var div_width = $("#demoCanvas").width();			//屏幕宽度
        var div_height = $("#demoCanvas").height();
        var old_width = bg_image.width;						//小月亮实际宽度
        var old_height = bg_image.height;					//小月亮实际高度
        // var scale_x=div_width*old_width/old_height;
        // var scale_y=div_width*old_height/old_width;
        console.log('old_width:' + old_width + '  old_height:' + old_height);
        console.log('div_width:' + div_width + '  div_height:' + div_height);

        // var scale_x=div_width*old_width/old_height;
        // var scale_y=div_width*old_height/old_width;

        // if (div_width > old_width) {
            // bg_x = (scale_x - old_width / 2) / 2 ;
            // bg_y = (scale_y - old_height / 2) / 2 ;
        // }
        // else {
            // bg_x = 20 ;
            // bg_y = 20 ;
        // }
		
		
		var moon_scale_x = 1.4;
		var moon_scale_y = 1.4;
		
		var moon_w = old_width * moon_scale_x;
		var moon_h = old_height * moon_scale_y;
		
		var moon_x = bg_center_x - moon_w/2;
		var moon_y = bg_center_y - moon_h/2;
		

       // console.log('scale_x:' + scale_x + ' ,scale_y:' + bg_y);
       // console.log('bg_x:' + bg_x + ' ,bg_y:' + bg_y);

        bg.regX = 0,
            bg.regY = 0,
            bg.x = moon_x,
            bg.y = moon_y,
            bg.scaleX = moon_scale_x,
            bg.scaleY = moon_scale_y
        ; //设置背景图位置
        // bg.alpha = 0.5
        stage.addChild(bg); //放置背景图到canvas画布
        stage.swapChildren(imgthis, bg);
        stage.addChild(imgthis);
        stage.update();
    };
}

function select_yes_no(obj, item) {
    console.log(obj.checked)
    console.log($(obj))
    console.log($(obj).parent().addClass("select"))
    // $(this).parent().removeClass("select_no").addClass("select_yes")
    $(".select_css").removeClass("select");
    if (obj.checked == true) {
        $(obj).parent().addClass("select");
        console.log("item:" + item)
        change_bg(item)
    }
}

$(function () {
    $(document).on("click", ".bg_0", function () {
        $(".select_css").removeClass("select");
        $(this).children("div").addClass("select")
        change_bg($(this).attr('data-id'))
    });
})

/**
 * 把图片处理成圆形,如果不是正方形就按最小边一半为半径处理
 * @param  {object} imgObj 图片(img)对象
 * @param  {number} imgType 设置生成图片的大小：0设置生成的图片大小是以图片设置的css大小为准，1设置生成的图片大小是以图片分辨率为准，默认值为0
 * @return {string}     return base64 png图片字符串
 */
function circle_image_v2(img, imgType) {
    var type = imgType || 0;
    var radius, diameter, canvas, ctx, natural;
    if (type) {
        if (img.naturalWidth > img.naturalHeight) {
            radius = img.naturalHeight / 2;
        } else {
            radius = img.naturalWidth / 2;
        }
    } else {
        if (img.width > img.height) {
            radius = img.height / 2;
        } else {
            radius = img.width / 2;
        }
        if (img.naturalWidth > img.naturalHeight) {
            natural = img.naturalHeight;
        } else {
            natural = img.naturalWidth;
        }
    }
    diameter = radius * 2;
    canvas = document.createElement('canvas');
    if (!canvas.getContext) { // 判断浏览器是否支持canvas，如果不支持在此处做相应的提示
        console.log('您的浏览器版本过低，暂不支持。');
        return false;
    }
    canvas.width = diameter;
    canvas.height = diameter;
    contex = canvas.getContext("2d");
    contex.clearRect(0, 0, diameter, diameter);
    contex.save();
    contex.beginPath();
    contex.arc(radius, radius, radius, 0, Math.PI * 2, false);
    contex.clip();
    if (type) {
        contex.drawImage(img, 0, 0, diameter, diameter, 0, 0, diameter, diameter);
    } else {
        contex.drawImage(img, 0, 0, natural, natural, 0, 0, diameter, diameter);
    }
    contex.restore();
    return canvas.toDataURL('image/png');
}

change_bg(1)
