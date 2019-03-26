from flask import Flask, render_template, jsonify, make_response, request
from werkzeug.utils import secure_filename
from PIL import Image
# import os, math,cv2, numpy as np
import os
import base64
import re
import time
import socket

app = Flask(__name__)

basedir = os.path.dirname(__file__)
resource_dir_path = os.path.join(basedir, 'resource')

udp_conf = {
    'ip': '127.0.0.1',
    'port': 9999
}


@app.route('/')
def hello_world():
    return 'Hello World!'


@app.route('/index')
def login():
    return render_template('index.html')


@app.route('/h5')
def h5():
    return render_template('h5.html')


@app.route('/h5_1')
def h5_1():
    return render_template('h5_1.html')


@app.route('/demo')
def demo():
    return render_template('demo.html')


@app.route('/base64')
def base64_1():
    return render_template('base64.html')


@app.route('/uploadFile', methods=['GET', 'POST'])
def uploadFile():
    if request.method in ['GET', 'DELETE']:
        request_param = request.files['file']
    else:
        # 取表单中的数据
        request_param = request.files['file']
        if not request_param:
            # 取json数据 Content-Type=application/json
            request_param = request.json

    file = request.files['file']
    filename = secure_filename(file.filename)
    # # f.save(os.path.join('app/static',filename))
    print(file.filename)
    # file.save('E://' + str(filename))
    filename = filename.rsplit('.', 1)[0] + ".png"
    filepath = os.path.join(resource_dir_path, filename)
    file.save(filepath)

    # combine_image(filename, filepath)

    response = {
        "code": 0,
        "msg": "success",
    }
    return jsonify(response)


@app.route('/uploadImage', methods=['GET', 'POST'])
def uploadImage():
    if request.method in ['GET', 'DELETE']:
        param_dict = request.args.to_dict()
    else:
        # 取表单中的数据
        param_dict = request.form.to_dict()
        if not param_dict:
            # 取json数据 Content-Type=application/json
            param_dict = request.json

    image = param_dict.get('imgDatadahe')
    strs = re.match('^data:image/(jpeg|png|gif);base64,', image)
    suffix = strs.groups()[0]

    image = image.replace(strs.group(), '')
    imgdata = base64.b64decode(image)

    a, b = str(time.time()).split(".")
    file_path = os.path.join(resource_dir_path, a + '.' + suffix)
    print(file_path)

    with open(file_path, 'wb') as f:
        f.write(imgdata)
    
    # send_udp_socker()

    response = {
        "code": 0,
        "msg": "success",
    }
    return jsonify(response)


def add_transparency(img, factor=0.7):
    """
    设置透明度
    :param img:
    :param factor:
    :return:
    """
    img = img.convert('RGBA')
    img_blender = Image.new('RGBA', img.size, (0, 0, 0, 0))
    img = Image.blend(img_blender, img, factor)

    return img


def circle(img):
    """
    原图转成圆形图
    :param img:
    """

    img = img.convert('RGBA')
    size = img.size
    print(size)

    r2 = min(size[0], size[1])
    if size[0] != size[1]:
        img = img.resize((r2, r2), Image.ANTIALIAS)

    r = float(r2 / 2)  # 圆心横坐标
    r3 = int(r)
    imb = Image.new('RGBA', (r3 * 2, r3 * 2), (255, 255, 255, 0))
    pima = img.load()  # 像素的访问对象
    pimb = imb.load()

    for i in range(r2):
        for j in range(r2):
            lx = abs(i - r)  # 到圆心距离的横坐标
            ly = abs(j - r)  # 到圆心距离的纵坐标
            l = (pow(lx, 2) + pow(ly, 2)) ** 0.5  # 三角函数 半径

            if l < r3:
                pimb[i - (r - r3), j - (r - r3)] = pima[i, j]
    imb.save(os.path.join(resource_dir_path, "test_circle.png"))
    # return imb


def combine_image(filename, filepath):
    """
    demo: https://www.cnblogs.com/sun-haiyu/p/7127582.html
    :param filename:
    :param filepath:
    :return:
    """
    back_image_name = "月亮1"
    suffix = ".png"
    # base_image = Image.open(os.path.join(resource_dir_path, "background_2.png"))
    base_image = Image.open(os.path.join(resource_dir_path, back_image_name + suffix))
    # 图像中左上角是坐标原点(0, 0)
    # 元组参数包含四个值，分别代表矩形四条边的距离X轴或者Y轴的距离。
    # 顺序是(左，顶，右，底)
    # box = (340, 130, 640, 680)  # 底图上需要P掉的区域
    # box = (20, 20, 125, 125)  # 底图上需要P掉的区域
    # box = (166, 64, 320, 337)  # 区域
    size = base_image.size
    box = (60, 60, size[0] - 60, size[1] - 60)  # 区域

    tmp_image = Image.open(filepath)
    circle(tmp_image)

    tmp_image = Image.open(os.path.join(resource_dir_path, "test_circle.png"))

    # tmp_image = add_transparency(tmp_image, factor=0.5)
    # region = tmp_image
    # region = tmp_image.crop((0, 0, 304, 546))
    # 调整图像的大小
    # region = region.resize((box[2] - box[0], box[3] - box[1]))
    #
    # base_image.paste(region, box)
    # base_image.save(os.path.join(resource_dir_path, "out_" + filename))

    target = Image.new('RGBA', base_image.size, (0, 0, 0, 0))
    region = tmp_image
    # region = region.rotate(180)  # 旋转180度

    region = region.convert("RGBA")
    region = region.resize((box[2] - box[0], box[3] - box[1]))
    target.paste(region, box)

    base_image = add_transparency(base_image, factor=0.7)

    target.paste(base_image, (0, 0), base_image)
    target.save(os.path.join(resource_dir_path, "out_" + back_image_name + "_" + filename))


# @app.route('/test_cv2', methods=['GET', 'POST'])
# def combine_by_cv2():
#     img = cv2.imread(os.path.join(resource_dir_path, "2.jpg"))
#     co = cv2.imread(os.path.join(resource_dir_path, "1.png"), -1)
#
#     scr_channels = cv2.split(co)
#     dstt_channels = cv2.split(img)
#
#     b, g, r, a = cv2.split(co)
#     for i in range(3):
#         dstt_channels[i][100:200, 300:400] = dstt_channels[i][100:200, 300:400] * (255.0 - a) / 255
#         dstt_channels[i][100:200, 300:400] += np.array(scr_channels[i] * (a / 255), dtype=np.uint8)
#
#     cv2.imwrite("img_target.png", cv2.merge(dstt_channels))
#
#     response = {
#         "code": 0,
#         "msg": "success",
#     }
#     return jsonify(response)


def transPng(srcImageName, dstImageName):
    img = Image.open(srcImageName)
    img = img.convert("RGBA")
    datas = img.getdata()
    newData = list()
    for item in datas:
        print(item)
        if item[0] > 220 and item[1] > 220 and item[2] > 220:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(dstImageName, "PNG")


def send_udp_socker(data):
    """
    发送一个 udp 协议数据
    :param data:
    """
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.sendto(data, (udp_conf.get('ip'), int(udp_conf.get('port'))))
    result = s.recv(1024).decode('utf-8')
    print(result)
    s.close()


@app.route('/transPng', methods=['GET', 'POST'])
def test_transPng():
    # transPng(
    #     os.path.join(resource_dir_path, "20190117144310.png"),
    #     os.path.join(resource_dir_path, "trans.png"))
    imp = Image.open(os.path.join(resource_dir_path, "background_2.png"))
    imq = Image.open(os.path.join(resource_dir_path, "20190117144310.png"))
    r, g, b = imq.split()

    imp.paste(imq, (100, 100, 171, 172), mask=r)

    imp.save(os.path.join(resource_dir_path, "out_test.png"))
    response = {
        "code": 0,
        "msg": "success",
    }
    return jsonify(response)


@app.after_request
def af_request(resp):
    """
    #请求钩子，在所有的请求发生后执行，加入headers。
    :param resp:
    :return:
    """
    resp = make_response(resp)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET,POST'
    resp.headers['Access-Control-Allow-Headers'] = 'x-requested-with,content-type'
    return resp


if __name__ == '__main__':
    app.run('0.0.0.0', 9905)
