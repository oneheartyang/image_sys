window.alertMsg = function (txt) {
    var alertFram = document.createElement("DIV");
    alertFram.id = "alertFram";
    alertFram.style.position = "fixed";
    alertFram.style.width = "100%";
    alertFram.style.textAlign = "center";
    alertFram.style.top = "40%";
    alertFram.style.zIndex = "10001";
    strHtml = " <span style=\"font-family: 微软雅黑;display:inline-block;background:#333;color:#fff;padding:0 20px;line-height:36px;border-radius:6px; \">" + txt + "</span>";
    alertFram.innerHTML = strHtml;
    document.body.appendChild(alertFram);
    setTimeout((function () {
        alertFram.style.display = "none";
    }), 2000);
};